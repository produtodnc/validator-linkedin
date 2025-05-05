
import { useEffect, useRef } from "react";
import { useProfileFetch } from "./profile/useProfileFetch";
import { useProfilePolling } from "./profile/useProfilePolling";

/**
 * Hook for handling LinkedIn profile data fetching and processing
 */
export const useProfileData = (linkedinUrl: string, recordId: string | null) => {
  // Get the fetch functionality
  const { fetchResultsFromSupabase, endpointStatus } = useProfileFetch();
  
  // Track previous URL to detect changes
  const prevUrlRef = useRef<string | null>(null);
  const prevRecordIdRef = useRef<string | null>(null);
  
  // Set up polling with the fetch function
  const { 
    isLoading, 
    isError, 
    profile, 
    dataReceived,
    retryCount,
    startPolling,
    resetPollingState
  } = useProfilePolling({
    onAttempt: (id, attempt) => fetchResultsFromSupabase(id, attempt, linkedinUrl),
    recordId,
    linkedinUrl,
    config: {
      initialDelay: 0,
      intervalMs: 5000,
      maxInitialAttempts: 4,
      maxAdditionalAttempts: 3,
      additionalAttemptsDelay: 10000
    }
  });

  // Effect to handle URL changes and restart polling when needed
  useEffect(() => {
    // If URL changed, reset the polling state
    if (prevUrlRef.current && prevUrlRef.current !== linkedinUrl) {
      console.log("[PROFILE_DATA] URL alterada, reiniciando o processo de polling");
      resetPollingState();
    }
    
    // Update the previous URL ref
    prevUrlRef.current = linkedinUrl;
    
    // Only start polling if we have a recordId and it's different from the previous one
    if (recordId && (prevRecordIdRef.current !== recordId || !prevRecordIdRef.current)) {
      console.log("[PROFILE_DATA] Iniciando processo de polling com ID:", recordId);
      
      // Start polling and store the cleanup function
      startPolling().then(cleanup => {
        return () => {
          cleanup();
        };
      });
    }
    
    // Update the previous recordId ref
    prevRecordIdRef.current = recordId;
    
    // Return cleanup function
    return () => {
      // Cleanup will be handled by startPolling's returned function
    };
  }, [recordId, linkedinUrl, startPolling, resetPollingState]);

  return {
    isLoading,
    isError,
    profile,
    dataReceived,
    retryCount,
    endpointStatus
  };
};
