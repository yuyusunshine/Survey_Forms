// API configuration
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = 'nnsurveyforms-bfdzgtcbc8gcfna8.eastasia-01.azurewebsites.net';

// Helper function to build API URLs
export const getApiUrl = (path) => {
  // If VITE_API_BASE_URL is set, use it; otherwise use relative paths (for proxy)
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
};
