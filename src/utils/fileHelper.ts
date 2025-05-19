/**
 * Helper functions for handling file paths and Google Drive files
 */

/**
 * Parse a Google Drive file info string to an object
 * @param fileString - JSON string containing Google Drive file info
 * @returns The parsed file object or null if invalid
 */
export const parseGoogleDriveFile = (fileString: string | null): any => {
  if (!fileString) return null;
  
  try {
    return JSON.parse(fileString);
  } catch (error) {
    console.error('Error parsing Google Drive file info:', error);
    return null;
  }
};

/**
 * Get the appropriate URL for a file (either local or Google Drive)
 * @param filePath - File path or Google Drive file info string
 * @param defaultImage - Default image to use if no file is available
 * @returns URL to display the file
 */
export const getFileUrl = (filePath: string | null, defaultImage: string = '/images/default-avatar.png'): string => {
  if (!filePath) return defaultImage;
  
  // Check if it's a Google Drive file (JSON string)
  if (filePath.startsWith('{')) {
    const fileInfo = parseGoogleDriveFile(filePath);
    if (fileInfo && fileInfo.downloadLink) {
      return fileInfo.downloadLink;
    }
    return defaultImage;
  }
  
  // Handle local file paths
  if (filePath.startsWith('/uploads')) {
    // Use a hardcoded backend URL to avoid any caching issues
    const apiBaseUrl = 'https://nbu-journal-backend.onrender.com';
    return `${apiBaseUrl}${filePath}`;
  }
  
  // Return the path as is if it's already a full URL
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  return defaultImage;
};

/**
 * Get the download URL for a journal file
 * @param filePath - File path or Google Drive file info string
 * @returns URL to download the file
 */
export const getDownloadUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  
  // Check if it's a Google Drive file (JSON string)
  if (filePath.startsWith('{')) {
    const fileInfo = parseGoogleDriveFile(filePath);
    if (fileInfo && fileInfo.downloadLink) {
      return fileInfo.downloadLink;
    }
    return null;
  }
  
  // Handle local file paths
  if (filePath.startsWith('/uploads')) {
    // Use a hardcoded backend URL to avoid any caching issues
    const apiBaseUrl = 'https://nbu-journal-backend.onrender.com';
    return `${apiBaseUrl}${filePath}`;
  }
  
  // Return the path as is if it's already a full URL
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  return null;
};
