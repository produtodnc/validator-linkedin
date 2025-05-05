
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
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
    
    // Primeiro tentamos recuperar o recordId do localStorage e sessionStorage
    let storedRecordId = localStorage.getItem(`recordId_${linkedinUrl}`) || 
                         sessionStorage.getItem(`recordId_${linkedinUrl}`);
                         
    if (storedRecordId) {
      console.log("[URL_PROCESSOR] Recuperando ID do registro do storage:", storedRecordId);
      setRecordId(storedRecordId);
      setIsProcessing(false);
      return;
    }
    
    // Armazenar URL na sessão para identificação
    localStorage.setItem('currentProfileUrl', linkedinUrl);
    sessionStorage.setItem('currentProfileUrl', linkedinUrl);
    
    console.log("[URL_PROCESSOR] Iniciando análise para URL:", linkedinUrl);
    
    // Função para tentar enviar a URL com retry
    const attemptSendUrl = async () => {
      try {
        console.log(`[URL_PROCESSOR] Tentativa ${retryCount + 1} de enviar URL:`, linkedinUrl);
        const response = await sendUrlToWebhook(linkedinUrl);
        
        if (response.error) {
          // Verificar se devemos tentar novamente
          if (response.status === 503 && retryCount < maxRetries) {
            console.log(`[URL_PROCESSOR] Erro de conexão, agendando nova tentativa (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            
            // Tentar novamente após um atraso exponencial
            setTimeout(() => attemptSendUrl(), 2000 * Math.pow(2, retryCount));
            return;
          }
          
          // Se chegamos aqui, falhamos após todas as tentativas ou é um erro que não queremos tentar novamente
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          });
          setIsProcessing(false);
        } else {
          // Armazenar o ID do registro para uso posterior
          if (response.recordId) {
            // Salvar recordId no localStorage e sessionStorage com URL como parte da chave
            localStorage.setItem(`recordId_${linkedinUrl}`, response.recordId);
            sessionStorage.setItem(`recordId_${linkedinUrl}`, response.recordId);
            setRecordId(response.recordId);
            console.log("[URL_PROCESSOR] ID do registro salvo:", response.recordId);
            
            toast({
              title: "Perfil enviado",
              description: response.message || "Seu perfil foi enviado para análise",
            });
          } else {
            toast({
              title: "Aviso",
              description: "Não foi possível obter o ID do registro, mas continuaremos tentando",
            });
          }
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("[URL_PROCESSOR] Erro ao iniciar o processo:", error);
        
        // Verificar se devemos tentar novamente
        if (retryCount < maxRetries) {
          console.log(`[URL_PROCESSOR] Erro ao enviar URL, agendando nova tentativa (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          
          // Tentar novamente após um atraso exponencial
          setTimeout(() => attemptSendUrl(), 2000 * Math.pow(2, retryCount));
          return;
        }
        
        toast({
          title: "Erro",
          description: "Não foi possível enviar os dados para processamento após várias tentativas",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };
    
    // Iniciar o processo de envio
    attemptSendUrl();
    
    // Cleanup ao desmontar
    return () => {
      // Mantemos o recordId no localStorage e sessionStorage para quando o usuário retornar
    };
  }, [linkedinUrl, navigate, toast, retryCount]);

  return { recordId, isProcessing, retryCount };
};
