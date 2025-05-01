
import { useState, useEffect, useCallback } from "react";
import { LinkedInProfile, fetchProfileData } from "@/services/linkedinService";
import { useToast } from "@/hooks/use-toast";

interface PollingFetchResult {
  isLoading: boolean;
  isError: boolean;
  profile: LinkedInProfile | null;
}

export const usePollingFetch = (linkedinUrl: string): PollingFetchResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const { toast } = useToast();

  const checkEndpointForData = useCallback(async () => {
    try {
      const data = await fetchProfileData(linkedinUrl);
      
      if (data) {
        // Data is available
        setProfile(data);
        setIsLoading(false);
        
        toast({
          title: "Análise concluída",
          description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
        });

        return true; // Data received, can stop polling
      }
      
      return false; // Keep polling
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return false; // Keep trying
    }
  }, [linkedinUrl, toast]);

  useEffect(() => {
    if (!linkedinUrl) {
      setIsLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout;
    
    const startPolling = async () => {
      // Check immediately first
      const dataReceived = await checkEndpointForData();
      
      if (!dataReceived) {
        // If no data yet, start polling
        pollingInterval = setInterval(async () => {
          const received = await checkEndpointForData();
          if (received && pollingInterval) {
            clearInterval(pollingInterval);
          }
        }, 3000);
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
    };
  }, [linkedinUrl, checkEndpointForData, toast]);

  return { isLoading, isError, profile };
};
