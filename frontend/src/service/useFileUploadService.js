import { useMutation } from '@tanstack/react-query';
import { uploadProfilePicture } from './FileUploadService';

const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024;

const getErrorMessage = (error) => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    (typeof error?.response?.data === 'string' ? error.response.data : null);

  if (backendMessage) {
    return backendMessage;
  }

  return error?.message || 'Could not upload profile picture. Please try again.';
};

export const validateProfilePictureFile = (file) => {
  if (!file) {
    throw new Error('Please select an image file.');
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  if (file.size > MAX_PROFILE_PICTURE_SIZE) {
    throw new Error('Image file must be 5MB or smaller.');
  }
};

export const useFileUploadService = () =>
  useMutation({
    mutationFn: async (file) => {
      validateProfilePictureFile(file);

      try {
        return await uploadProfilePicture(file);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  });
