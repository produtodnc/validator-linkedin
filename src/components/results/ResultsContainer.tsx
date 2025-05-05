
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendUrlToWebhook } from "@/services/linkedinService";
import { supabase } from "@/integrations/supabase/client";
import { ResultContentProps } from "@/components/results/ResultContent";
import { LinkedInProfile } from "@/services/linkedinService";

interface ResultsContainerProps {
  linkedinUrl: string;
  children: React.ReactNode;
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({ linkedinUrl, children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
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
            
            toast({
              title: "Processando",
              description: "A URL foi registrada. Aguarde 20 segundos enquanto processamos os dados...",
            });
            
            // Aguardar 20 segundos e então buscar os resultados
            setTimeout(() => {
              fetchResultsDirectly(response.recordId);
            }, 20000); // 20 segundos
          } else {
            setIsError(true);
            setIsLoading(false);
            
            toast({
              title: "Erro",
              description: "Não foi possível obter o ID do registro",
              variant: "destructive",
            });
          }
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
  
  // Nova função para buscar resultados diretamente do Supabase
  const fetchResultsDirectly = async (id: string | undefined) => {
    if (!id) {
      console.error("[RESULTS] Não foi possível obter o ID do registro");
      setIsError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("[RESULTS] Buscando dados do Supabase para o ID:", id);
      
      // Buscar diretamente da tabela linkedin_links usando o ID
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
        // Verificar se os dados mínimos estão preenchidos para exibição
        // Para fins de teste, consideraremos que alguns dados de feedback são suficientes
        const hasMinimumData = Boolean(
          data.feedback_headline || 
          data.feedback_sobre || 
          data.feedback_experience || 
          data.feedback_projetos || 
          data.feedback_certificados
        );
        
        if (hasMinimumData) {
          // Criar o objeto de perfil completo com dados do registro
          const completeProfile: LinkedInProfile = {
            url: linkedinUrl,
            name: "Perfil LinkedIn", // Valor padrão, já que não existe no banco
            headline: data.feedback_headline ? "Profissional" : "",
            recommendations: 0, // Valor padrão
            connections: "500+", // Valor padrão
            completionScore: calculateCompletionScore(data),
            suggestedImprovements: generateSuggestedImprovements(data),
            // Copiar todos os outros campos do registro para o perfil
            linkedin_url: data.linkedin_url,
            feedback_headline: data.feedback_headline,
            feedback_headline_nota: data.feedback_headline_nota,
            feedback_sobre: data.feedback_sobre,
            feedback_sobre_nota: data.feedback_sobre_nota,
            feedback_experience: data.feedback_experience,
            feedback_experience_nota: data.feedback_experience_nota,
            feedback_projetos: data.feedback_projetos,
            feedback_projetos_nota: data.feedback_projetos_nota,
            feedback_certificados: data.feedback_certificados,
            feedback_certificados_nota: data.feedback_certificados_nota
          };
          
          setProfile(completeProfile);
          setDataReceived(true);
          setIsLoading(false);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
        } else {
          console.log("[RESULTS] Dados mínimos não encontrados, inserindo dados simulados para teste");
          
          // Para fins de demonstração, criar dados fictícios se não houver dados reais
          const mockProfile: LinkedInProfile = {
            url: linkedinUrl,
            name: "Perfil de Teste",
            headline: "Profissional de Tecnologia",
            recommendations: 5,
            connections: "500+",
            completionScore: 70,
            suggestedImprovements: [
              "Adicionar mais detalhes ao headline",
              "Completar a seção de experiências",
              "Adicionar mais certificações"
            ],
            feedback_headline: "Seu headline está bom, mas poderia ser mais específico.",
            feedback_headline_nota: 3,
            feedback_sobre: "A seção 'Sobre' precisa de mais detalhes sobre suas realizações.",
            feedback_sobre_nota: 2,
            feedback_experience: "Adicione mais métricas e resultados em suas experiências.",
            feedback_experience_nota: 3,
            feedback_projetos: "Os projetos estão bem descritos, mas adicione links para demonstração.",
            feedback_projetos_nota: 4,
            feedback_certificados: "Adicione certificações relevantes para sua área.",
            feedback_certificados_nota: 2
          };
          
          setProfile(mockProfile);
          setDataReceived(true);
          setIsLoading(false);
          
          toast({
            title: "Usando Dados de Teste",
            description: "Não encontramos dados reais para seu perfil. Exibindo dados de demonstração.",
            variant: "default", // Changed from "warning" to "default"
          });
        }
      } else {
        console.log("[RESULTS] Nenhum dado encontrado para o ID:", id);
        
        // Não foram encontrados dados, mostrar erro
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
  
  // Calculate completion score based on available data
  const calculateCompletionScore = (data: any) => {
    const fields = [
      'feedback_headline_nota',
      'feedback_sobre_nota',
      'feedback_experience_nota',
      'feedback_projetos_nota',
      'feedback_certificados_nota'
    ];
    
    let totalScore = 0;
    let fieldsCount = 0;
    
    fields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        totalScore += Number(data[field]);
        fieldsCount++;
      }
    });
    
    if (fieldsCount === 0) return 50; // Valor padrão se não houver notas
    
    // Calcular pontuação média (de 0 a 5) e converter para porcentagem (0 a 100)
    return Math.round((totalScore / fieldsCount) * 20);
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
    
    // Se não houver sugestões específicas, adicionar algumas genéricas
    if (suggestions.length === 0) {
      suggestions.push("Mantenha seu perfil sempre atualizado");
      suggestions.push("Adicione palavras-chave relevantes para sua área");
      suggestions.push("Solicite recomendações de colegas e supervisores");
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
