
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultsContainer from "@/components/results/ResultsContainer";
import ResultContent from "@/components/results/ResultContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [linkedinUrl, setLinkedinUrl] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState<boolean>(true);

  useEffect(() => {
    // Check URL parameters first
    const queryParams = new URLSearchParams(window.location.search);
    const emailParam = queryParams.get("email");
    const showHeaderParam = queryParams.get("show-header");
    
    if (emailParam) {
      setUserEmail(emailParam);
    }
    
    if (showHeaderParam === "false") {
      setShowHeader(false);
    }
    
    // Check URL from location state (from navigation)
    const state = location.state as { linkedinUrl?: string; userEmail?: string } | null;
    if (state?.linkedinUrl) {
      setLinkedinUrl(state.linkedinUrl);
      
      // Also get email from state if available
      if (state.userEmail) {
        setUserEmail(state.userEmail);
      }
      
      return;
    }
    
    // If no URL in state, try to get from localStorage
    const storedUrl = localStorage.getItem('currentProfileUrl');
    if (storedUrl) {
      setLinkedinUrl(storedUrl);
      return;
    }

    // If we couldn't get the URL, redirect to home
    if (!emailParam) {
      toast({
        title: "Sem dados",
        description: "Nenhum perfil foi submetido para análise",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [location, navigate, toast]);
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {showHeader && <Header />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-6 self-start flex items-center text-gray-600"
          >
            <ArrowLeft className="mr-2" size={18} />
            Voltar para o início
          </Button>
          
          <div className="w-full max-w-5xl mx-auto">
            <ResultsContainer linkedinUrl={linkedinUrl}>
              <ResultContent />
            </ResultsContainer>
          </div>
        </div>
      </main>
      
      {showHeader && <Footer />}
    </div>
  );
};

export default Results;
