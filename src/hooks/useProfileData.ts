
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
  const [endpointStatus, setEndpointStatus] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true; // Para evitar atualizações de estado após desmontagem

    if (!recordId) {
      console.log("[PROFILE_DATA] Aguardando ID de registro...");
      return;
    }

    console.log("[PROFILE_DATA] ID de registro recebido:", recordId);

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
      const immediateResult = await fetchResultsFromSupabase(recordId, attempt);
      
      // Se já recebemos dados, não precisamos continuar com polling
      if (immediateResult || !isMounted) return;
      
      // Configurar o intervalo para as próximas consultas
      const pollingInterval = setInterval(async () => {
        if (!isMounted) {
          clearInterval(pollingInterval);
          return;
        }
        
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
          if (!dataReceived && !isError && isMounted) {
            console.log("[PROFILE_DATA] Início das tentativas adicionais...");
            startAdditionalAttempts(recordId);
          }
          return;
        }
        
        console.log(`[PROFILE_DATA] Consulta ${attempt}/${maxAttempts} durante os primeiros 20 segundos`);
        if (isMounted) {
          setRetryCount(attempt - 1);
          await fetchResultsFromSupabase(recordId, attempt);
        }
      }, intervalMs);
      
      // Limpar intervalo quando o componente for desmontado
      return () => {
        isMounted = false;
        clearInterval(pollingInterval);
      };
    };

    fetchResultsWithPolling();
    
    return () => {
      isMounted = false;
    };
  }, [linkedinUrl, recordId, toast]);
  
  // Função para iniciar tentativas adicionais após os 20 segundos iniciais
  const startAdditionalAttempts = (id: string) => {
    let additionalAttempt = 1;
    const maxAdditionalAttempts = 3;
    let isMounted = true;
    
    const tryAgain = async () => {
      if (!isMounted) return;
      
      console.log(`[PROFILE_DATA] Tentativa adicional ${additionalAttempt}/${maxAdditionalAttempts}`);
      setRetryCount(additionalAttempt + 4); // +4 porque já fizemos 4 tentativas
      
      await fetchResultsFromSupabase(id, additionalAttempt + 4);
      
      additionalAttempt++;
      
      // Se já recebemos dados ou tivemos um erro, não agendar mais tentativas
      if (dataReceived || isError || additionalAttempt > maxAdditionalAttempts || !isMounted) {
        return;
      }
      
      // Agendar próxima tentativa
      setTimeout(tryAgain, 10000);
    };
    
    // Iniciar a primeira tentativa adicional
    setTimeout(tryAgain, 10000);
    
    return () => {
      isMounted = false;
    };
  };

  const fetchResultsFromSupabase = async (id: string, attempt: number) => {
    try {
      console.log(`[PROFILE_DATA] Tentativa ${attempt}: Consultando dados do Supabase para o ID:`, id);
      
      // Fetch directly from the linkedin_links table using the ID
      const { data, error, status } = await supabase
        .from('linkedin_links')
        .select('*')
        .eq('id', id)
        .single();
      
      // Armazenar o status da requisição
      setEndpointStatus(status);
      
      if (error) {
        console.error(`[PROFILE_DATA] Tentativa ${attempt}: Erro ao buscar dados do Supabase:`, error);
        
        // Não configuramos erro aqui, apenas continuamos com o polling
        return false;
      }
      
      console.log(`[PROFILE_DATA] Tentativa ${attempt}: Dados recebidos do Supabase:`, data);
      
      if (data) {
        // Check if the minimum required data is available
        const hasData = hasMinimumData(data);
        console.log(`[PROFILE_DATA] Verificação de dados mínimos: ${hasData ? 'Sucesso' : 'Falha'}`);
        
        if (hasData) {
          console.log("[PROFILE_DATA] Dados suficientes encontrados, criando perfil completo");
          
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
          // Se estivermos na última tentativa, finalize o loading e mostre o estado "sem dados"
          // mas não defina como erro
          if (attempt >= 7) { // 4 iniciais + 3 adicionais
            console.log("[PROFILE_DATA] Após todas as tentativas, dados insuficientes. Mostrando mensagem de 'sem dados'.");
            setIsLoading(false);
            setDataReceived(false); // Marcar explicitamente como sem dados
            
            toast({
              title: "Análise incompleta",
              description: "Não conseguimos obter dados suficientes para análise completa",
              variant: "destructive",
            });
          }
          
          console.log("[PROFILE_DATA] Dados encontrados, mas não são suficientes.");
          return false; // Dados insuficientes
        }
      } else {
        console.log(`[PROFILE_DATA] Nenhum dado encontrado para o ID na tentativa ${attempt}:`, id);
        
        // Se for a última tentativa de todas, mostrar estado "sem dados"
        if (attempt >= 7) { // 4 iniciais + 3 adicionais
          setIsLoading(false);
          setDataReceived(false);
          
          toast({
            title: "Sem dados",
            description: "Não conseguimos recuperar os dados do perfil após várias tentativas",
            variant: "destructive",
          });
        }
        
        return false; // Nenhum dado
      }
    } catch (error) {
      console.error(`[PROFILE_DATA] Tentativa ${attempt}: Erro ao processar dados do Supabase:`, error);
      
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
    retryCount,
    endpointStatus
  };
};
