
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendUrlToWebhook } from "@/services/api/linkedinApi";
import { saveCurrentProfileUrl } from "@/services/utils/storageUtils";
import EmailModal from "@/components/EmailModal";

const Home = () => {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [autoRedirect, setAutoRedirect] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check URL parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");
    const showHeaderParam = queryParams.get("show-header");
    const headerParam = queryParams.get("header");
    
    // Store email from URL parameter if present
    if (emailParam) {
      console.log("[HOME] Email found in URL parameters:", emailParam);
      setUserEmail(emailParam);
      
      // Set hideHeader to true if show-header=true OR header=true
      if (showHeaderParam === "true" || headerParam === "true") {
        console.log("[HOME] Header hiding parameter detected");
        setHideHeader(true);
        setAutoRedirect(true);
      }
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation for LinkedIn URL format
    if (!linkedinUrl.includes("linkedin.com/")) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do LinkedIn",
        variant: "destructive"
      });
      return;
    }

    // Save the LinkedIn URL to localStorage for future reference
    saveCurrentProfileUrl(linkedinUrl);
    console.log("[HOME] LinkedIn URL saved to localStorage:", linkedinUrl);

    // If we don't have the user's email yet and not in auto-redirect mode, show the email modal
    if (!userEmail && !autoRedirect) {
      setShowEmailModal(true);
      return;
    }

    // If we have the email or in auto-redirect mode, proceed with form submission
    await processLinkedinUrl();
  };

  const processLinkedinUrl = async () => {
    setIsLoading(true);
    try {
      // Send the URL to the webhook
      const response = await sendUrlToWebhook(linkedinUrl, userEmail);
      
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

        // Redirect to results page with URL and email as state parameters
        const resultPath = "/resultados";
        const navigationState = {
          linkedinUrl,
          userEmail
        };
        
        // Build query params based on available options
        let queryParams = '';
        
        // If hide header is enabled, pass the appropriate parameter
        if (hideHeader) {
          // Using show-header=true to hide the header
          queryParams = queryParams ? `${queryParams}&show-header=true` : '?show-header=true';
        } else {
          // Explicitly set show-header=false when we want to show the header
          queryParams = queryParams ? `${queryParams}&show-header=false` : '?show-header=false';
        }
        
        // Add email parameter if available
        if (userEmail) {
          queryParams = queryParams 
            ? `${queryParams}&email=${encodeURIComponent(userEmail)}` 
            : `?email=${encodeURIComponent(userEmail)}`;
        }
        
        navigate(`${resultPath}${queryParams}`, {
          state: navigationState
        });
      }
    } catch (error) {
      console.error("Error sending data:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setShowEmailModal(false);
    
    // After getting email, process the LinkedIn URL
    processLinkedinUrl();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      {!hideHeader && <Header />}
      
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
      
      {!hideHeader && <Footer />}
      
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
