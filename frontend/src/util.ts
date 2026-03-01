const DEFAULT_EVENT_CATEGORY = 'Community';
const PROFILE_LEVEL_DEFAULTS = {
  currentLevel: 1,
  currentXP: 0,
  nextLevelXP: 100,
};

const MAX_PROFILE_PICTURE_SOURCE_SIZE = 20 * 1024 * 1024;
const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024;

const WEBP_TYPE = 'image/webp';
const JPEG_TYPE = 'image/jpeg';

const DEFAULT_IMAGE_OPTIONS = {
  outputType: WEBP_TYPE,
  maxDimension: 1024,
  targetBytes: 400 * 1024,
  minQuality: 0.55,
  maxIterations: 8,
};

const INITIAL_QUALITY = 0.92;
const QUALITY_STEP = 0.08;
const DIMENSION_STEP = 0.9;
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const canvasToBlob = (canvas, outputType, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode image.'));
          return;
        }

        resolve(blob);
      },
      outputType,
      quality,
    );
  });

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Selected file is not a valid image.'));
    };

    image.src = objectUrl;
  });

const decodeImageSource = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      const imageBitmap = await createImageBitmap(file);
      return {
        image: imageBitmap,
        width: imageBitmap.width,
        height: imageBitmap.height,
        dispose: () => {
          imageBitmap.close?.();
        },
      };
    } catch {
      // Fallback to HTMLImageElement below when createImageBitmap fails.
    }
  }

  const image = await loadImageElement(file);
  return {
    image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    dispose: () => {},
  };
};

const normalizeCropArea = (cropAreaPixels, imageWidth, imageHeight) => {
  const maxX = Math.max(0, imageWidth - 1);
  const maxY = Math.max(0, imageHeight - 1);
  const x = clamp(Math.floor(cropAreaPixels.x), 0, maxX);
  const y = clamp(Math.floor(cropAreaPixels.y), 0, maxY);
  const width = clamp(Math.floor(cropAreaPixels.width), 1, imageWidth - x);
  const height = clamp(Math.floor(cropAreaPixels.height), 1, imageHeight - y);

  return { x, y, width, height };
};

const buildFileName = (originalName, extension) => {
  const baseName = originalName ? originalName.replace(/\.[^.]+$/, '').trim() : '';
  const normalizedBase = baseName || 'image';
  return `${normalizedBase}.${extension}`;
};

const extensionFromMimeType = (mimeType) => {
  if (mimeType === WEBP_TYPE) {
    return 'webp';
  }

  if (mimeType === JPEG_TYPE) {
    return 'jpg';
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  const subtype = mimeType?.split('/')?.[1];
  return subtype || 'jpg';
};

const isOutputTypeSupported = async (outputType) => {
  const testCanvas = document.createElement('canvas');
  testCanvas.width = 1;
  testCanvas.height = 1;

  try {
    const blob = await canvasToBlob(testCanvas, outputType, 0.9);
    return blob.type === outputType;
  } catch {
    return false;
  }
};

const resolveOutputType = async (outputType) => {
  const supportsRequestedType = await isOutputTypeSupported(outputType);
  if (supportsRequestedType) {
    return outputType;
  }

  const supportsJpeg = await isOutputTypeSupported(JPEG_TYPE);
  if (supportsJpeg) {
    return JPEG_TYPE;
  }

  return outputType;
};

const buildProcessedFile = (sourceFile, blob, outputType) => {
  const effectiveType = blob.type || outputType;
  const extension = extensionFromMimeType(effectiveType);
  return new File([blob], buildFileName(sourceFile?.name, extension), {
    type: effectiveType,
    lastModified: Date.now(),
  });
};

export const getFieldError = (errors) => {
  if (!errors?.length) {
    return null;
  }

  const [firstError] = errors;

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (firstError && typeof firstError === 'object' && 'message' in firstError) {
    return String(firstError.message);
  }

  return 'Invalid value.';
};

export const isPathActive = (currentPath, targetPath) =>
  currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

export const extractPaginatedContent = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

export const matchesPath = (pathname, basePath) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

export const isShellRoute = (pathname, shellEnabledPaths) =>
  shellEnabledPaths.some((path) => matchesPath(pathname, path));

export const getRouteTitle = (pathname, shellEnabledPaths, routeTitles, fallbackTitle = 'Dashboard') => {
  const matchedPath = shellEnabledPaths.find((path) => matchesPath(pathname, path));
  return matchedPath ? routeTitles[matchedPath] : fallbackTitle;
};

export const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return DATE_TIME_FORMATTER.format(date);
};

export const getEventStatus = (startTime, endTime) => {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) && Number.isNaN(end)) {
    return 'Closed';
  }

  if (!Number.isNaN(start) && now < start) {
    return 'Upcoming';
  }

  if (!Number.isNaN(start) && Number.isNaN(end)) {
    return 'Open';
  }

  if (!Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end) {
    return 'Open';
  }

  if (Number.isNaN(start) && !Number.isNaN(end) && now <= end) {
    return 'Open';
  }

  return 'Closed';
};

export const mapBackendEvent = (event, defaultCategory = DEFAULT_EVENT_CATEGORY) => ({
  id: event.id,
  title: event.name || 'Untitled event',
  description: event.description || 'No description available.',
  startsAt: event.startTime,
  endsAt: event.endTime,
  location: event.location || 'Location not specified',
  category: defaultCategory,
  status: getEventStatus(event.startTime, event.endTime),
});

export const extractJoinedEventIds = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

