
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendUrlToWebhook } from "@/services/linkedinService";

/**
 * Hook for processing LinkedIn URL submissions
 */
export const useLinkedinUrlProcessor = (linkedinUrl: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recordId, setRecordId] = useState<string | null>(null);
  
  useEffect(() => {
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
    
    // Store URL in session for identification
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
          // Store the record ID for later use
          if (response.recordId) {
            setRecordId(response.recordId);
            console.log("[RESULTS] ID do registro salvo:", response.recordId);
          } else {
            toast({
              title: "Erro",
              description: "Não foi possível obter o ID do registro",
              variant: "destructive",
            });
          }
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
    };
  }, [linkedinUrl, navigate, toast]);

  return { recordId };
};
