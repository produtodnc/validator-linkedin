
import React, { useEffect, useState, useRef } from "react";
import { ResultContentProps } from "@/components/results/ResultContent";
import { useLinkedinUrlProcessor } from "@/hooks/useLinkedinUrlProcessor";
import { useProfileData } from "@/hooks/useProfileData";
import { useToast } from "@/hooks/use-toast";
import { getRecordIdFromStorage } from "@/services/utils/storageUtils";

interface ResultsContainerProps {
  linkedinUrl: string;
  userEmail?: string | null;
  children: React.ReactNode;
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({ linkedinUrl, userEmail, children }) => {
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState(linkedinUrl);
  const previousUrlRef = useRef<string | null>(null);
  
  // Update current URL if the prop changes
  useEffect(() => {
    if (linkedinUrl && linkedinUrl !== currentUrl) {
      console.log("[RESULTS_CONTAINER] URL changed from", currentUrl, "to", linkedinUrl);
      previousUrlRef.current = currentUrl;
      setCurrentUrl(linkedinUrl);
    }
  }, [linkedinUrl, currentUrl]);
  
  // First check if we already have a stored recordId for this URL
  const storedRecordId = getRecordIdFromStorage(currentUrl);
  
  // Process the LinkedIn URL and get the record ID if not already stored
  const { recordId, isProcessing, retryCount: urlProcessorRetryCount } = useLinkedinUrlProcessor(
    currentUrl, 
    userEmail
  );
  
  // Use the stored recordId if available, otherwise use the one from the processor
  const finalRecordId = storedRecordId || recordId;
  
  // Fetch and process profile data using the record ID
  const { isLoading, isError, profile, dataReceived, retryCount, endpointStatus } = useProfileData(
    currentUrl, 
    finalRecordId
  );
  
  // Effect to detect URL changes
  useEffect(() => {
    // If URL changed and there was a previous URL, show a toast
    if (previousUrlRef.current && previousUrlRef.current !== currentUrl) {
      toast({
        title: "Nova análise iniciada",
        description: "Iniciando análise para o novo perfil do LinkedIn",
      });
    }
    
    console.log("[RESULTS_CONTAINER] Using recordId:", finalRecordId);
    console.log("[RESULTS_CONTAINER] Network status:", navigator.onLine ? "Online" : "Offline");
    console.log("[RESULTS_CONTAINER] URL processor retries:", urlProcessorRetryCount);
    console.log("[RESULTS_CONTAINER] Profile data retries:", retryCount);
  }, [currentUrl, finalRecordId, urlProcessorRetryCount, retryCount, toast]);
  
  // Prepare the content props that ResultContent expects
  const contentProps: ResultContentProps = {
    isLoading: isLoading || isProcessing,
    isError,
    profile,
    dataReceived,
    retryCount: Math.max(retryCount || 0, urlProcessorRetryCount || 0),
    endpointStatus
  };
  
  // Clone the children element and pass the content props
  return React.cloneElement(children as React.ReactElement, contentProps);
};

export default ResultsContainer;
