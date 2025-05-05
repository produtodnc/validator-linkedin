
import { useEffect } from "react";
import { useProfileFetch } from "./profile/useProfileFetch";
import { useProfilePolling } from "./profile/useProfilePolling";

/**
 * Hook for handling LinkedIn profile data fetching and processing
 */
export const useProfileData = (linkedinUrl: string, recordId: string | null) => {
  // Get the fetch functionality
  const { fetchResultsFromSupabase, endpointStatus } = useProfileFetch();
  
  // Set up polling with the fetch function
  const { 
    isLoading, 
    isError, 
    profile, 
    dataReceived,
    retryCount,
    startPolling
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

  // Start polling when recordId changes
  useEffect(() => {
    let cleanup = () => {};
    
    if (recordId) {
      console.log("[PROFILE_DATA] Iniciando processo de polling com ID:", recordId);
      cleanup = startPolling();
    }
    
    return cleanup;
  }, [recordId, startPolling]);

  return {
    isLoading,
    isError,
    profile,
    dataReceived,
    retryCount,
    endpointStatus
  };
};
