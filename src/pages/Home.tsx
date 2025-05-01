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
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validação básica do formato de URL do LinkedIn
    if (!linkedinUrl.includes("linkedin.com/")) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do LinkedIn",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Simulação de validação concluída com sucesso
      toast({
        title: "Perfil enviado",
        description: "Seu perfil do LinkedIn foi enviado para validação"
      });

      // Redireciona para a página de resultados com a URL como parâmetro de estado
      navigate("/resultados", {
        state: {
          linkedinUrl
        }
      });
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="max-w-5xl w-full text-center mb-52 mx-0 px-0 my-0 py-0">
          <h1 className="font-bold mb-6 text-[#1A1F2C] text-7xl px-[8px] py-[6px]">Validador de Linkedin</h1>
          <p className="text-lg text-gray-600 mb-8">Adicione o link do seu perfil para aumentar suas chances de conseguir a vaga dos sonhos</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="w-full max-w-4xl mx-auto mb-8">
              <div className="relative flex w-full items-center">
                <div className="relative flex-grow">
                  <Input type="url" placeholder="https://www.linkedin.com/in/seu-perfil/" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="h-16 pr-16 pl-6 rounded-full shadow-lg w-full text-gray-700 bg-white" required />
                </div>
                <Button type="submit" className="absolute right-1 rounded-full w-14 h-14 bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center" disabled={isLoading}>
                  {isLoading ? <span className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" /> : <ArrowRight className="text-white" size={24} />}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Home;