
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

  // Função para verificar se todos os campos de feedback estão preenchidos
  const areAllFieldsFilled = (data: LinkedInProfile): boolean => {
    // Verificar se todos os campos de feedback estão preenchidos
    const requiredFields = [
      'feedback_headline', 'feedback_headline_nota',
      'feedback_sobre', 'feedback_sobre_nota',
      'feedback_experience', 'feedback_experience_nota',
      'feedback_projetos', 'feedback_projetos_nota',
      'feedback_certificados', 'feedback_certificados_nota'
    ];
    
    // Verifica se o dado existe e os campos obrigatórios estão preenchidos
    return requiredFields.every(field => {
      return !!data[field as keyof LinkedInProfile];
    });
  };

  // Verifica se os dados são reais (não mockados)
  const isRealData = (data: LinkedInProfile): boolean => {
    // Se os dados foram realmente preenchidos pelo back-end, eles terão uma propriedade url que corresponde ao linkedinUrl
    return data.url === linkedinUrl;
  };

  const checkForData = useCallback(async () => {
    try {
      console.log("[POLLING] Verificando dados para URL:", linkedinUrl);
      
      // Enviando requisição POST para o endpoint
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
        console.log("[POLLING] Dados recebidos do endpoint:", data);
        
        // Verificar se são dados reais e não mockados
        if (!isRealData(data)) {
          console.log("[POLLING] Dados mockados detectados, aguardando dados reais");
          return false; // Continuar polling pois são dados mockados
        }
        
        // Verificar se todos os campos de feedback estão preenchidos
        if (areAllFieldsFilled(data)) {
          setProfile(data);
          setIsLoading(false);
          setDataReceived(true);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
          
          return true; // Dados completos recebidos, pode parar o polling
        } else {
          console.log("[POLLING] Dados recebidos, mas alguns campos estão faltando");
          return false; // Continuar polling até todos os campos serem preenchidos
        }
      }
      
      // Verificar se encontramos algo no armazenamento global
      if (window._receivedLinkedInData && window._receivedLinkedInData[linkedinUrl]) {
        console.log("[POLLING] Dados encontrados no armazenamento global:", window._receivedLinkedInData[linkedinUrl]);
        
        const data = window._receivedLinkedInData[linkedinUrl];
        
        // Verificar se são dados reais e não mockados
        if (!isRealData(data)) {
          console.log("[POLLING] Dados mockados detectados no armazenamento global, aguardando dados reais");
          return false; // Continuar polling pois são dados mockados
        }
        
        // Verificar se todos os campos de feedback estão preenchidos
        if (areAllFieldsFilled(data)) {
          delete window._receivedLinkedInData[linkedinUrl]; // Limpamos para evitar duplicação
          
          setProfile(data);
          setIsLoading(false);
          setDataReceived(true);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });

          return true; // Dados completos recebidos, pode parar o polling
        } else {
          console.log("[POLLING] Dados encontrados no armazenamento global, mas alguns campos estão faltando");
          return false; // Continuar polling até todos os campos serem preenchidos
        }
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
        }, 3000); // Verificar a cada 3 segundos
        
        // Aumentar o timeout para 5 minutos (300 segundos) para dar mais tempo
        timeoutId = setTimeout(() => {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          
          if (isLoading) {
            setIsError(true);
            setIsLoading(false);
            
            toast({
              title: "Tempo esgotado",
              description: "Não foi possível obter todos os dados do perfil após várias tentativas",
              variant: "destructive",
            });
          }
        }, 300000); // 300 segundos (5 minutos)
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
