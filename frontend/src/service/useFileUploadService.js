import { useMutation } from '@tanstack/react-query';
import { uploadProfilePicture } from './FileUploadService';
import {
  getApiErrorMessage,
  validateProfilePictureFile,
} from '../util';

export const useFileUploadService = () =>
  useMutation({
    mutationFn: async (file) => {
      validateProfilePictureFile(file);

      try {
        return await uploadProfilePicture(file);
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Could not upload profile picture. Please try again.'));
      }
    },
  });
