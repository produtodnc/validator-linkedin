
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Home = () => {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validação básica do formato de URL do LinkedIn
    if (!linkedinUrl.includes("linkedin.com/")) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do LinkedIn",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Se o webhook URL estiver definido, envie os dados para ele
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            linkedinUrl,
            timestamp: new Date().toISOString(),
          }),
        });
      }
      
      // Simulação de validação concluída com sucesso
      toast({
        title: "Perfil enviado",
        description: "Seu perfil do LinkedIn foi enviado para validação",
      });
      
      // Redireciona para a página de resultados com a URL como parâmetro de estado
      navigate("/resultados", { state: { linkedinUrl } });
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-[#1A1F2C]">Validador de Linkedin</h1>
          <p className="text-lg text-gray-600 mb-8">
            Adicione o link do seu perfil para aumentar suas chances de conseguir a vaga dos sonhos
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="relative flex-grow">
                <Input
                  type="url"
                  placeholder="https://www.linkedin.com/in/seu-perfil/"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="h-12 pr-4 pl-4 rounded-lg w-full"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-6 bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : (
                  <>
                    Enviar <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-left mt-8">
              <h3 className="text-sm font-medium mb-2 text-gray-700">Configurações avançadas (opcional)</h3>
              <div className="flex flex-col mb-2">
                <label htmlFor="webhookUrl" className="text-xs text-gray-500 mb-1">
                  Webhook URL para processar os dados
                </label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://seu-webhook.com/endpoint"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adicione aqui sua URL de Webhook para processamento personalizado dos dados
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
