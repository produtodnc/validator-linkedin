
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
  const { toast } = useToast();

  useEffect(() => {
    if (!recordId) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const fetchResultsAfterDelay = () => {
      toast({
        title: "Processando",
        description: "A URL foi registrada. Aguarde 20 segundos enquanto processamos os dados...",
      });
      
      // Wait 20 seconds before fetching results
      setTimeout(() => {
        fetchResultsFromSupabase(recordId);
      }, 20000);
    };

    fetchResultsAfterDelay();
  }, [linkedinUrl, recordId, toast]);

  const fetchResultsFromSupabase = async (id: string) => {
    try {
      console.log("[RESULTS] Buscando dados do Supabase para o ID:", id);
      
      // Fetch directly from the linkedin_links table using the ID
      const { data, error } = await supabase
        .from('linkedin_links')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("[RESULTS] Erro ao buscar dados do Supabase:", error);
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Erro",
          description: "Não foi possível recuperar os dados do perfil",
          variant: "destructive",
        });
        return;
      }
      
      console.log("[RESULTS] Dados recebidos do Supabase:", data);
      
      if (data) {
        // Check if the minimum required data is available
        if (hasMinimumData(data)) {
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
          console.log("[RESULTS] Dados mínimos não encontrados, inserindo dados simulados para teste");
          
          // For demonstration, create mock data if no real data is available
          const mockProfile = createMockProfile(linkedinUrl);
          
          setProfile(mockProfile);
          setDataReceived(true);
          setIsLoading(false);
          
          toast({
            title: "Usando Dados de Teste",
            description: "Não encontramos dados reais para seu perfil. Exibindo dados de demonstração.",
            variant: "default",
          });
        }
      } else {
        console.log("[RESULTS] Nenhum dado encontrado para o ID:", id);
        
        // No data found, show error
        setIsError(true);
        setIsLoading(false);
        
        toast({
          title: "Dados não encontrados",
          description: "Não foi possível encontrar os dados do perfil. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[RESULTS] Erro ao processar dados do Supabase:", error);
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
    dataReceived
  };
};