export const getExcerpt = (text, maxLength = 220) => {
  const normalized = (text || '').trim();
  if (normalized.length <= maxLength) {
    return normalized || 'No content available.';
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

export const isSafeInternalRedirect = (redirectPath) => {
  if (typeof redirectPath !== 'string' || !redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
    return false;
  }

  try {
    const pathname = new URL(redirectPath, 'http://localhost').pathname;
    if (pathname === '/login' || pathname.startsWith('/login/')) {
      return false;
    }
    if (pathname === '/register' || pathname.startsWith('/register/')) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

export const requiredTrimmedValidator = (fieldName) => ({
  onChange: ({ value }) => {
    if (!value.trim()) {
      return `${fieldName} is required.`;
    }
    return undefined;
  },
  onSubmit: ({ value }) => {
    if (!value.trim()) {
      return `${fieldName} is required.`;
    }
    return undefined;
  },
});

export const toNonNegativeInt = (value, fallback) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }
  return Math.floor(numericValue);
};

export const sanitizeLevelDto = (levelDto, defaults = PROFILE_LEVEL_DEFAULTS) => {
  const currentLevel = Math.max(1, toNonNegativeInt(levelDto?.currentLevel, defaults.currentLevel));
  const currentXP = toNonNegativeInt(levelDto?.currentXP, defaults.currentXP);
  const nextLevelXP = Math.max(1, toNonNegativeInt(levelDto?.nextLevelXP, defaults.nextLevelXP));
  const inferredProgressPercent = Math.floor((currentXP * 100) / nextLevelXP);
  const progressPercent = Math.min(
    100,
    Math.max(0, toNonNegativeInt(levelDto?.progressPercent, inferredProgressPercent)),
  );

  return {
    currentLevel,
    currentXP,
    nextLevelXP,
    progressPercent,
  };
};

export const mapProfileToFormValues = (profile) => ({
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

export const normalizeOptional = (value) => {
  if (value == null) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

export const buildProfileUpdatePayloadFromProfile = (profile, profilePictureUrlOverride) => ({
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

export const getApiErrorMessage = (error, fallbackMessage = 'Unexpected error.') => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    (typeof error?.response?.data === 'string' ? error.response.data : null);

  return backendMessage || error?.message || fallbackMessage;
};

export const validateImageFileType = (file) => {
  if (!file) {
    throw new Error('Please select an image file.');
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }
};

export const validateProfilePictureSourceFile = (file) => {
  validateImageFileType(file);

  if (file.size > MAX_PROFILE_PICTURE_SOURCE_SIZE) {
    throw new Error('Image file must be 20MB or smaller.');
  }
};

export const validateProfilePictureFile = (file) => {
  validateImageFileType(file);

  if (file.size > MAX_PROFILE_PICTURE_SIZE) {
    throw new Error('Image file must be 5MB or smaller.');
  }
};

export const processImageForUpload = async ({
  file,
  cropAreaPixels,
  outputType = DEFAULT_IMAGE_OPTIONS.outputType,
  maxDimension = DEFAULT_IMAGE_OPTIONS.maxDimension,
  targetBytes = DEFAULT_IMAGE_OPTIONS.targetBytes,
  minQuality = DEFAULT_IMAGE_OPTIONS.minQuality,
  maxIterations = DEFAULT_IMAGE_OPTIONS.maxIterations,
}) => {
  if (!file) {
    throw new Error('Please select an image file.');
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  if (!cropAreaPixels) {
    throw new Error('Please crop the image before uploading.');
  }

  if (maxDimension < 1 || targetBytes < 1 || minQuality <= 0 || minQuality >= 1 || maxIterations < 1) {
    throw new Error('Image processing options are invalid.');
  }

  const decodedSource = await decodeImageSource(file);

  try {
    const cropArea = normalizeCropArea(cropAreaPixels, decodedSource.width, decodedSource.height);
    const scaleToMax = Math.min(1, maxDimension / Math.max(cropArea.width, cropArea.height));

    let renderWidth = Math.max(1, Math.round(cropArea.width * scaleToMax));
    let renderHeight = Math.max(1, Math.round(cropArea.height * scaleToMax));

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });

    if (!context) {
      throw new Error('Could not process the selected image.');
    }

    const resolvedOutputType = await resolveOutputType(outputType);

    let lastBlob = null;

    for (let dimensionAttempt = 0; dimensionAttempt < maxIterations; dimensionAttempt += 1) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;

      context.clearRect(0, 0, renderWidth, renderHeight);
      context.drawImage(
        decodedSource.image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        renderWidth,
        renderHeight,
      );

      let quality = INITIAL_QUALITY;

      for (let qualityAttempt = 0; qualityAttempt < maxIterations; qualityAttempt += 1) {
        const blob = await canvasToBlob(canvas, resolvedOutputType, quality);
        lastBlob = blob;

        if (blob.size <= targetBytes) {
          return buildProcessedFile(file, blob, resolvedOutputType);
        }

        if (quality <= minQuality) {
          break;
        }

        quality = Math.max(minQuality, Number((quality - QUALITY_STEP).toFixed(2)));
      }

      if (Math.max(renderWidth, renderHeight) <= 200) {
        break;
      }

      renderWidth = Math.max(1, Math.floor(renderWidth * DIMENSION_STEP));
      renderHeight = Math.max(1, Math.floor(renderHeight * DIMENSION_STEP));
    }

    if (!lastBlob) {
      throw new Error('Could not process the selected image.');
    }

    return buildProcessedFile(file, lastBlob, resolvedOutputType);
  } catch (error) {
    throw new Error(error?.message || 'Could not process the selected image.');
  } finally {
    decodedSource.dispose();
  }
};
