
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
    // Se não há URL, redirecionar para home
    if (!linkedinUrl) {
      toast({
        title: "Sem dados",
        description: "Nenhum perfil foi submetido para análise",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    // Primeiro tentamos recuperar o recordId do sessionStorage
    const storedRecordId = sessionStorage.getItem(`recordId_${linkedinUrl}`);
    if (storedRecordId) {
      console.log("[URL_PROCESSOR] Recuperando ID do registro da sessão:", storedRecordId);
      setRecordId(storedRecordId);
      setIsProcessing(false);
      return;
    }
    
    // Armazenar URL na sessão para identificação
    sessionStorage.setItem('currentProfileUrl', linkedinUrl);
    
    console.log("[URL_PROCESSOR] Iniciando análise para URL:", linkedinUrl);
    
    // Enviar URL para webhook quando o componente é montado
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
          // Armazenar o ID do registro para uso posterior
          if (response.recordId) {
            // Salvar recordId no sessionStorage com URL como parte da chave
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
    
    // Cleanup ao desmontar
    return () => {
      // Mantemos o recordId no sessionStorage para quando o usuário retornar
    };
  }, [linkedinUrl, navigate, toast]);

  return { recordId, isProcessing };
};
