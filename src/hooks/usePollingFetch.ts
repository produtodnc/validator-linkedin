
import { useState, useEffect, useCallback } from "react";
import { LinkedInProfile, fetchProfileData } from "@/services/linkedinService";
import { useToast } from "@/hooks/use-toast";

// Criamos um objeto global para simular nosso endpoint local
// Em um cenário real, isso seria gerenciado por um servidor backend
declare global {
  interface Window {
    _receivedLinkedInData?: {
      [url: string]: LinkedInProfile;
    };
  }
}

// Inicialize o objeto se ainda não existir
if (typeof window !== 'undefined') {
  window._receivedLinkedInData = window._receivedLinkedInData || {};
}

// Simula um endpoint local para receber dados POST
export const handleEndpointPost = (linkedinUrl: string, data: LinkedInProfile): void => {
  if (typeof window !== 'undefined') {
    window._receivedLinkedInData![linkedinUrl] = data;
    console.log(`[API] Dados recebidos para URL ${linkedinUrl}:`, data);
  }
};

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
      // Primeiro verificamos se já recebemos os dados via POST simulado
      if (window._receivedLinkedInData && window._receivedLinkedInData[linkedinUrl]) {
        const data = window._receivedLinkedInData[linkedinUrl];
        delete window._receivedLinkedInData[linkedinUrl];
        
        setProfile(data);
        setIsLoading(false);
        
        toast({
          title: "Análise concluída",
          description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
        });

        return true; // Dados recebidos, pode parar o polling
      }
      
      // Caso contrário, tentamos o método padrão de busca
      const data = await fetchProfileData(linkedinUrl);
      
      if (data) {
        // Dados disponíveis
        setProfile(data);
        setIsLoading(false);
        
        toast({
          title: "Análise concluída",
          description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
        });

        return true; // Dados recebidos, pode parar o polling
      }
      
      return false; // Continuar polling
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return false; // Continuar tentando
    }
  }, [linkedinUrl, toast]);

  useEffect(() => {
    if (!linkedinUrl) {
      setIsLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    const startPolling = async () => {
      // Verificar imediatamente primeiro
      const dataReceived = await checkEndpointForData();
      
      if (!dataReceived) {
        // Se ainda não há dados, começar polling
        pollingInterval = setInterval(async () => {
          const received = await checkEndpointForData();
          if (received && pollingInterval) {
            clearInterval(pollingInterval);
          }
        }, 3000);
        
        // Timeout após 120 segundos para evitar polling infinito (aumentado de 30 para 120 segundos)
        timeoutId = setTimeout(() => {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          
          if (isLoading) {
            setIsError(true);
            setIsLoading(false);
            
            toast({
              title: "Tempo esgotado",
              description: "Não foi possível obter os dados do perfil após várias tentativas",
              variant: "destructive",
            });
          }
        }, 120000); // Aumentado para 120 segundos (2 minutos)
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
  }, [linkedinUrl, checkEndpointForData, toast, isLoading]);

  return { isLoading, isError, profile };
};
