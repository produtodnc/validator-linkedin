
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendUrlToWebhook } from "@/services/linkedinService";
import EmailModal from "@/components/EmailModal";

const Home = () => {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check URL parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");
    const showHeaderParam = queryParams.get("show-header");

    // Store email from URL parameter if present
    if (emailParam) {
      setUserEmail(emailParam);
      
      // If show-header=true, redirect to results page automatically
      if (showHeaderParam === "true") {
        // Check if there's a stored LinkedIn URL in localStorage
        const storedUrl = localStorage.getItem('currentProfileUrl');
        if (storedUrl) {
          navigate("/resultados", {
            state: {
              linkedinUrl: storedUrl
            }
          });
        }
      }
    }
  }, [location, navigate]);

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

    // If we don't have the user's email yet, show the email modal
    if (!userEmail) {
      setShowEmailModal(true);
      return;
    }

    // If we have the email, proceed with form submission
    await processLinkedinUrl();
  };

  const processLinkedinUrl = async () => {
    setIsLoading(true);
    try {
      // Utilizando nossa função específica para enviar a URL para o webhook
      const response = await sendUrlToWebhook(linkedinUrl);
      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Perfil enviado",
          description: "Seu perfil do LinkedIn foi enviado para validação"
        });

        // Redireciona para a página de resultados com a URL como parâmetro de estado
        navigate("/resultados", {
          state: {
            linkedinUrl,
            userEmail
          }
        });
      }
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

  // Handle email submission from modal
  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setShowEmailModal(false);
    
    // After getting email, process the LinkedIn URL
    processLinkedinUrl();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 bg-slate-100">
        <div className="max-w-5xl w-full text-center mb-52 mx-0 px-0 my-0 py-0">
          <h1 className="font-bold mb-6 text-[#1A1F2C] text-7xl px-[8px] py-[6px]">Validador de Linkedin</h1>
          <p className="text-lg text-gray-600 mb-8">Adicione o link do seu perfil para aumentar suas chances de conseguir a vaga dos sonhos</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="w-full max-w-4xl mx-auto mb-8">
              <div className="relative flex w-full items-center">
                <div className="relative flex-grow">
                  <Input 
                    type="url" 
                    placeholder="https://www.linkedin.com/in/seu-perfil/" 
                    value={linkedinUrl} 
                    onChange={e => setLinkedinUrl(e.target.value)} 
                    className="h-16 pr-16 pl-6 rounded-full shadow-lg w-full text-gray-700 bg-white" 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="absolute right-1 rounded-full w-12 h-12 flex items-center justify-center bg-blue-950 hover:bg-blue-800"
                >
                  {isLoading ? 
                    <span className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" /> : 
                    <ArrowRight className="text-white" size={24} />
                  }
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
      
      {/* Email Modal */}
      <EmailModal 
        open={showEmailModal} 
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />
    </div>
  );
};

export default Home;
