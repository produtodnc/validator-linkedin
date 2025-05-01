
import { useState, useEffect, useCallback } from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { useToast } from "@/hooks/use-toast";

// Inicialize o objeto se ainda não existir
if (typeof window !== 'undefined') {
  window._receivedLinkedInData = window._receivedLinkedInData || {};
}

interface PollingFetchResult {
  isLoading: boolean;
  isError: boolean;
  profile: LinkedInProfile | null;
  dataReceived: boolean;
}

export const usePollingFetch = (linkedinUrl: string): PollingFetchResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [dataReceived, setDataReceived] = useState<boolean>(false);
  const { toast } = useToast();

  const checkForData = useCallback(async () => {
    try {
      console.log("[POLLING] Verificando dados para URL:", linkedinUrl);
      
      // Enviando requisição POST para o endpoint simulado
      const response = await fetch('/api/resultado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: linkedinUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("[POLLING] Dados recebidos do endpoint simulado:", data);
        
        setProfile(data);
        setIsLoading(false);
        setDataReceived(true);
        
        toast({
          title: "Análise concluída",
          description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
        });
        
        return true; // Dados recebidos, pode parar o polling
      }
      
      // Verificar se encontramos algo no armazenamento global
      if (window._receivedLinkedInData && window._receivedLinkedInData[linkedinUrl]) {
        console.log("[POLLING] Dados encontrados no armazenamento global:", window._receivedLinkedInData[linkedinUrl]);
        
        const data = window._receivedLinkedInData[linkedinUrl];
        delete window._receivedLinkedInData[linkedinUrl]; // Limpamos para evitar duplicação
        
        setProfile(data);
        setIsLoading(false);
        setDataReceived(true);
        
        toast({
          title: "Análise concluída",
          description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
        });

        return true; // Dados recebidos, pode parar o polling
      }
      
      return false; // Continuar polling
    } catch (error) {
      console.error("[POLLING] Erro verificando dados:", error);
      return false; // Continuar tentando
    }
  }, [linkedinUrl, toast]);

  // Ouvir o evento personalizado de dados recebidos
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

  useEffect(() => {
    if (!linkedinUrl) {
      setIsLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    const startPolling = async () => {
      // Verificar imediatamente primeiro
      const dataReceived = await checkForData();
      
      if (!dataReceived) {
        console.log("[POLLING] Iniciando polling para URL:", linkedinUrl);
        
        // Se ainda não há dados, começar polling
        pollingInterval = setInterval(async () => {
          console.log("[POLLING] Verificando novos dados...");
          const received = await checkForData();
          if (received && pollingInterval) {
            clearInterval(pollingInterval);
          }
        }, 3000);
        
        // Timeout após 120 segundos para evitar polling infinito
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
        }, 120000); // 120 segundos (2 minutos)
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

  return { isLoading, isError, profile, dataReceived };
};
