import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import ProfileEditTab from '../components/profile/ProfileEditTab';
import ProfileImpactTab from '../components/profile/ProfileImpactTab';
import useFormSubmitHandler from '../forms/useFormSubmitHandler';
import { DEFAULT_STALE_TIME_MS } from '../queries/queryDefaults';
import api, { endpoints } from '../requests';
import { useFileUploadService } from '../service/useFileUploadService';
import {
  buildProfileUpdatePayloadFromProfile,
  getApiErrorMessage,
  mapProfileToFormValues,
  normalizeOptional,
  processImageForUpload,
  sanitizeLevelDto,
  toNonNegativeInt,
  validateProfilePictureSourceFile,
} from '../util';

const DEFAULT_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7cbnwFcAoyOb5pOj744xfX7_cAy6Ugq1YRcDnUrEVaKSYqKlk4ZzDZw9sBVYTIHe_EBpEwhbBrT7l2rAcru-k3g_b8YkjAPWe_T42Hju-7OT_JINXzdE-jt0zyjKnnAIes_8YKHehNzLb-FExOKEGuhtu_gYOd2tjcvniKNxYzKjtTk9GWEessHgFR879XlRoXkoNIs0pzZMTSpRV7oIH5dogZfvbD8FEGA4CpkaLtBbAAyufOoeBrCe1-yxJfqJkycLR5BBaro8f';

const emptyForm = {
  firstName: '',
  lastName: '',
  telefon: '',
  dateOfBirth: '',
  address: '',
  bio: '',
  cnp: '',
  sex: '',
  profilePictureUrl: '',
};

const DEFAULT_LEVEL = {
  currentLevel: 1,
  currentXP: 0,
  nextLevelXP: 100,
  progressPercent: 0,
};

const ImageCropDialog = lazy(() => import('../components/image/ImageCropDialog'));

