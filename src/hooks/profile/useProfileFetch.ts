
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInProfile } from "@/services/linkedinService";
import { 
  hasMinimumData, 
  createProfileFromData
} from "@/utils/profileDataProcessing";
import { useToast } from "@/hooks/use-toast";

interface FetchProfileResult {
  profile: LinkedInProfile | null;
  dataReceived: boolean;
  endpointStatus: number | null;
}

/**
 * Fetch profile data from Supabase
 */
export const useProfileFetch = () => {
  const [endpointStatus, setEndpointStatus] = useState<number | null>(null);
  const { toast } = useToast();

  /**
   * Fetch profile data from Supabase by record ID
   */
  const fetchResultsFromSupabase = async (
    id: string, 
    attempt: number,
    linkedinUrl: string
  ): Promise<FetchProfileResult> => {
    try {
      console.log(`[PROFILE_FETCH] Tentativa ${attempt}: Consultando dados do Supabase para o ID:`, id);
      
      // Fetch directly from the linkedin_links table using the ID
      const { data, error, status } = await supabase
        .from('linkedin_links')
        .select('*')
        .eq('id', id)
        .single();
      
      // Store the request status
      setEndpointStatus(status);
      
      if (error) {
        console.error(`[PROFILE_FETCH] Tentativa ${attempt}: Erro ao buscar dados do Supabase:`, error);
        return { profile: null, dataReceived: false, endpointStatus: status };
      }
      
      console.log(`[PROFILE_FETCH] Tentativa ${attempt}: Dados recebidos do Supabase:`, data);
      
      if (data) {
        // Check if the minimum required data is available
        const hasData = hasMinimumData(data);
        console.log(`[PROFILE_FETCH] Verificação de dados mínimos: ${hasData ? 'Sucesso' : 'Falha'}`);
        
        if (hasData) {
          console.log("[PROFILE_FETCH] Dados suficientes encontrados, criando perfil completo");
          
          // Create complete profile with data from the record
          const completeProfile = createProfileFromData(data, linkedinUrl);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
          
          return { 
            profile: completeProfile, 
            dataReceived: true,
            endpointStatus: status 
          };
        }
      }
      
      // Return a response with no data
      return { profile: null, dataReceived: false, endpointStatus: status };
      
    } catch (error) {
      console.error(`[PROFILE_FETCH] Tentativa ${attempt}: Erro ao processar dados do Supabase:`, error);
      return { profile: null, dataReceived: false, endpointStatus: null };
    }
  };

  return {
    fetchResultsFromSupabase,
    endpointStatus
  };
};
