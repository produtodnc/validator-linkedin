
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

    const fetchResultsWithRetry = async () => {
      // Primeiro toast ao iniciar o processo
      toast({
        title: "Processando",
        description: "A URL foi registrada. Aguarde enquanto processamos os dados...",
      });
      
      // Primeira tentativa após 20 segundos
      setTimeout(() => {
        fetchResultsFromSupabase(recordId, 1);
      }, 20000);
    };

    fetchResultsWithRetry();
  }, [linkedinUrl, recordId, toast]);

  const fetchResultsFromSupabase = async (id: string, attempt: number) => {
    try {
      console.log(`[RESULTS] Tentativa ${attempt}: Buscando dados do Supabase para o ID:`, id);
      
      // Fetch directly from the linkedin_links table using the ID
      const { data, error } = await supabase
        .from('linkedin_links')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`[RESULTS] Tentativa ${attempt}: Erro ao buscar dados do Supabase:`, error);
        
        // Se for a primeira tentativa, tentar novamente após 10 segundos
        if (attempt < 3) {
          console.log(`[RESULTS] Agendando nova tentativa em 10 segundos...`);
          setTimeout(() => {
            setRetryCount(attempt);
            fetchResultsFromSupabase(id, attempt + 1);
          }, 10000);
          return;
        }
        
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Erro",
          description: "Não foi possível recuperar os dados do perfil após várias tentativas",
          variant: "destructive",
        });
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
        } else {
          console.log("[RESULTS] Dados encontrados, mas não são suficientes.");
          
          // Se não for a última tentativa, tentar novamente após 10 segundos
          if (attempt < 3) {
            console.log(`[RESULTS] Agendando nova tentativa em 10 segundos...`);
            setTimeout(() => {
              setRetryCount(attempt);
              fetchResultsFromSupabase(id, attempt + 1);
            }, 10000);
            return;
          }
          
          console.log("[RESULTS] Dados mínimos não encontrados após várias tentativas, usando dados de demonstração");
          
          // For demonstration, create mock data if no real data is available after retries
          const mockProfile = createMockProfile(linkedinUrl);
          
          setProfile(mockProfile);
          setDataReceived(true);
          setIsLoading(false);
          
          toast({
            title: "Usando Dados de Teste",
            description: "Não encontramos dados completos para seu perfil. Exibindo dados de demonstração.",
            variant: "default",
          });
        }
      } else {
        console.log(`[RESULTS] Nenhum dado encontrado para o ID na tentativa ${attempt}:`, id);
        
        // Se não for a última tentativa, tentar novamente após 10 segundos
        if (attempt < 3) {
          console.log(`[RESULTS] Agendando nova tentativa em 10 segundos...`);
          setTimeout(() => {
            setRetryCount(attempt);
            fetchResultsFromSupabase(id, attempt + 1);
          }, 10000);
          return;
        }
        
        // No data found after all retries, show error
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Dados não encontrados",
          description: "Não foi possível encontrar os dados do perfil após várias tentativas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`[RESULTS] Tentativa ${attempt}: Erro ao processar dados do Supabase:`, error);
      
      // Se não for a última tentativa, tentar novamente após 10 segundos
      if (attempt < 3) {
        console.log(`[RESULTS] Agendando nova tentativa em 10 segundos...`);
        setTimeout(() => {
          setRetryCount(attempt);
          fetchResultsFromSupabase(id, attempt + 1);
        }, 10000);
        return;
      }
      
      setIsError(true);
      setIsLoading(false);
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar os dados do perfil",
        variant: "destructive",
      });
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
