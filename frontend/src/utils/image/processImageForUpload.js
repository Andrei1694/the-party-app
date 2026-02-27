const WEBP_TYPE = 'image/webp';
const JPEG_TYPE = 'image/jpeg';

const DEFAULT_OPTIONS = {
  outputType: WEBP_TYPE,
  maxDimension: 1024,
  targetBytes: 400 * 1024,
  minQuality: 0.55,
  maxIterations: 8,
};

const INITIAL_QUALITY = 0.92;
const QUALITY_STEP = 0.08;
const DIMENSION_STEP = 0.9;

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

export const processImageForUpload = async ({
  file,
  cropAreaPixels,
  outputType = DEFAULT_OPTIONS.outputType,
  maxDimension = DEFAULT_OPTIONS.maxDimension,
  targetBytes = DEFAULT_OPTIONS.targetBytes,
  minQuality = DEFAULT_OPTIONS.minQuality,
  maxIterations = DEFAULT_OPTIONS.maxIterations,
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
