
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendUrlToWebhook } from "@/services/linkedinService";
import { supabase } from "@/integrations/supabase/client";
import { ResultContentProps } from "@/components/results/ResultContent";

interface ResultsContainerProps {
  linkedinUrl: string;
  children: React.ReactNode;
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({ linkedinUrl, children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dataReceived, setDataReceived] = useState(false);
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
          setIsError(true);
          setIsLoading(false);
        } else {
          // Store the record ID for later use
          if (response.recordId) {
            setRecordId(response.recordId);
            console.log("[RESULTS] ID do registro salvo:", response.recordId);
          }
          
          toast({
            title: "Processando",
            description: "A URL foi enviada para análise. Aguardando resultados...",
          });
          
          // Set a timeout to fetch data after 20 seconds
          setTimeout(() => {
            fetchResultsFromSupabase(response.recordId);
          }, 20000); // 20 seconds
        }
      } catch (error) {
        console.error("Erro ao iniciar o processo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar os dados para processamento",
          variant: "destructive",
        });
        setIsError(true);
        setIsLoading(false);
      }
    };
    
    initializeProcess();
    
    // Cleanup when unmounting
    return () => {
      sessionStorage.removeItem('currentProfileUrl');
    };
  }, [linkedinUrl, navigate, toast]);
  
  // Function to fetch results directly from Supabase using the record ID
  const fetchResultsFromSupabase = async (id: string | undefined) => {
    if (!id) {
      console.error("[RESULTS] Não foi possível obter o ID do registro");
      setIsError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("[RESULTS] Buscando dados do Supabase para o ID:", id);
      
      const { data, error } = await supabase
        .from('linkedin_links')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("[RESULTS] Erro ao buscar dados do Supabase:", error);
        setIsError(true);
        setIsLoading(false);
        return;
      }
      
      console.log("[RESULTS] Dados recebidos do Supabase:", data);
      
      if (data) {
        // Check if all required fields are filled
        const hasAllFields = checkRequiredFields(data);
        
        if (hasAllFields) {
          // Add any missing properties that the profile object should have
          const completeProfile = {
            ...data,
            url: linkedinUrl,
            name: "Perfil LinkedIn",
            headline: "LinkedIn Profile",
            recommendations: 0,
            connections: "500+",
            completionScore: calculateCompletionScore(data),
            suggestedImprovements: generateSuggestedImprovements(data)
          };
          
          setProfile(completeProfile);
          setDataReceived(true);
          setIsLoading(false);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
        } else {
          // If fields are not filled yet, set an error
          console.log("[RESULTS] Alguns campos obrigatórios não estão preenchidos");
          setIsError(true);
          setIsLoading(false);
          
          toast({
            title: "Dados incompletos",
            description: "Alguns dados do perfil ainda não foram processados. Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      } else {
        console.log("[RESULTS] Nenhum dado encontrado para o ID:", id);
        setIsError(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[RESULTS] Erro ao processar dados do Supabase:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };
  
  // Check if all required fields are filled
  const checkRequiredFields = (data: any) => {
    const requiredFields = [
      'feedback_headline', 'feedback_headline_nota',
      'feedback_sobre', 'feedback_sobre_nota',
      'feedback_experience', 'feedback_experience_nota',
      'feedback_projetos', 'feedback_projetos_nota',
      'feedback_certificados', 'feedback_certificados_nota'
    ];
    
    return requiredFields.every(field => {
      const hasValue = !!data[field];
      if (!hasValue) {
        console.log(`[RESULTS] Campo obrigatório não preenchido: ${field}`);
      }
      return hasValue;
    });
  };
  
  // Calculate completion score based on available data
  const calculateCompletionScore = (data: any) => {
    const fields = [
      'feedback_headline_nota',
      'feedback_sobre_nota',
      'feedback_experience_nota',
      'feedback_projetos_nota',
      'feedback_certificados_nota'
    ];
    
    const filledFields = fields.filter(field => !!data[field]);
    return Math.round((filledFields.length / fields.length) * 100);
  };
  
  // Generate suggested improvements based on feedback
  const generateSuggestedImprovements = (data: any) => {
    const suggestions: string[] = [];
    
    if (data.feedback_headline_nota && data.feedback_headline_nota < 4) {
      suggestions.push("Melhore seu headline para destacar suas habilidades principais");
    }
    
    if (data.feedback_sobre_nota && data.feedback_sobre_nota < 4) {
      suggestions.push("Aprimore a seção 'Sobre' com mais detalhes sobre sua trajetória profissional");
    }
    
    if (data.feedback_experience_nota && data.feedback_experience_nota < 4) {
      suggestions.push("Adicione mais detalhes às suas experiências profissionais, destacando realizações");
    }
    
    if (data.feedback_projetos_nota && data.feedback_projetos_nota < 4) {
      suggestions.push("Inclua mais projetos relevantes para demonstrar suas habilidades práticas");
    }
    
    if (data.feedback_certificados_nota && data.feedback_certificados_nota < 4) {
      suggestions.push("Adicione certificações relevantes para sua área de atuação");
    }
    
    return suggestions;
  };
  
  // Make sure we provide the content props that ResultContent expects
  const contentProps: ResultContentProps = {
    isLoading,
    isError,
    profile,
    dataReceived
  };
  
  return React.cloneElement(children as React.ReactElement, contentProps);
};

export default ResultsContainer;
