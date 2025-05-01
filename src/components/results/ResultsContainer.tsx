
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendUrlToWebhook } from "@/services/linkedinService";
import { usePollingFetch } from "@/hooks/usePollingFetch";
import { EndpointEventDetail } from "@/utils/endpointListener";

interface ResultsContainerProps {
  linkedinUrl: string;
  children: React.ReactNode;
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({ linkedinUrl, children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [endpointStatus, setEndpointStatus] = useState<number | null>(null);
  
  // Use polling hook to fetch data
  const { isLoading, isError, profile, dataReceived } = usePollingFetch(linkedinUrl);
  
  useEffect(() => {
    // Handler for the custom event
    const handleEndpointData = (event: CustomEvent<EndpointEventDetail>) => {
      console.log("[RESULTS] Dados recebidos do endpoint:", event.detail);
      
      if (event.detail.status === 200) {
        setEndpointStatus(200);
        toast({
          title: "Sucesso",
          description: "Os dados foram enviados com sucesso",
        });
      } else if (event.detail.status === 400) {
        setEndpointStatus(400);
        toast({
          title: "Erro",
          description: event.detail.error || "Ocorreu um erro ao processar os dados",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('endpointDataReceived', handleEndpointData as EventListener);
    
    // If there's no URL, redirect to home page
    if (!linkedinUrl) {
      toast({
        title: "Sem dados",
        description: "Nenhum perfil foi submetido para análise",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    // Store URL in session for identification when receiving data
    sessionStorage.setItem('currentProfileUrl', linkedinUrl);
    
    console.log("[RESULTS] Iniciando análise para URL:", linkedinUrl);
    
    // Send URL to webhook when component is mounted
    const initializeProcess = async () => {
      try {
        const response = await sendUrlToWebhook(linkedinUrl);
        
        if (response.error) {
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Processando",
            description: "A URL foi enviada para análise. Aguardando resultados...",
          });
        }
      } catch (error) {
        console.error("Erro ao iniciar o processo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar os dados para processamento",
          variant: "destructive",
        });
      }
    };
    
    initializeProcess();
    
    // Cleanup when unmounting
    return () => {
      sessionStorage.removeItem('currentProfileUrl');
      window.removeEventListener('endpointDataReceived', handleEndpointData as EventListener);
    };
  }, [linkedinUrl, navigate, toast]);
  
  return React.cloneElement(children as React.ReactElement, {
    isLoading,
    isError,
    profile,
    dataReceived,
    endpointStatus
  });
};

export default ResultsContainer;
