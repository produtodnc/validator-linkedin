
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Interface para dados do perfil LinkedIn
interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
  completionScore: number;
  suggestedImprovements: string[];
}

// Interface para resposta da API
interface ApiResponse {
  data: LinkedInProfile | null;
  error?: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  
  // Recupera a URL do LinkedIn do estado de navegação
  const linkedinUrl = location.state?.linkedinUrl || "";
  
  // URL do webhook para enviar os dados
  const webhookUrl = "https://workflow.dnc.group/webhook-test/e8a75359-7699-4bef-bdfd-8dcc3d793964";
  
  // URL do nosso endpoint que receberá os dados processados
  // Este endpoint seria implementado em um servidor real
  // Para este exemplo, usaremos um endpoint de demonstração
  const ourEndpointUrl = "https://webhook.site/d8bb66ed-56a3-472c-9a21-2f39144edd01";
  
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
    
    let endpointPolling: NodeJS.Timeout;
    
    // Função para enviar a URL do LinkedIn para o webhook
    const sendUrlToWebhook = async () => {
      try {
        // Envia a URL para o webhook especificado
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors", // Para evitar erros de CORS
          body: JSON.stringify({
            linkedinUrl,
            callbackUrl: ourEndpointUrl,
            requestTime: new Date().toISOString()
          }),
        });
        
        console.log("URL do LinkedIn enviada para o webhook");
        
        // Inicia o polling do nosso endpoint para verificar se os dados já foram processados
        startPollingEndpoint();
      } catch (error) {
        console.error("Erro ao enviar URL para o webhook:", error);
        setIsError(true);
        setIsLoading(false);
        toast({
          title: "Erro",
          description: "Não foi possível enviar os dados para processamento",
          variant: "destructive",
        });
      }
    };
    
    // Função para iniciar o polling do nosso endpoint
    const startPollingEndpoint = () => {
      // Verifica o endpoint a cada 3 segundos
      endpointPolling = setInterval(checkEndpointForData, 3000);
    };
    
    // Função para verificar se os dados já foram processados
    const checkEndpointForData = async () => {
      try {
        // Consulta nosso endpoint com a URL como parâmetro para identificar os dados específicos
        const response = await fetch(`${ourEndpointUrl}?url=${encodeURIComponent(linkedinUrl)}`);
        
        // Como estamos usando um endpoint de demonstração, vamos simular a resposta
        // Em um cenário real, aqui você iria verificar a resposta real do seu endpoint
        
        // Simulando um tempo de processamento
        const currentTime = new Date().getTime();
        const startTime = sessionStorage.getItem('processingStartTime');
        
        if (!startTime) {
          sessionStorage.setItem('processingStartTime', currentTime.toString());
          return; // Continua o polling
        }
        
        // Simula receber dados após 10 segundos
        if (currentTime - parseInt(startTime) > 10000) {
          // Simulando dados recebidos
          const mockData: LinkedInProfile = {
            url: linkedinUrl,
            name: "Nome do Usuário",
            headline: "Desenvolvedor Front-end",
            recommendations: 5,
            connections: "500+",
            completionScore: 85,
            suggestedImprovements: [
              "Adicione mais detalhes sobre suas experiências recentes",
              "Complete a seção de habilidades com tecnologias relevantes",
              "Solicite mais recomendações de colegas de trabalho"
            ]
          };
          
          // Limpa o intervalo de polling
          clearInterval(endpointPolling);
          sessionStorage.removeItem('processingStartTime');
          
          // Atualiza o estado com os dados recebidos
          setProfile(mockData);
          setIsLoading(false);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar dados no endpoint:", error);
        // Não definimos isError como true aqui para continuar tentando
      }
    };
    
    // Inicia o processo
    sendUrlToWebhook();
    
    // Limpa o intervalo quando o componente é desmontado
    return () => {
      if (endpointPolling) clearInterval(endpointPolling);
      sessionStorage.removeItem('processingStartTime');
    };
  }, [linkedinUrl, navigate, toast, webhookUrl, ourEndpointUrl]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#1A1F2C]">Resultados da Validação</h1>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-12 w-12 border-4 border-t-[#0FA0CE] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 mt-4">Aguarde enquanto processamos seu perfil do LinkedIn...</p>
              <p className="text-gray-500 text-sm mt-2">Este processo pode levar até 15 segundos.</p>
            </div>
          ) : isError ? (
            <div className="text-center p-8">
              <p className="text-gray-600">Ocorreu um erro ao buscar os dados do perfil.</p>
              <Button 
                onClick={() => navigate("/")} 
                className="mt-4 bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white"
              >
                Voltar e tentar novamente
              </Button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="text-2xl">Informações do Perfil</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-700">URL</p>
                      <p className="text-sm text-gray-600 break-all">{profile.url}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Nome</p>
                      <p className="text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Título</p>
                      <p className="text-gray-900">{profile.headline}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-700">Recomendações</p>
                        <p className="text-gray-900">{profile.recommendations}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Conexões</p>
                        <p className="text-gray-900">{profile.connections}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg border-t-4 border-t-[#0FA0CE]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span>Índice de Completude</span>
                    <span className="ml-auto text-[#0FA0CE]">{profile.completionScore}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0FA0CE] rounded-full" 
                      style={{ width: `${profile.completionScore}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Sugestões de Melhoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {profile.suggestedImprovements.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">{suggestion}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white"
                >
                  Validar outro perfil
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600">Nenhum dado disponível. Por favor, tente novamente.</p>
              <Button 
                onClick={() => navigate("/")} 
                className="mt-4 bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white"
              >
                Voltar para a página inicial
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
