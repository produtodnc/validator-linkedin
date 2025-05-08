
// Re-export types and functions from modular files
export { LinkedInProfile, ApiResponse } from './types/linkedinTypes';
export { sendUrlToWebhook } from './api/linkedinApi';
export { 
  saveRecordIdToStorage, 
  getRecordIdFromStorage, 
  cleanupOldStorageKeys,
  saveCurrentProfileUrl 
} from './utils/storageUtils';
