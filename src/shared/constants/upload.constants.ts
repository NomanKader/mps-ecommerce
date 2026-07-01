export const IMAGE_UPLOAD_MAX_MB = 5;
export const IMAGE_UPLOAD_MAX_BYTES = IMAGE_UPLOAD_MAX_MB * 1024 * 1024;

export const imageUploadTooLargeMessage = (label = 'Image') =>
  `${label} is too large. Please upload an image under ${IMAGE_UPLOAD_MAX_MB}MB.`;
