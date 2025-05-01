
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Interface para dados simulados do perfil LinkedIn
interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
  completionScore: number;
  suggestedImprovements: string[];
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  
  // Recupera a URL do LinkedIn do estado de navegação
  const linkedinUrl = location.state?.linkedinUrl || "";
  
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
    
    // Simula uma chamada de API para obter os resultados da validação
    const fetchProfileData = async () => {
      setIsLoading(true);
      
      try {
        // Simulando tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados simulados (em um cenário real, viriam da API)
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
        
        setProfile(mockData);
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível obter os dados do perfil",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [linkedinUrl, navigate, toast]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#1A1F2C]">Resultados da Validação</h1>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-12 w-12 border-4 border-t-[#0FA0CE] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Analisando seu perfil do LinkedIn...</p>
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
