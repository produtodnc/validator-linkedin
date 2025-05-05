
import { useState } from "react";
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

  const {
    initialDelay = 0,
    intervalMs = 5000,
    maxInitialAttempts = 4,
    maxAdditionalAttempts = 3,
    additionalAttemptsDelay = 10000
  } = config;

  /**
   * Start polling for profile data
   */
  const startPolling = async () => {
    if (!recordId) {
      console.log("[PROFILE_POLLING] Aguardando ID de registro...");
      return () => {};
    }

    console.log("[PROFILE_POLLING] ID de registro recebido:", recordId);
    let isMounted = true;

    // First toast when starting the process
    toast({
      title: "Processando",
      description: "A URL foi registrada. Consultando dados em tempo real...",
    });
    
    // Immediate query
    console.log("[PROFILE_POLLING] Iniciando consulta imediata com ID:", recordId);
    const immediateResult = await performAttempt(recordId, 1);
    
    // If we already received data, no need to continue with polling
    if (immediateResult || !isMounted) return () => { isMounted = false; };
    
    // Set up interval for subsequent queries
    let attempt = 1;
    const pollingInterval = setInterval(async () => {
      if (!isMounted) {
        clearInterval(pollingInterval);
        return;
      }
      
      // Increment attempt for logging
      attempt++;
      
      // If we already received data or had an error, stop polling
      if (dataReceived || isError) {
        clearInterval(pollingInterval);
        return;
      }
      
      // If we reached the maximum number of attempts, stop polling
      if (attempt > maxInitialAttempts) {
        clearInterval(pollingInterval);
        
        // If we didn't receive data after all attempts, schedule more attempts with longer interval
        if (!dataReceived && !isError && isMounted) {
          console.log("[PROFILE_POLLING] Início das tentativas adicionais...");
          startAdditionalAttempts(recordId);
        }
        return;
      }
      
      console.log(`[PROFILE_POLLING] Consulta ${attempt}/${maxInitialAttempts} durante os primeiros ${maxInitialAttempts * (intervalMs/1000)} segundos com ID:`, recordId);
      if (isMounted) {
        setRetryCount(attempt - 1);
        await performAttempt(recordId, attempt);
      }
    }, intervalMs);
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  };

  /**
   * Start additional attempts after initial polling period
   */
  const startAdditionalAttempts = (id: string) => {
    let additionalAttempt = 1;
    let isMounted = true;
    
    const tryAgain = async () => {
      if (!isMounted) return;
      
      console.log(`[PROFILE_POLLING] Tentativa adicional ${additionalAttempt}/${maxAdditionalAttempts} com ID:`, id);
      setRetryCount(additionalAttempt + maxInitialAttempts); // Add initial attempts
      
      await performAttempt(id, additionalAttempt + maxInitialAttempts);
      
      additionalAttempt++;
      
      // If we already received data or had an error, don't schedule more attempts
      if (dataReceived || isError || additionalAttempt > maxAdditionalAttempts || !isMounted) {
        return;
      }
      
      // Schedule next attempt
      setTimeout(tryAgain, additionalAttemptsDelay);
    };
    
    // Start the first additional attempt
    setTimeout(tryAgain, additionalAttemptsDelay);
    
    return () => {
      isMounted = false;
    };
  };

  /**
   * Perform a single attempt to fetch profile data
   */
  const performAttempt = async (id: string, attempt: number): Promise<boolean> => {
    try {
      const result = await onAttempt(id, attempt);
      
      if (result.dataReceived && result.profile) {
        setProfile(result.profile);
        setDataReceived(true);
        setIsLoading(false);
        return true;
      } 
      
      // Handle final attempt - show no data state
      if (attempt >= maxInitialAttempts + maxAdditionalAttempts) {
        console.log("[PROFILE_POLLING] Após todas as tentativas, dados insuficientes. Mostrando mensagem de 'sem dados'.");
        setIsLoading(false);
        setDataReceived(false);
        
        toast({
          title: "Análise incompleta",
          description: "Não conseguimos obter dados suficientes para análise completa",
          variant: "destructive",
        });
      }
      
      return false;
    } catch (error) {
      console.error(`[PROFILE_POLLING] Erro ao processar tentativa ${attempt}:`, error);
      
      // Only set error on final attempt
      if (attempt >= maxInitialAttempts + maxAdditionalAttempts) {
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar os dados do perfil",
          variant: "destructive",
        });
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
    startPolling
  };
};
