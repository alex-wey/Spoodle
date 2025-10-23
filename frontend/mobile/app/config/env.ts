/**
 * Environment Configuration
 * 
 * This file handles environment-specific configurations.
 * Use EXPO_PUBLIC_* variables from .env files for runtime configuration.
 */

import { Platform } from 'react-native';

// Environment variables from .env files
const ENV = {
  // API URL from environment variable, fallback to production
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://main-production-ede9.up.railway.app/api',
  
  // Environment type
  ENV: process.env.EXPO_PUBLIC_ENV || 'production',
  
  // Check if we're in development mode
  IS_DEV: __DEV__,
};

/**
 * Get the appropriate API base URL based on environment and platform
 */
export const getApiBaseUrl = (): string => {
  // If EXPO_PUBLIC_API_URL is set, use it (from .env file)
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('[ENV] Using API URL from environment:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback logic for development without .env file
  if (__DEV__) {
    console.log('[ENV] Development mode detected');
    
    // Check for physical device IP (you can set this for local testing)
    const PHYSICAL_DEVICE_IP = undefined; // Set to your computer's IP for physical device testing
    
    if (PHYSICAL_DEVICE_IP) {
      console.log('[ENV] Using physical device IP:', PHYSICAL_DEVICE_IP);
      return `http://${PHYSICAL_DEVICE_IP}:3002/api`;
    }
    
    if (Platform.OS === 'android') {
      console.log('[ENV] Using Android emulator URL');
      return 'http://10.0.2.2:3002/api';
    } else {
      console.log('[ENV] Using iOS simulator URL');
      return 'http://localhost:3002/api';
    }
  }

  // Production fallback - Railway URL
  console.log('[ENV] Using production Railway URL');
  return 'https://main-production-ede9.up.railway.app/api';
};

export const config = {
  apiUrl: getApiBaseUrl(),
  environment: ENV.ENV,
  isDevelopment: ENV.IS_DEV,
};

// Log configuration on startup
console.log('[ENV] Configuration loaded:', {
  apiUrl: config.apiUrl,
  environment: config.environment,
  isDevelopment: config.isDevelopment,
  platform: Platform.OS,
});

export default config;

