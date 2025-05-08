
import { STORAGE_KEYS } from "../config/linkedinConfig";

/**
 * Save the record ID with the LinkedIn URL as part of the key
 */
export const saveRecordIdToStorage = (linkedinUrl: string, recordId: string) => {
  console.log("[STORAGE_UTILS] ID stored in storage:", recordId);
  // Save with a prefixed key that includes the URL
  const key = `${STORAGE_KEYS.RECORD_ID_PREFIX}${linkedinUrl}`;
  localStorage.setItem(key, recordId);
  sessionStorage.setItem(key, recordId);  // Redundant storage for reliability
  
  // Always save the current URL when saving a record ID
  saveCurrentProfileUrl(linkedinUrl);
};

/**
 * Get record ID from storage using the LinkedIn URL
 */
export const getRecordIdFromStorage = (linkedinUrl: string): string | null => {
  if (!linkedinUrl) return null;
  
  const key = `${STORAGE_KEYS.RECORD_ID_PREFIX}${linkedinUrl}`;
  
  // Try to get from localStorage first, then sessionStorage as fallback
  const localStorageId = localStorage.getItem(key);
  const sessionStorageId = sessionStorage.getItem(key);
  
  console.log("[STORAGE_UTILS] Retrieved ID from storage:", localStorageId || sessionStorageId);
  return localStorageId || sessionStorageId || null;
};

/**
 * Create a temporary ID for use when working offline
 */
export const createTemporaryId = (): string => {
  return 'temp-' + Math.random().toString(36).substring(2, 15);
};

/**
 * Save the current profile URL to localStorage
 */
export const saveCurrentProfileUrl = (url: string): void => {
  if (!url) return;
  console.log("[STORAGE_UTILS] Saving current profile URL:", url);
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE_URL, url);
};

/**
 * Get the current profile URL from localStorage
 */
export const getCurrentProfileUrl = (): string | null => {
  const url = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE_URL);
  console.log("[STORAGE_UTILS] Retrieved current profile URL:", url);
  return url;
};

/**
 * Remove old storage keys to prevent localStorage bloat
 */
export const cleanupOldStorageKeys = (): void => {
  // Get all keys from localStorage
  const allKeys = Object.keys(localStorage);
  const currentUrl = getCurrentProfileUrl();
  
  if (!currentUrl) return;
  
  // Find keys that start with recordId_ but don't match the current URL
  const keysToRemove = allKeys.filter(key => 
    key.startsWith(STORAGE_KEYS.RECORD_ID_PREFIX) && 
    key !== `${STORAGE_KEYS.RECORD_ID_PREFIX}${currentUrl}`
  );
  
  // Remove old keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log("[STORAGE_UTILS] Cleaned up old storage keys:", keysToRemove.length);
};
