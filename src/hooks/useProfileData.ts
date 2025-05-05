
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInProfile } from "@/services/linkedinService";
import { 
  hasMinimumData, 
  createProfileFromData, 
  createMockProfile 
} from "@/utils/profileDataProcessing";

/**
 * Hook for handling LinkedIn profile data fetching and processing
 */
export const useProfileData = (linkedinUrl: string, recordId: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [dataReceived, setDataReceived] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!recordId) {
      console.error("[RESULTS] ID de registro não encontrado");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const fetchResultsWithPolling = async () => {
      // Primeiro toast ao iniciar o processo
      toast({
        title: "Processando",
        description: "A URL foi registrada. Consultando dados em tempo real...",
      });
      
      // Vamos consultar a cada 5 segundos por 4 vezes (20 segundos total)
      let attempt = 1;
      const maxAttempts = 4;
      const intervalMs = 5000;
      
      // Consulta imediata
      await fetchResultsFromSupabase(recordId, attempt);
      
      // Configurar o intervalo para as próximas consultas
      const pollingInterval = setInterval(async () => {
        // Incrementar tentativa para log
        attempt++;
        
        // Se já recebemos dados ou tivemos um erro, interromper polling
        if (dataReceived || isError) {
          clearInterval(pollingInterval);
          return;
        }
        
        // Se atingimos o número máximo de tentativas, interromper polling
        if (attempt > maxAttempts) {
          clearInterval(pollingInterval);
          
          // Se não recebemos dados após todas as tentativas, agendar mais 3 tentativas com intervalo de 10s
          if (!dataReceived && !isError) {
            console.log("[RESULTS] Início das tentativas adicionais...");
            startAdditionalAttempts(recordId);
          }
          return;
        }
        
        console.log(`[RESULTS] Consulta ${attempt}/${maxAttempts} durante os primeiros 20 segundos`);
        setRetryCount(attempt - 1);
        await fetchResultsFromSupabase(recordId, attempt);
      }, intervalMs);
      
      // Limpar intervalo quando o componente for desmontado
      return () => clearInterval(pollingInterval);
    };

    fetchResultsWithPolling();
  }, [linkedinUrl, recordId, toast]);
  
  // Função para iniciar tentativas adicionais após os 20 segundos iniciais
  const startAdditionalAttempts = (id: string) => {
    let additionalAttempt = 1;
    const maxAdditionalAttempts = 3;
    
    const tryAgain = async () => {
      console.log(`[RESULTS] Tentativa adicional ${additionalAttempt}/${maxAdditionalAttempts}`);
      setRetryCount(additionalAttempt);
      
      await fetchResultsFromSupabase(id, additionalAttempt + 4); // +4 porque já fizemos 4 tentativas
      
      additionalAttempt++;
      
      // Se já recebemos dados ou tivemos um erro, não agendar mais tentativas
      if (dataReceived || isError || additionalAttempt > maxAdditionalAttempts) {
        return;
      }
      
      // Agendar próxima tentativa
      setTimeout(tryAgain, 10000);
    };
    
    // Iniciar a primeira tentativa adicional
    setTimeout(tryAgain, 10000);
  };

  const fetchResultsFromSupabase = async (id: string, attempt: number) => {
    try {
      console.log(`[RESULTS] Tentativa ${attempt}: Consultando dados do Supabase para o ID:`, id);
      
      // Fetch directly from the linkedin_links table using the ID
      const { data, error } = await supabase
        .from('linkedin_links')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`[RESULTS] Tentativa ${attempt}: Erro ao buscar dados do Supabase:`, error);
        
        // Não configuramos erro aqui, apenas continuamos com o polling
        return;
      }
      
      console.log(`[RESULTS] Tentativa ${attempt}: Dados recebidos do Supabase:`, data);
      
      if (data) {
        // Check if the minimum required data is available
        if (hasMinimumData(data)) {
          console.log("[RESULTS] Dados suficientes encontrados, criando perfil completo");
          
          // Create complete profile with data from the record
          const completeProfile = createProfileFromData(data, linkedinUrl);
          
          setProfile(completeProfile);
          setDataReceived(true);
          setIsLoading(false);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
          
          return true; // Dados encontrados
        } else {
          console.log("[RESULTS] Dados encontrados, mas não são suficientes.");
          return false; // Dados insuficientes
        }
      } else {
        console.log(`[RESULTS] Nenhum dado encontrado para o ID na tentativa ${attempt}:`, id);
        return false; // Nenhum dado
      }
    } catch (error) {
      console.error(`[RESULTS] Tentativa ${attempt}: Erro ao processar dados do Supabase:`, error);
      
      // Se for a última tentativa de todas (após as adicionais), exibir erro
      if (attempt >= 7) { // 4 iniciais + 3 adicionais
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar os dados do perfil",
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  return {
    isLoading,
    isError,
    profile,
    dataReceived,
    retryCount
  };
};
