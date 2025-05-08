import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendUrlToWebhook, cleanupOldStorageKeys } from "@/services/linkedinService";
import { saveCurrentProfileUrl, getRecordIdFromStorage } from "@/services/linkedinService";

/**
 * Hook for processing LinkedIn URL submissions
 */
export const useLinkedinUrlProcessor = (linkedinUrl: string, userEmail: string | null = null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Keep track of the current URL being processed
  const currentUrlRef = useRef<string | null>(null);
  
  // Clean storage keys for URLs that are no longer relevant
  const cleanupOldStorageKeys = () => {
    // Get all keys from localStorage
    const allKeys = Object.keys(localStorage);
    
    // Find keys that start with recordId_ but don't match the current URL
    const keysToRemove = allKeys.filter(key => 
      key.startsWith('recordId_') && key !== `recordId_${linkedinUrl}`
    );
    
    // Remove old keys to prevent storage bloat
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
      }
    });
  };
  
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
    
    // Se a URL não mudou e já estamos processando, não faça nada
    if (currentUrlRef.current === linkedinUrl && recordId) {
      return;
    }
    
    // Reset state for new URL
    setIsProcessing(true);
    setRetryCount(0);
    setRecordId(null);
    
    // Atualiza a URL de referência
    currentUrlRef.current = linkedinUrl;
    
    // Primeiro tentamos recuperar o recordId do localStorage e sessionStorage
    let storedRecordId = getRecordIdFromStorage(linkedinUrl);
                         
    if (storedRecordId) {
      console.log("[URL_PROCESSOR] Recovering record ID from storage:", storedRecordId);
      setRecordId(storedRecordId);
      setIsProcessing(false);
      
      // Clean up old keys to avoid storage bloat
      cleanupOldStorageKeys();
      return;
    }
    
    // Armazenar URL na sessão para identificação
    saveCurrentProfileUrl(linkedinUrl);
    
    console.log("[URL_PROCESSOR] Iniciando análise para URL:", linkedinUrl);
    console.log("[URL_PROCESSOR] Email do usuário:", userEmail);
    
    // Função para tentar enviar a URL com retry
    const attemptSendUrl = async () => {
      try {
        // Verificar se a URL atual ainda é a mesma que estamos processando
        if (currentUrlRef.current !== linkedinUrl) {
          console.log("[URL_PROCESSOR] URL mudou durante o processamento, abortando requisição anterior");
          return;
        }
        
        console.log(`[URL_PROCESSOR] Tentativa ${retryCount + 1} de enviar URL:`, linkedinUrl);
        const response = await sendUrlToWebhook(linkedinUrl, userEmail);
        
        // Verificar novamente se a URL não mudou durante a requisição
        if (currentUrlRef.current !== linkedinUrl) {
          console.log("[URL_PROCESSOR] URL mudou após a requisição, ignorando resultado");
          return;
        }
        
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
            
            // Clean up old keys to avoid storage bloat
            cleanupOldStorageKeys();
            
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
        
        // Verificar se a URL atual ainda é a mesma que estamos processando
        if (currentUrlRef.current !== linkedinUrl) {
          console.log("[URL_PROCESSOR] URL mudou durante o erro, abortando retry");
          return;
        }
        
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
  }, [linkedinUrl, navigate, toast, retryCount, maxRetries, recordId, userEmail]);

  return { recordId, isProcessing, retryCount };
};
