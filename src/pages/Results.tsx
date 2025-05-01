
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";
import ProfileDisplay from "@/components/results/ProfileDisplay";
import { sendUrlToWebhook } from "@/services/linkedinService";
import { usePollingFetch } from "@/hooks/usePollingFetch";
import { LinkedInProfile } from "@/services/linkedinService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Este componente recebe dados via POST
// Para fins de exemplo e teste, adicionamos um listener a seguir:
if (typeof window !== 'undefined' && !window._endpointListenerAdded) {
  window._endpointListenerAdded = true;
  
  // Configura um listener para interceptar requisições ao endpoint simulado
  console.log("[SETUP] Configurando receptor de endpoint simulado /api/resultado");
  
  // Monkey patch fetch para interceptar chamadas ao nosso endpoint
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    const url = input.toString();
    
    // Intercepta apenas chamadas POST ao nosso endpoint
    if (url.endsWith('/api/resultado') && init?.method === 'POST') {
      console.log("[ENDPOINT] Recebendo dados no endpoint /api/resultado");
      try {
        const body = init.body ? JSON.parse(init.body.toString()) : {};
        console.log("[ENDPOINT] Dados recebidos:", body);
        
        // Recupera a URL atual do LinkedIn da sessão
        const currentProfileUrl = sessionStorage.getItem('currentProfileUrl');
        if (currentProfileUrl) {
          console.log("[ENDPOINT] Associando dados à URL:", currentProfileUrl);
          
          // Inicializa o objeto global se ainda não existir
          if (!window._receivedLinkedInData) {
            window._receivedLinkedInData = {};
          }
          
          window._receivedLinkedInData[currentProfileUrl] = body;
        }
        
        // Disparar evento personalizado para notificar que os dados foram recebidos
        const customEvent = new CustomEvent('endpointDataReceived', { 
          detail: { 
            url: currentProfileUrl,
            data: body,
            status: 200
          } 
        });
        window.dispatchEvent(customEvent);
        
        // Simula uma resposta de sucesso
        return Promise.resolve(new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      } catch (error) {
        console.error("[ENDPOINT] Erro ao processar dados:", error);
        
        // Disparar evento personalizado para notificar que houve um erro
        const customEvent = new CustomEvent('endpointDataReceived', { 
          detail: { 
            error: 'Erro ao processar dados',
            status: 400
          } 
        });
        window.dispatchEvent(customEvent);
        
        // Simula uma resposta de erro
        return Promise.resolve(new Response(JSON.stringify({ error: 'Erro ao processar dados' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }
    
    // Para todas as outras chamadas, usa o fetch original
    return originalFetch.apply(this, [input, init]);
  };
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [endpointStatus, setEndpointStatus] = useState<number | null>(null);
  
  // Recupera a URL do LinkedIn do estado de navegação
  const linkedinUrl = location.state?.linkedinUrl || "";
  
  // Usa o hook de polling para buscar os dados
  const { isLoading, isError, profile, dataReceived } = usePollingFetch(linkedinUrl);
  
  useEffect(() => {
    // Listener para o evento personalizado
    const handleEndpointData = (event: CustomEvent) => {
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
    
    // Se não houver URL, redirecione para a página inicial
    if (!linkedinUrl) {
      toast({
        title: "Sem dados",
        description: "Nenhum perfil foi submetido para análise",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    // Registra a URL na sessão para facilitar a identificação na recepção dos dados
    sessionStorage.setItem('currentProfileUrl', linkedinUrl);
    
    console.log("[RESULTS] Iniciando análise para URL:", linkedinUrl);
    
    // Envia a URL para o webhook quando o componente é montado
    const initializeProcess = async () => {
      try {
        await sendUrlToWebhook(linkedinUrl);
        toast({
          title: "Processando",
          description: "A URL foi enviada para análise. Aguardando resultados...",
        });
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
    
    // Limpeza ao desmontar
    return () => {
      sessionStorage.removeItem('currentProfileUrl');
      window.removeEventListener('endpointDataReceived', handleEndpointData as EventListener);
    };
  }, [linkedinUrl, navigate, toast]);
  
  // Renderiza o componente apropriado com base no estado atual
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    } else if (isError) {
      return <ErrorState />;
    } else if (!dataReceived) {
      return <NoDataState message="Aguardando dados do endpoint /api/resultado..." />;
    } else if (profile) {
      return (
        <>
          {endpointStatus === 200 && (
            <Alert className="mb-6 bg-green-50">
              <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>
                Os dados foram recebidos com sucesso no endpoint e estão sendo exibidos abaixo.
              </AlertDescription>
            </Alert>
          )}
          <ProfileDisplay profile={profile} />
        </>
      );
    } else {
      return <NoDataState />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#1A1F2C]">Resultados da Validação</h1>
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Adiciona a declaração global para o TypeScript
declare global {
  interface Window {
    _endpointListenerAdded?: boolean;
    _receivedLinkedInData?: {
      [url: string]: LinkedInProfile;
    };
  }
}

export default Results;
