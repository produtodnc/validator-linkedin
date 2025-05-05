
import React, { useEffect } from "react";
import { ResultContentProps } from "@/components/results/ResultContent";
import { useLinkedinUrlProcessor } from "@/hooks/useLinkedinUrlProcessor";
import { useProfileData } from "@/hooks/useProfileData";

interface ResultsContainerProps {
  linkedinUrl: string;
  children: React.ReactNode;
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({ linkedinUrl, children }) => {
  // Process the LinkedIn URL and get the record ID
  const { recordId, isProcessing, retryCount: urlProcessorRetryCount } = useLinkedinUrlProcessor(linkedinUrl);
  
  // Fetch and process profile data using the record ID
  const { isLoading, isError, profile, dataReceived, retryCount, endpointStatus } = useProfileData(linkedinUrl, recordId);
  
  // Logging recordId to help debug
  useEffect(() => {
    console.log("[RESULTS_CONTAINER] Using recordId:", recordId);
    console.log("[RESULTS_CONTAINER] Network status:", navigator.onLine ? "Online" : "Offline");
    console.log("[RESULTS_CONTAINER] URL processor retries:", urlProcessorRetryCount);
    console.log("[RESULTS_CONTAINER] Profile data retries:", retryCount);
  }, [recordId, urlProcessorRetryCount, retryCount]);
  
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
