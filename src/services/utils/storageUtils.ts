
import { STORAGE_KEYS } from "../config/linkedinConfig";

/**
 * Saves record ID to localStorage and sessionStorage
 */
export const saveRecordIdToStorage = (linkedinUrl: string, recordId: string): void => {
  const key = `${STORAGE_KEYS.RECORD_ID_PREFIX}${linkedinUrl}`;
  localStorage.setItem(key, recordId);
  sessionStorage.setItem(key, recordId);
  console.log("[STORAGE_UTILS] ID stored in storage:", recordId);
};

/**
 * Retrieves record ID from localStorage or sessionStorage
 */
export const getRecordIdFromStorage = (linkedinUrl: string): string | null => {
  const key = `${STORAGE_KEYS.RECORD_ID_PREFIX}${linkedinUrl}`;
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

/**
 * Cleans up old storage keys for URLs that are no longer relevant
 */
export const cleanupOldStorageKeys = (currentUrl: string): void => {
  // Get all keys from localStorage
  const allKeys = Object.keys(localStorage);
  
  // Find keys that start with recordId_ but don't match the current URL
  const keysToRemove = allKeys.filter(key => 
    key.startsWith(STORAGE_KEYS.RECORD_ID_PREFIX) && key !== `${STORAGE_KEYS.RECORD_ID_PREFIX}${currentUrl}`
  );
  
  // Remove old keys to prevent storage bloat
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Saves current profile URL to both storage types
 */
export const saveCurrentProfileUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE_URL, url);
  sessionStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE_URL, url);
};

/**
 * Creates a temporary ID when database is unavailable
 */
export const createTemporaryId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
