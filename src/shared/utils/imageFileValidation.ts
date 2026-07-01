import toast from 'react-hot-toast';

export const maxImageUploadBytes = 5 * 1024 * 1024;

export const imageUploadSizeWarning =
  'The selected image is larger than 5MB. Please choose another image with a proper image size under 5MB.';

export const validateImageFileSelection = (file: File | undefined, label = 'image') => {
  if (!file) {
    return false;
  }

  if (!file.type.startsWith('image/')) {
    toast.error(`Choose an image file for the ${label}.`);
    return false;
  }

  if (file.size > maxImageUploadBytes) {
    toast.error(imageUploadSizeWarning);
    return false;
  }

  return true;
};
