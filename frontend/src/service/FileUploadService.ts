import api, { endpoints } from '../requests';

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post(endpoints.files.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!data?.fileName || !data?.fileUrl) {
    throw new Error('Upload response is missing file data.');
  }

  return {
    fileName: data.fileName,
    fileUrl: data.fileUrl,
  };
};
