
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { LinkedInProfile } from "@/services/linkedinService";

interface PollingConfig {
  initialDelay?: number;
  intervalMs?: number;
  maxInitialAttempts?: number;
  maxAdditionalAttempts?: number;
  additionalAttemptsDelay?: number;
}

interface UseProfilePollingProps {
  onAttempt: (id: string, attempt: number) => Promise<{
    profile: LinkedInProfile | null;
    dataReceived: boolean;
    endpointStatus: number | null;
  }>;
  recordId: string | null;
  linkedinUrl: string;
  config?: PollingConfig;
}

/**
 * Hook for polling profile data with configurable retry mechanism
 */
export const useProfilePolling = ({
  onAttempt,
  recordId,
  linkedinUrl,
  config = {}
}: UseProfilePollingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [dataReceived, setDataReceived] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  // Use refs to track polling state and avoid stale closures
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const additionalAttemptsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActiveRef = useRef(false);

  const {
    initialDelay = 0,
    intervalMs = 5000,
    maxInitialAttempts = 4,
    maxAdditionalAttempts = 3,
    additionalAttemptsDelay = 10000
  } = config;

  // Reset polling state
  const resetPollingState = useCallback(() => {
    // Clear any active intervals or timeouts
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (additionalAttemptsTimeoutRef.current) {
      clearTimeout(additionalAttemptsTimeoutRef.current);
      additionalAttemptsTimeoutRef.current = null;
    }
    
    // Reset state for a new polling cycle
    isPollingActiveRef.current = false;
    setRetryCount(0);
    setIsLoading(true);
    setIsError(false);
    setDataReceived(false);
  }, []);

  /**
   * Start polling for profile data
   * Returns a Promise that resolves to a cleanup function
   */
  const startPolling = useCallback(async (): Promise<() => void> => {
    // If already polling, stop current polling before starting new one
    if (isPollingActiveRef.current) {
      resetPollingState();
    }
    
    if (!recordId) {
      console.log("[PROFILE_POLLING] Aguardando ID de registro...");
      return () => {};
    }

    console.log("[PROFILE_POLLING] ID de registro recebido:", recordId);
    isPollingActiveRef.current = true;
    isMountedRef.current = true;

    // First toast when starting the process
    toast({
      title: "Processando",
      description: "A URL foi registrada. Consultando dados em tempo real...",
    });
    
    // Immediate query
    console.log("[PROFILE_POLLING] Iniciando consulta imediata com ID:", recordId);
    const immediateResult = await performAttempt(recordId, 1);
    
    // If we already received data or component is unmounted, no need to continue with polling
    if (immediateResult || !isMountedRef.current || !isPollingActiveRef.current) {
      return cleanup;
    }
    
    // Set up interval for subsequent queries
    let attempt = 1;
    pollingIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current || !isPollingActiveRef.current) {
        cleanup();
        return;
      }
      
      // Increment attempt for logging
      attempt++;
      
      // If we already received data or had an error, stop polling
      if (dataReceived || isError) {
        cleanup();
        return;
      }
      
      // If we reached the maximum number of attempts, stop polling
      if (attempt > maxInitialAttempts) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        // If we didn't receive data after all attempts, schedule more attempts with longer interval
        if (!dataReceived && !isError && isMountedRef.current && isPollingActiveRef.current) {
          console.log("[PROFILE_POLLING] Início das tentativas adicionais...");
          startAdditionalAttempts(recordId);
        }
        return;
      }
      
      console.log(`[PROFILE_POLLING] Consulta ${attempt}/${maxInitialAttempts} durante os primeiros ${maxInitialAttempts * (intervalMs/1000)} segundos com ID:`, recordId);
      if (isMountedRef.current && isPollingActiveRef.current) {
        setRetryCount(attempt - 1);
        await performAttempt(recordId, attempt);
      }
    }, intervalMs);
    
    // Cleanup function to clear interval when component unmounts
    return cleanup;
  }, [recordId, toast, intervalMs, maxInitialAttempts, maxAdditionalAttempts, additionalAttemptsDelay, resetPollingState]);

  /**
   * Cleanup function to stop all polling and timeouts
   */
  const cleanup = useCallback(() => {
    console.log("[PROFILE_POLLING] Limpando recursos de polling");
    isMountedRef.current = false;
    isPollingActiveRef.current = false;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (additionalAttemptsTimeoutRef.current) {
      clearTimeout(additionalAttemptsTimeoutRef.current);
      additionalAttemptsTimeoutRef.current = null;
    }
  }, []);

  /**
   * Start additional attempts after initial polling period
   */
  const startAdditionalAttempts = useCallback((id: string) => {
    let additionalAttempt = 1;
    
    const tryAgain = async () => {
      if (!isMountedRef.current || !isPollingActiveRef.current) return;
      
      console.log(`[PROFILE_POLLING] Tentativa adicional ${additionalAttempt}/${maxAdditionalAttempts} com ID:`, id);
      setRetryCount(additionalAttempt + maxInitialAttempts); // Add initial attempts
      
      await performAttempt(id, additionalAttempt + maxInitialAttempts);
      
      additionalAttempt++;
      
      // If we already received data or had an error, don't schedule more attempts
      if (dataReceived || isError || additionalAttempt > maxAdditionalAttempts || !isMountedRef.current || !isPollingActiveRef.current) {
        return;
      }
      
      // Schedule next attempt
      additionalAttemptsTimeoutRef.current = setTimeout(tryAgain, additionalAttemptsDelay);
    };
    
    // Start the first additional attempt
    additionalAttemptsTimeoutRef.current = setTimeout(tryAgain, additionalAttemptsDelay);
  }, [maxInitialAttempts, maxAdditionalAttempts, additionalAttemptsDelay, dataReceived, isError]);

  /**
   * Perform a single attempt to fetch profile data
   */
  const performAttempt = async (id: string, attempt: number): Promise<boolean> => {
    if (!isMountedRef.current || !isPollingActiveRef.current) return false;
    
    try {
      const result = await onAttempt(id, attempt);
      
      if (!isMountedRef.current || !isPollingActiveRef.current) return false;
      
      if (result.dataReceived && result.profile) {
        setProfile(result.profile);
        setDataReceived(true);
        setIsLoading(false);
        
        // Stop polling if data is received
        cleanup();
        return true;
      } 
      
      // Handle final attempt - show no data state
      if (attempt >= maxInitialAttempts + maxAdditionalAttempts) {
        console.log("[PROFILE_POLLING] Após todas as tentativas, dados insuficientes. Mostrando mensagem de 'sem dados'.");
        setIsLoading(false);
        setDataReceived(false);
        
        if (isMountedRef.current) {
          toast({
            title: "Análise incompleta",
            description: "Não conseguimos obter dados suficientes para análise completa",
            variant: "destructive",
          });
        }
        
        cleanup();
      }
      
      return false;
    } catch (error) {
      console.error(`[PROFILE_POLLING] Erro ao processar tentativa ${attempt}:`, error);
      
      if (!isMountedRef.current || !isPollingActiveRef.current) return false;
      
      // Only set error on final attempt
      if (attempt >= maxInitialAttempts + maxAdditionalAttempts) {
        setIsError(true);
        setIsLoading(false);
        
        if (isMountedRef.current) {
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar os dados do perfil",
            variant: "destructive",
          });
        }
        
        cleanup();
      }
      
      return false;
    }
  };

  return {
    isLoading,
    isError,
    profile,
    dataReceived,
    retryCount,
    startPolling,
    resetPollingState
  };
};