const fetchUserLevel = async (userId) => {
  const { data } = await api.get(endpoints.usersLevel(userId));
  return sanitizeLevelDto(data);
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const profilePictureInputRef = useRef(null);
  const pendingSourceImageUrlRef = useRef('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isPersistingUploadedPicture, setIsPersistingUploadedPicture] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [pendingSourceFile, setPendingSourceFile] = useState(null);
  const [pendingSourceImageUrl, setPendingSourceImageUrl] = useState('');
  const [isProcessingPicture, setIsProcessingPicture] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const fileUploadMutation = useFileUploadService();
  const { isPending: isUploadingPicture, mutateAsync: uploadProfilePicture } = fileUploadMutation;

  const form = useForm({
    defaultValues: emptyForm,
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');

      const normalizedCnp = value.cnp.trim();

      try {
        await updateProfile({
          firstName: normalizeOptional(value.firstName),
          lastName: normalizeOptional(value.lastName),
          telefon: normalizeOptional(value.telefon),
          dateOfBirth: value.dateOfBirth || null,
          address: normalizeOptional(value.address),
          bio: normalizeOptional(value.bio),
          cnp: normalizedCnp || null,
          sex: value.sex || null,
          profilePictureUrl: normalizeOptional(value.profilePictureUrl),
        });
        setSuccess('Profile updated successfully.');
      } catch (submitError) {
        setError(getApiErrorMessage(submitError, 'Could not update profile. Please try again.'));
      }
    },
  });

  useEffect(() => {
    form.reset(mapProfileToFormValues(user?.userProfile), { keepDefaultValues: true });
  }, [form, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fallbackLevel = useMemo(() => {
    if (user?.currentLevel == null && user?.currentXP == null && user?.nextLevelXP == null) {
      return null;
    }

    return sanitizeLevelDto({
      currentLevel: user?.currentLevel,
      currentXP: user?.currentXP,
      nextLevelXP: user?.nextLevelXP,
    });
  }, [user?.currentLevel, user?.currentXP, user?.nextLevelXP]);

  const { data: levelFromApi, error: levelError, isLoading: isLevelLoading } = useQuery({
    queryKey: ['users', user?.id, 'level'],
    enabled: Boolean(user?.id),
    staleTime: DEFAULT_STALE_TIME_MS,
    queryFn: () => fetchUserLevel(user.id),
  });

  const resolvedLevel = levelFromApi || fallbackLevel || DEFAULT_LEVEL;
  const hasFallbackLevel = Boolean(fallbackLevel);
  const progressPercent = useMemo(() => {
    const fallbackPercent =
      resolvedLevel.nextLevelXP > 0 ? Math.floor((resolvedLevel.currentXP * 100) / resolvedLevel.nextLevelXP) : 0;
    return Math.max(0, Math.min(100, toNonNegativeInt(resolvedLevel.progressPercent, fallbackPercent)));
  }, [resolvedLevel.currentXP, resolvedLevel.nextLevelXP, resolvedLevel.progressPercent]);
  const shouldShowLevelLoadingMessage = isLevelLoading && !hasFallbackLevel;
  const shouldShowLevelErrorMessage = Boolean(levelError);
  const levelErrorMessage = hasFallbackLevel
    ? 'Live level data is temporarily unavailable. Showing your last known values.'
    : 'Live level data is temporarily unavailable. Showing default values.';

  const firstName = useStore(form.store, (state) => state.values.firstName);
  const lastName = useStore(form.store, (state) => state.values.lastName);
  const profilePictureUrl = useStore(form.store, (state) => state.values.profilePictureUrl);

  const displayName = useMemo(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }
    return user?.email || 'Profile';
  }, [firstName, lastName, user?.email]);

  const avatarUrl = profilePictureUrl.trim() || DEFAULT_AVATAR_URL;
  const isPictureActionPending = isProcessingPicture || isUploadingPicture || isPersistingUploadedPicture;
  const pictureStatusMessage = isProcessingPicture
    ? 'Preparing profile picture...'
    : isUploadingPicture
      ? 'Uploading profile picture...'
      : isPersistingUploadedPicture
        ? 'Saving profile picture...'
        : '';

  const resetPictureFeedback = useCallback(() => {
    setError('');
    setSuccess('');
    setUploadError('');
    setUploadSuccess('');
    setIsPersistingUploadedPicture(false);
  }, []);

  const clearPendingSourceImage = useCallback(() => {
    if (pendingSourceImageUrlRef.current) {
      URL.revokeObjectURL(pendingSourceImageUrlRef.current);
      pendingSourceImageUrlRef.current = '';
    }
    setPendingSourceImageUrl('');
    setPendingSourceFile(null);
  }, []);

  const setPendingSourceImage = (selectedFile) => {
    const sourceImageUrl = URL.createObjectURL(selectedFile);
    if (pendingSourceImageUrlRef.current) {
      URL.revokeObjectURL(pendingSourceImageUrlRef.current);
    }

    pendingSourceImageUrlRef.current = sourceImageUrl;
    setPendingSourceFile(selectedFile);
    setPendingSourceImageUrl(sourceImageUrl);
  };

  useEffect(
    () => () => {
      if (pendingSourceImageUrlRef.current) {
        URL.revokeObjectURL(pendingSourceImageUrlRef.current);
      }
    },
    [],
  );

  const handleProfilePictureUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';
    if (!selectedFile) {
      return;
    }

    resetPictureFeedback();
    setIsProcessingPicture(false);

    try {
      validateProfilePictureSourceFile(selectedFile);
      setPendingSourceImage(selectedFile);
      setIsCropDialogOpen(true);
    } catch (validationFailure) {
      clearPendingSourceImage();
      setIsCropDialogOpen(false);
      setUploadError(getApiErrorMessage(validationFailure, 'Could not process profile picture.'));
    }
  };

  const handleCropDialogCancel = useCallback(() => {
    if (isProcessingPicture) {
      return;
    }

    setIsCropDialogOpen(false);
    clearPendingSourceImage();
  }, [clearPendingSourceImage, isProcessingPicture]);

  const handleCropDialogConfirm = useCallback(
    async (cropAreaPixels) => {
      if (!pendingSourceFile) {
        return;
      }

      resetPictureFeedback();
      setIsProcessingPicture(true);

      let processedFile = null;

      try {
        processedFile = await processImageForUpload({
          file: pendingSourceFile,
          cropAreaPixels,
        });
      } catch (processingFailure) {
        setUploadError(
          getApiErrorMessage(
            processingFailure,
            'Could not process profile picture. Please try a different image.',
          ),
        );
        setIsProcessingPicture(false);
        setIsCropDialogOpen(false);
        clearPendingSourceImage();
        return;
      }

      setIsProcessingPicture(false);
      setIsCropDialogOpen(false);
      clearPendingSourceImage();

      try {
        const { fileUrl } = await uploadProfilePicture(processedFile);
        form.setFieldValue('profilePictureUrl', fileUrl);

        setIsPersistingUploadedPicture(true);
        try {
          await updateProfile(buildProfileUpdatePayloadFromProfile(user?.userProfile, fileUrl));
          setUploadSuccess('Profile picture updated successfully.');
        } catch (persistError) {
          setUploadError(
            getApiErrorMessage(
              persistError,
              'Profile picture uploaded, but profile update failed. Please try again.',
            ),
          );
        } finally {
          setIsPersistingUploadedPicture(false);
        }
      } catch (uploadFailure) {
        setUploadError(getApiErrorMessage(uploadFailure, 'Could not upload profile picture. Please try again.'));
      }
    },
    [
      clearPendingSourceImage,
      form,
      pendingSourceFile,
      resetPictureFeedback,
      uploadProfilePicture,
      updateProfile,
      user?.userProfile,
    ],
  );

  const handleAvatarClick = () => {
    if (isPictureActionPending) {
      return;
    }
    profilePictureInputRef.current?.click();
  };

  const handleSubmit = useFormSubmitHandler(form);

  const inputClassName =
    'block w-full px-3 py-3 border border-cusens-border rounded-xl leading-5 bg-cusens-bg text-cusens-text-primary placeholder-cusens-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-cusens-primary sm:text-sm transition duration-200 ease-in-out';

  const isEditTabActive = activeTab === 'edit';
  const isImpactTabActive = activeTab === 'impact';

  return (
    <div className="bg-cusens-bg font-display flex items-start justify-center lg:px-6 lg:py-6 xl:px-10">
      <div className="w-full max-w-md lg:max-w-4xl xl:max-w-5xl bg-cusens-surface rounded-3xl shadow-xl overflow-hidden border border-cusens-border relative flex flex-col">
        <main className="flex-1 overflow-y-auto px-6 pb-24 pt-6 lg:px-10 lg:pb-12 lg:pt-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 lg:gap-5">
            <input
              ref={profilePictureInputRef}
              id="profilePictureFile"
              name="profilePictureFile"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              disabled={isPictureActionPending}
              className="hidden"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isPictureActionPending}
              aria-label="Change profile picture"
              className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:ring-offset-2 focus:ring-offset-cusens-surface disabled:cursor-not-allowed disabled:opacity-80"
            >
              <span className="block h-28 w-28 overflow-hidden rounded-full border-4 border-cusens-primary shadow-md transition-transform duration-200 group-hover:scale-[1.03]">
                <img src={avatarUrl} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
              </span>
              <span className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cusens-surface bg-cusens-primary text-cusens-text-primary shadow-md">
                <span className="material-icons text-[18px]">photo_camera</span>
              </span>
            </button>
            <p className="text-cusens-text-secondary text-xs font-semibold uppercase tracking-wide">Tap avatar to change photo</p>
            <div className="flex flex-col items-center justify-center">
              <p className="text-cusens-text-primary text-xl font-bold leading-tight text-center">{displayName}</p>
              <p className="text-cusens-text-secondary text-sm font-medium text-center">
                Level {resolvedLevel.currentLevel}
              </p>
              <p className="text-cusens-text-secondary text-sm font-medium text-center">{user?.code}</p>
            </div>
            <div className="w-full max-w-xs lg:max-w-md flex flex-col gap-2">
              <div className="flex w-full justify-between items-center gap-3">
                <p className="text-cusens-text-secondary text-xs font-semibold uppercase tracking-wide">Next Level</p>
                <p className="text-cusens-text-primary text-sm font-bold">
                  {resolvedLevel.currentXP} / {resolvedLevel.nextLevelXP} XP
                </p>
              </div>
              <div className="rounded-full bg-gray-200 h-2.5 shadow-inner">
                <div className="h-full rounded-full bg-cusens-primary" style={{ width: `${progressPercent}%` }}></div>
              </div>
              {shouldShowLevelLoadingMessage && (
                <p className="text-xs text-cusens-text-secondary">Loading level data...</p>
              )}
              {shouldShowLevelErrorMessage && <p className="text-xs text-amber-700">{levelErrorMessage}</p>}
            </div>
            <div className="w-full max-w-xs lg:max-w-md text-center">
              {pictureStatusMessage && <p className="text-sm text-cusens-text-secondary">{pictureStatusMessage}</p>}
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
              {uploadSuccess && <p className="text-sm text-green-600">{uploadSuccess}</p>}
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl pt-6 lg:pt-8">
            <div
              role="tablist"
              aria-label="Profile sections"
              className="grid grid-cols-2 gap-2 rounded-2xl border border-cusens-border bg-cusens-bg p-1"
            >
              <button
                type="button"
                role="tab"
                id="profile-tab-edit"
                aria-selected={isEditTabActive}
                aria-controls="profile-panel-edit"
                onClick={() => setActiveTab('edit')}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:ring-offset-2 focus:ring-offset-cusens-surface ${
                  isEditTabActive
                    ? 'bg-cusens-primary text-cusens-text-primary shadow-sm'
                    : 'text-cusens-text-secondary hover:bg-white hover:text-cusens-text-primary'
                }`}
              >
                Edit Profile
              </button>
              <button
                type="button"
                role="tab"
                id="profile-tab-impact"
                aria-selected={isImpactTabActive}
                aria-controls="profile-panel-impact"
                onClick={() => setActiveTab('impact')}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:ring-offset-2 focus:ring-offset-cusens-surface ${
                  isImpactTabActive
                    ? 'bg-cusens-primary text-cusens-text-primary shadow-sm'
                    : 'text-cusens-text-secondary hover:bg-white hover:text-cusens-text-primary'
                }`}
              >
                Impact & Achievements
              </button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            {isEditTabActive ? (
              <ProfileEditTab
                form={form}
                handleSubmit={handleSubmit}
                inputClassName={inputClassName}
                error={error}
                success={success}
                isPictureActionPending={isPictureActionPending}
              />
            ) : (
              <ProfileImpactTab />
            )}
          </div>
        </main>
      </div>
      {isCropDialogOpen && (
        <Suspense
          fallback={(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl bg-cusens-surface px-4 py-3 text-sm font-semibold text-cusens-text-primary shadow-xl"
              >
                Loading image editor...
              </div>
            </div>
          )}
        >
          <ImageCropDialog
            open={isCropDialogOpen}
            imageSrc={pendingSourceImageUrl}
            aspect={1}
            isProcessing={isProcessingPicture}
            onCancel={handleCropDialogCancel}
            onConfirm={handleCropDialogConfirm}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Profile;
