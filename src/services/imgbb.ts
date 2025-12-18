/**
 * ImgBB API Service
 * Handles image uploads to ImgBB hosting service
 */

const IMGBB_API_KEY = 'a9dd0be8e1260b6bfcff8ea6120c15d5';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
  };
  success: boolean;
  status: number;
}

export interface ImgBBError {
  error: {
    message: string;
    status_code: number;
  };
}

/**
 * Upload an image file to ImgBB
 * @param file - The image file to upload
 * @returns Promise with the uploaded image URL
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Validate file size (max 32MB for ImgBB free tier)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      reject(new Error('File size must be less than 32MB'));
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', file);

    // Upload to ImgBB
    fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then((data: ImgBBResponse | ImgBBError) => {
        if ('error' in data) {
          reject(new Error(data.error.message || 'Failed to upload image'));
          return;
        }

        if (data.success && data.data?.url) {
          resolve(data.data.url);
        } else {
          reject(new Error('Upload failed: Invalid response from ImgBB'));
        }
      })
      .catch(error => {
        reject(new Error(`Upload failed: ${error.message || 'Network error'}`));
      });
  });
}

/**
 * Upload multiple images to ImgBB
 * @param files - Array of image files to upload
 * @returns Promise with array of uploaded image URLs
 */
export async function uploadMultipleImagesToImgBB(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImageToImgBB(file));
  return Promise.all(uploadPromises);
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.'
    };
  }

  // Check file size (32MB max)
  const maxSize = 32 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 32MB'
    };
  }

  return { isValid: true };
}

