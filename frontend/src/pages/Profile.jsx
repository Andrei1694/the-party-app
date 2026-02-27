import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { useAuth } from '../auth/AuthContext';
import getFieldError from '../forms/getFieldError';
import useFormSubmitHandler from '../forms/useFormSubmitHandler';
import { useFileUploadService } from '../service/useFileUploadService';

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

const cnpRegex = /^\d{13}$/;

const getBackendErrorMessage = (error, fallbackMessage) => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    (typeof error?.response?.data === 'string' ? error.response.data : null);

  return backendMessage || error?.message || fallbackMessage;
};

const mapProfileToFormValues = (profile) => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  telefon: profile?.telefon ?? '',
  dateOfBirth: profile?.dateOfBirth ?? '',
  address: profile?.address ?? '',
  bio: profile?.bio ?? '',
  cnp: profile?.cnp ?? '',
  sex: profile?.sex ?? '',
  profilePictureUrl: profile?.profilePictureUrl ?? '',
});

const normalizeOptional = (value) => {
  if (value == null) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const buildProfileUpdatePayloadFromProfile = (profile, profilePictureUrlOverride) => ({
  firstName: normalizeOptional(profile?.firstName ?? ''),
  lastName: normalizeOptional(profile?.lastName ?? ''),
  telefon: normalizeOptional(profile?.telefon ?? ''),
  dateOfBirth: profile?.dateOfBirth || null,
  address: normalizeOptional(profile?.address ?? ''),
  bio: normalizeOptional(profile?.bio ?? ''),
  cnp: normalizeOptional(profile?.cnp ?? ''),
  sex: profile?.sex || null,
  profilePictureUrl: normalizeOptional(
    profilePictureUrlOverride === undefined ? profile?.profilePictureUrl ?? '' : profilePictureUrlOverride,
  ),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const profilePictureInputRef = useRef(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isPersistingUploadedPicture, setIsPersistingUploadedPicture] = useState(false);
  const fileUploadMutation = useFileUploadService();

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
        setError(getBackendErrorMessage(submitError, 'Could not update profile. Please try again.'));
      }
    },
  });

  useEffect(() => {
    form.reset(mapProfileToFormValues(user?.userProfile), { keepDefaultValues: true });
  }, [form, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const formValues = useStore(form.store, (state) => state.values);

  const displayName = useMemo(() => {
    const fullName = `${formValues.firstName} ${formValues.lastName}`.trim();
    if (fullName) {
      return fullName;
    }
    return user?.email || 'Profile';
  }, [formValues.firstName, formValues.lastName, user?.email]);

  const avatarUrl = formValues.profilePictureUrl.trim() || DEFAULT_AVATAR_URL;
  const isUploadingPicture = fileUploadMutation.isPending;
  const isPictureActionPending = isUploadingPicture || isPersistingUploadedPicture;
  const pictureStatusMessage = isUploadingPicture
    ? 'Uploading profile picture...'
    : isPersistingUploadedPicture
      ? 'Saving profile picture...'
      : '';

  const handleProfilePictureUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';
    if (!selectedFile) {
      return;
    }

    setError('');
    setSuccess('');
    setUploadError('');
    setUploadSuccess('');
    setIsPersistingUploadedPicture(false);

    try {
      const { fileUrl } = await fileUploadMutation.mutateAsync(selectedFile);
      form.setFieldValue('profilePictureUrl', fileUrl);

      setIsPersistingUploadedPicture(true);
      try {
        await updateProfile(buildProfileUpdatePayloadFromProfile(user?.userProfile, fileUrl));
        setUploadSuccess('Profile picture updated successfully.');
      } catch (persistError) {
        setUploadError(
          getBackendErrorMessage(
            persistError,
            'Profile picture uploaded, but profile update failed. Please try again.',
          ),
        );
      } finally {
        setIsPersistingUploadedPicture(false);
      }
    } catch (uploadFailure) {
      setUploadError(getBackendErrorMessage(uploadFailure, 'Could not upload profile picture. Please try again.'));
    }
  };

  const handleAvatarClick = () => {
    if (isPictureActionPending) {
      return;
    }
    profilePictureInputRef.current?.click();
  };

  const handleSubmit = useFormSubmitHandler(form);

  const inputClassName =
    'block w-full px-3 py-3 border border-cusens-border rounded-xl leading-5 bg-cusens-bg text-cusens-text-primary placeholder-cusens-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-cusens-primary sm:text-sm transition duration-200 ease-in-out';

  return (
    <div className="bg-cusens-bg font-display flex items-start justify-center">
      <div className="w-full max-w-md bg-cusens-surface rounded-3xl shadow-xl overflow-hidden border border-cusens-border relative flex flex-col">
        <main className="flex-1 overflow-y-auto px-6 pb-24 pt-6">
          <div className="flex flex-col items-center gap-4">
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
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 shadow-md border-4 border-cusens-primary/15 transition-transform duration-200 group-hover:scale-[1.03]"
                data-alt="User avatar"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              ></div>
              <span className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cusens-surface bg-cusens-primary text-cusens-text-primary shadow-md">
                <span className="material-icons text-[18px]">photo_camera</span>
              </span>
            </button>
            <p className="text-cusens-text-secondary text-xs font-semibold uppercase tracking-wide">Tap avatar to change photo</p>
            <div className="flex flex-col items-center justify-center">
              <p className="text-cusens-text-primary text-xl font-bold leading-tight text-center">{displayName}</p>
              <p className="text-cusens-text-secondary text-sm font-medium text-center">Level 5 - Active Citizen</p>
              <p className="text-cusens-text-secondary text-sm font-medium text-center">{user?.code}</p>
            </div>
            <div className="w-full max-w-xs text-center">
              {pictureStatusMessage && <p className="text-sm text-cusens-text-secondary">{pictureStatusMessage}</p>}
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
              {uploadSuccess && <p className="text-sm text-green-600">{uploadSuccess}</p>}
            </div>
          </div>

          <section className="pt-6">
            <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Edit Profile</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field name="firstName">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="firstName">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        className={inputClassName}
                        placeholder="First name"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="lastName">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="lastName">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        className={inputClassName}
                        placeholder="Last name"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field name="telefon">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="telefon">
                        Phone
                      </label>
                      <input
                        id="telefon"
                        name="telefon"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        className={inputClassName}
                        placeholder="Phone number"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="dateOfBirth">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="dateOfBirth">
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field name="sex">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="sex">
                        Sex
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        className={inputClassName}
                      >
                        <option value="">Not specified</option>
                        <option value="M">Male (M)</option>
                        <option value="F">Female (F)</option>
                        <option value="O">Other (O)</option>
                      </select>
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="cnp"
                  validators={{
                    onChange: ({ value }) => {
                      const normalizedCnp = value.trim();
                      if (normalizedCnp && !cnpRegex.test(normalizedCnp)) {
                        return 'CNP must contain exactly 13 digits.';
                      }
                      return undefined;
                    },
                    onSubmit: ({ value }) => {
                      const normalizedCnp = value.trim();
                      if (normalizedCnp && !cnpRegex.test(normalizedCnp)) {
                        return 'CNP must contain exactly 13 digits.';
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="cnp">
                        CNP
                      </label>
                      <input
                        id="cnp"
                        name="cnp"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        className={inputClassName}
                        placeholder="13 digits"
                        maxLength={13}
                      />
                      {getFieldError(field.state.meta.errors) && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError(field.state.meta.errors)}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="address">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="address">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      className={`${inputClassName} min-h-20`}
                      placeholder="Address"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="bio">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="bio">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      className={`${inputClassName} min-h-24`}
                      placeholder="Tell people a bit about yourself"
                    />
                  </div>
                )}
              </form.Field>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              {success && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
                {({ isSubmitting, canSubmit }) => (
                  <button
                    type="submit"
                    disabled={isSubmitting || !canSubmit || isPictureActionPending}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-cusens-text-primary bg-cusens-primary hover:bg-cusens-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                )}
              </form.Subscribe>
            </form>
          </section>

          <div className="flex flex-col gap-2 pt-6">
            <div className="flex justify-between items-center">
              <p className="text-cusens-text-secondary text-xs font-semibold uppercase tracking-wide">Next Level</p>
              <p className="text-cusens-text-primary text-sm font-bold">1200 / 2000 XP</p>
            </div>
            <div className="rounded-full bg-gray-200 h-2.5 shadow-inner">
              <div className="h-full rounded-full bg-cusens-primary" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Impact Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <span className="material-icons text-cusens-primary text-3xl mb-2">how_to_vote</span>
                <p className="text-xl font-bold text-cusens-text-primary">1,250</p>
                <p className="text-xs text-cusens-text-secondary">Voters Reached</p>
              </div>
              <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <span className="material-icons text-cusens-primary text-3xl mb-2">edit_document</span>
                <p className="text-xl font-bold text-cusens-text-primary">82</p>
                <p className="text-xs text-cusens-text-secondary">Petitions Signed</p>
              </div>
              <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <span className="material-icons text-cusens-primary text-3xl mb-2">door_front</span>
                <p className="text-xl font-bold text-cusens-text-primary">58</p>
                <p className="text-xs text-cusens-text-secondary">Doors Knocked</p>
              </div>
              <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <span className="material-icons text-cusens-primary text-3xl mb-2">call</span>
                <p className="text-xl font-bold text-cusens-text-primary">312</p>
                <p className="text-xs text-cusens-text-secondary">Calls Made</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-3 text-center items-center">
                <div className="p-2 bg-cusens-bg rounded-full">
                  <div
                    className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-cusens-primary/20"
                    data-alt="Gold medal icon for Phone Bank Pro achievement"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCS2aSZ9sFkCqGyhHaBHebyCZ3--Fuul0H3pZsjlnlolg8YdfICQ9a5_ZXEvjmMN5Z2pC-tidmN2C6orNa2tBmBsiCr76CIOv-QMycUv7iTKvBHmoO_LllWjJDGguNoEa5h7wHSYPwBbaZldQy0zD4QilOzF-cbRsiH53plnFuvU26wXRLsw36olZYM7WTbQ9_Nni_bmeEJ084Vp7x061kulDrhxxmJkl0QXAKrWw2BCVY6X7Ef03gXHhpZHiiR3VrNtCXU46lA0qpk")' }}
                  ></div>
                </div>
                <div>
                  <p className="text-cusens-text-primary text-sm font-bold leading-normal">Phone Bank Pro</p>
                  <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Made 100 calls</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-center items-center">
                <div className="p-2 bg-cusens-bg rounded-full">
                  <div
                    className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-cusens-primary/20"
                    data-alt="Gold medal icon for Community Canvasser achievement"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0DKnFxSviQk0z2Z3TgB2KXp19gCzHmKuaIcJRv9gFyNXVqkFejuAkNBsdi_yuN_yqBgxOUAV-k1Gv8dnBn17ZNuulNCAtkK1xYxKgBzxiat0fGeBCF6KkrP3TJHnMORWnPhK4xYjzwcloLx4DqtIs5UnchmvkrqwR3Ji31D_6qiPQisKUkwZIXQYNbGINzYayPv6zRgQurF7Wxm5RZ-6DodGeBxbIpYP32sCJnx4DgfvFGZxyMMvXXcZaOMqlfRqlQ9j4ouqNr-nN")' }}
                  ></div>
                </div>
                <div>
                  <p className="text-cusens-text-primary text-sm font-bold leading-normal">Community Canvasser</p>
                  <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Knocked on 50 doors</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-center items-center">
                <div className="p-2 bg-cusens-bg rounded-full">
                  <div
                    className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-cusens-primary/20"
                    data-alt="Gold medal icon for Voter Registration Champion achievement"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCHdVIWdWOEQhs5kfOFsh_bomMn05BSyDX94H3jxVbOuU0gXj7p1L66qPAmAKeZxY5VEc35E9N0TTFmkPmwW2M-znSyDA8gcp95focHAk1HG_QSVVEVTIr3Nd_QXQN8h0cPOi4VLe16WHSEIRYGUsc0_NYcHUKzoANz2ciGRW8g3ZST_9KpUrX4ELJLpjs9EEIG5QWD_pA-fO2Peu-IxceuOS09B6jV0P9jsxH5X3rE3o1EdX-BSJPy6DRslKLkuuIreYy6rPp0nt8-")' }}
                  ></div>
                </div>
                <div>
                  <p className="text-cusens-text-primary text-sm font-bold leading-normal">Voter Champion</p>
                  <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Registered 10 voters</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-center items-center opacity-60">
                <div className="p-2 bg-cusens-bg rounded-full">
                  <div
                    className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-gray-200"
                    data-alt="Locked achievement icon"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxUVj0hkk7DDtREAUKXpIYj5MV8h3pLc_v77oWBjPwecxzIsuWM4i9jJayYTy4YOkXrLh1bnjI5tUT1bZ2br2ICyyzS6bAK-2P2Ys4_Xo7bR9qpVfbKsJ2OyD1vWPS4KHkBYEGOYsWfNLHiOnrV22ygsT9ioftCjD65mcq1jugOuOF0ndNAyWQdG_OkxCWHcNDLWOxpDZRo9sbGdssQB_nyoO-IxCylfoPhQEY4Co3MA057DVORwISywL3OuUsU1Ks3f2IWnyxpaWf")' }}
                  ></div>
                </div>
                <div>
                  <p className="text-cusens-text-primary text-sm font-bold leading-normal">First Donation</p>
                  <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Make a donation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Shareable Milestones</h2>
            <div className="space-y-4">
              <div className="bg-cusens-primary text-cusens-text-primary p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
                <span className="material-icons text-4xl mb-3">celebration</span>
                <h3 className="text-xl font-bold">First 100 Calls!</h3>
                <p className="mt-1 mb-4 opacity-90 text-sm">
                  You&apos;re a true advocate for change. Keep up the amazing work!
                </p>
                <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-white text-cusens-primary text-sm font-bold leading-normal shadow-md hover:bg-cusens-bg transition-colors">
                  <span className="material-icons mr-2 text-base">share</span>
                  <span className="truncate">Share</span>
                </button>
              </div>
              <div className="bg-white border border-cusens-border p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
                <span className="material-icons text-4xl mb-3 text-cusens-primary">rocket_launch</span>
                <h3 className="text-xl font-bold text-cusens-text-primary">Reached Level 5!</h3>
                <p className="mt-1 mb-4 text-cusens-text-secondary text-sm">
                  Your dedication is inspiring. You&apos;ve become an Active Citizen!
                </p>
                <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-cusens-primary text-cusens-text-primary text-sm font-bold leading-normal shadow-md hover:bg-cusens-primary-hover transition-colors">
                  <span className="material-icons mr-2 text-base">share</span>
                  <span className="truncate">Share</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
