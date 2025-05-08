import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendUrlToWebhook } from "@/services/api/linkedinApi";
import { 
  saveCurrentProfileUrl, 
  getRecordIdFromStorage, 
  cleanupOldStorageKeys,
  saveRecordIdToStorage
} from "@/services/utils/storageUtils";

/**
 * Hook for processing LinkedIn URL submissions
 */
export const useLinkedinUrlProcessor = (linkedinUrl: string, userEmail: string | null = null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Keep track of the current URL being processed
  const currentUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    // If there's no URL, don't do anything
    if (!linkedinUrl) {
      setIsProcessing(false);
      return;
    }
    
    // If the URL hasn't changed and we already have a recordId, no need to process again
    if (currentUrlRef.current === linkedinUrl && recordId) {
      setIsProcessing(false);
      return;
    }
    
    // Reset state for new URL
    setIsProcessing(true);
    setRetryCount(0);
    setRecordId(null);
    
    // Update the reference URL
    currentUrlRef.current = linkedinUrl;
    
    // First try to retrieve the recordId from localStorage and sessionStorage
    let storedRecordId = getRecordIdFromStorage(linkedinUrl);
                         
    if (storedRecordId) {
      console.log("[URL_PROCESSOR] Recovering record ID from storage:", storedRecordId);
      setRecordId(storedRecordId);
      setIsProcessing(false);
      
      // Clean up old keys to avoid storage bloat
      cleanupOldStorageKeys();
      return;
    }
    
    // Store URL in session for identification
    saveCurrentProfileUrl(linkedinUrl);
    
    console.log("[URL_PROCESSOR] Starting analysis for URL:", linkedinUrl);
    console.log("[URL_PROCESSOR] User email:", userEmail);
    
    // Function to attempt sending the URL with retry
    const attemptSendUrl = async () => {
      try {
        // Check if current URL is still the same we're processing
        if (currentUrlRef.current !== linkedinUrl) {
          console.log("[URL_PROCESSOR] URL changed during processing, aborting previous request");
          return;
        }
        
        console.log(`[URL_PROCESSOR] Attempt ${retryCount + 1} to send URL:`, linkedinUrl);
        const response = await sendUrlToWebhook(linkedinUrl, userEmail);
        
        // Check again if URL hasn't changed during the request
        if (currentUrlRef.current !== linkedinUrl) {
          console.log("[URL_PROCESSOR] URL changed after request, ignoring result");
          return;
        }
        
        if (response.error) {
          // Check if we should retry
          if (response.status === 503 && retryCount < maxRetries) {
            console.log(`[URL_PROCESSOR] Connection error, scheduling new attempt (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            
            // Try again after exponential delay
            setTimeout(() => attemptSendUrl(), 2000 * Math.pow(2, retryCount));
            return;
          }
          
          // If we get here, we failed after all attempts or it's an error we don't want to retry
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          });
          setIsProcessing(false);
        } else {
          // Store the record ID for later use
          if (response.recordId) {
            console.log("[URL_PROCESSOR] Record ID received:", response.recordId);
            
            // Save recordId in localStorage and sessionStorage with URL as part of the key
            saveRecordIdToStorage(linkedinUrl, response.recordId);
            setRecordId(response.recordId);
            
            // Clean up old keys to avoid storage bloat
            cleanupOldStorageKeys();
            
            toast({
              title: "Perfil enviado",
              description: response.message || "Seu perfil foi enviado para análise",
            });
          } else {
            console.log("[URL_PROCESSOR] No record ID received in response");
            toast({
              title: "Aviso",
              description: "Não foi possível obter o ID do registro, mas continuaremos tentando",
            });
          }
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("[URL_PROCESSOR] Error starting process:", error);
        
        // Check if current URL is still the same we're processing
        if (currentUrlRef.current !== linkedinUrl) {
          console.log("[URL_PROCESSOR] URL changed during error, aborting retry");
          return;
        }
        
        // Check if we should retry
        if (retryCount < maxRetries) {
          console.log(`[URL_PROCESSOR] Error sending URL, scheduling new attempt (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          
          // Try again after exponential delay
          setTimeout(() => attemptSendUrl(), 2000 * Math.pow(2, retryCount));
          return;
        }
        
        toast({
          title: "Erro",
          description: "Não foi possível enviar os dados para processamento após várias tentativas",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };
    
    // Start the sending process
    attemptSendUrl();
    
  }, [linkedinUrl, toast, retryCount, maxRetries, recordId, userEmail]);

  return { recordId, isProcessing, retryCount };
};
