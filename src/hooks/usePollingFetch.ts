
import { useState, useEffect } from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { useToast } from "@/hooks/use-toast";
import { useProfileDataCheck } from "@/hooks/useProfileDataCheck";

interface PollingFetchResult {
  isLoading: boolean;
  isError: boolean;
  profile: LinkedInProfile | null;
  dataReceived: boolean;
}

export const usePollingFetch = (linkedinUrl: string): PollingFetchResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const { toast } = useToast();
  const { profile, dataReceived, checkForData } = useProfileDataCheck(linkedinUrl);

  // Listen for the custom event of received data
  useEffect(() => {
    const handleEndpointData = (event: CustomEvent) => {
      if (event.detail?.url === linkedinUrl && event.detail?.status === 200) {
        checkForData();
      } else if (event.detail?.error) {
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Erro",
          description: event.detail.error,
          variant: "destructive",
        });
      }
    };

    window.addEventListener('endpointDataReceived', handleEndpointData as EventListener);
    
    return () => {
      window.removeEventListener('endpointDataReceived', handleEndpointData as EventListener);
    };
  }, [linkedinUrl, checkForData, toast]);

  // Set up polling mechanism
  useEffect(() => {
    if (!linkedinUrl) {
      setIsLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    const startPolling = async () => {
      // Check immediately first
      const initialDataReceived = await checkForData();
      
      if (!initialDataReceived) {
        console.log("[POLLING] Iniciando polling para URL:", linkedinUrl);
        
        // If there's no data yet, start polling
        pollingInterval = setInterval(async () => {
          console.log("[POLLING] Verificando novos dados...");
          const received = await checkForData();
          
          // If we received complete data, stop polling
          if (received) {
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            console.log("[POLLING] Dados completos recebidos. Parando polling.");
          }
        }, 3000); // Check every 3 seconds
        
        // Set a timeout to stop polling after 5 minutes if data isn't received
        timeoutId = setTimeout(() => {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          
          if (isLoading) {
            console.log("[POLLING] Timeout de 5 minutos atingido. Parando polling.");
            setIsError(true);
            setIsLoading(false);
            
            toast({
              title: "Tempo esgotado",
              description: "Não foi possível obter todos os dados do perfil após várias tentativas",
              variant: "destructive",
            });
          }
        }, 300000); // 300 seconds (5 minutes)
      } else {
        console.log("[POLLING] Dados completos já disponíveis inicialmente.");
      }
    };
    
    startPolling().catch((error) => {
      console.error("Error in polling:", error);
      setIsError(true);
      setIsLoading(false);
      
      toast({
        title: "Erro",
        description: "Não foi possível buscar os dados do perfil",
        variant: "destructive",
      });
    });
    
    // Cleanup
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [linkedinUrl, checkForData, toast, isLoading]);

  // Update loading state when we receive data
  useEffect(() => {
    if (dataReceived) {
      setIsLoading(false);
    }
  }, [dataReceived]);

  return { isLoading, isError, profile, dataReceived };
};
