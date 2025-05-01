
import React, { useEffect } from "react";
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

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Recupera a URL do LinkedIn do estado de navegação
  const linkedinUrl = location.state?.linkedinUrl || "";
  
  // Usa o hook de polling para buscar os dados
  const { isLoading, isError, profile } = usePollingFetch(linkedinUrl);
  
  useEffect(() => {
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
    
    // Envia a URL para o webhook quando o componente é montado
    const initializeProcess = async () => {
      try {
        await sendUrlToWebhook(linkedinUrl);
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
  }, [linkedinUrl, navigate, toast]);
  
  // Renderiza o componente apropriado com base no estado atual
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    } else if (isError) {
      return <ErrorState />;
    } else if (!profile) {
      return <NoDataState />;
    } else {
      return <ProfileDisplay profile={profile} />;
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

export default Results;
