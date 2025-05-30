// API configuration for development and production environments

// Check if we're in production (deployed) environment
const isProduction = window.location.hostname !== 'localhost' && 
                     !window.location.hostname.includes('.replit.dev');

// Base API URL - use relative path in development, absolute in production
export const API_BASE_URL = isProduction
  ? 'https://intellaone-api.onrender.com' // Replace with your actual production API URL
  : ''; // Empty string means same domain in development

// Helper function to build full API URLs
export function getApiUrl(path: string): string {
  // Make sure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}