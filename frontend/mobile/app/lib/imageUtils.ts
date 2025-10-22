import { Platform } from 'react-native';

/**
 * Get a safe image source URI that works across platforms
 * @param imageUrl - The image URL (could be base64, blob, or regular URL)
 * @param fallbackName - Name to use for fallback avatar
 * @returns Safe image source object
 */
export const getSafeImageSource = (imageUrl?: string | null, fallbackName?: string) => {
  if (!imageUrl) {
    return {
      uri: fallbackName 
        ? `https://ui-avatars.com/api/?name=${fallbackName}&background=4F46E5&color=fff&size=200`
        : 'https://ui-avatars.com/api/?name=Pet&background=4F46E5&color=fff&size=200'
    };
  }

  // If it's a base64 string, use it directly
  if (imageUrl.startsWith('data:image/')) {
    return { uri: imageUrl };
  }

  // If it's a blob URL on web, try to convert it to base64 or use fallback
  if (Platform.OS === 'web' && imageUrl.startsWith('blob:')) {
    // For blob URLs, we'll use a fallback since they can become invalid
    console.warn('Blob URL detected, using fallback avatar');
    return {
      uri: fallbackName 
        ? `https://ui-avatars.com/api/?name=${fallbackName}&background=4F46E5&color=fff&size=200`
        : 'https://ui-avatars.com/api/?name=Pet&background=4F46E5&color=fff&size=200'
    };
  }

  // For regular URLs or other cases
  return { uri: imageUrl };
};

/**
 * Check if an image URL is valid and accessible
 * @param uri - The image URI to check
 * @returns Promise that resolves to true if image is accessible
 */
export const isImageAccessible = async (uri: string): Promise<boolean> => {
  try {
    if (uri.startsWith('data:image/')) {
      return true; // Base64 images are always accessible
    }

    if (Platform.OS === 'web' && uri.startsWith('blob:')) {
      // For blob URLs, we can't easily check accessibility
      // Return true and let the Image component handle errors
      return true;
    }

    // For regular URLs, try to fetch the image
    const response = await fetch(uri, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.log('Image accessibility check failed:', error);
    return false;
  }
};
