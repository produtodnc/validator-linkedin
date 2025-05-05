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
  const [isProcessing, setIsProcessing] = useState(true);
  
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
    
    // Try to recover recordId from sessionStorage first
    const storedRecordId = sessionStorage.getItem(`recordId_${linkedinUrl}`);
    if (storedRecordId) {
      console.log("[URL_PROCESSOR] Recuperando ID do registro da sessão:", storedRecordId);
      setRecordId(storedRecordId);
      setIsProcessing(false);
      return;
    }
    
    // Store URL in session for identification
    sessionStorage.setItem('currentProfileUrl', linkedinUrl);
    
    console.log("[URL_PROCESSOR] Iniciando análise para URL:", linkedinUrl);
    
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
          setIsProcessing(false);
        } else {
          // Store the record ID for later use
          if (response.recordId) {
            // Save recordId to sessionStorage with URL as part of the key
            sessionStorage.setItem(`recordId_${linkedinUrl}`, response.recordId);
            setRecordId(response.recordId);
            console.log("[URL_PROCESSOR] ID do registro salvo:", response.recordId);
          } else {
            toast({
              title: "Erro",
              description: "Não foi possível obter o ID do registro",
              variant: "destructive",
            });
          }
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("[URL_PROCESSOR] Erro ao iniciar o processo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar os dados para processamento",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };
    
    initializeProcess();
    
    // Cleanup when unmounting
    return () => {
      // We keep the recordId in session storage for when the user returns
    };
  }, [linkedinUrl, navigate, toast]);

  return { recordId, isProcessing };
};
