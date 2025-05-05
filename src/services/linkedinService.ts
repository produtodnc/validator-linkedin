
import { supabase } from "@/integrations/supabase/client";

// Interface para dados do perfil LinkedIn
export interface LinkedInProfile {
  url: string;
  name?: string;
  headline?: string;
  recommendations?: number;
  connections?: string;
  completionScore: number;
  suggestedImprovements: string[];
  // Campos adicionais para os dados de feedback (formato antigo)
  Headline_feedback?: string;
  nota_headline?: number;
  Sobre_feedback?: string;
  nota_sobre?: number;
  Experiencias_feedback?: string;
  nota_experiencia?: number;
  Projetos_feedback?: string;
  nota_projetos?: number;
  Certificados_feedback?: string;
  nota_certificados?: number;
  // Campos do banco de dados (formato novo)
  linkedin_url?: string;
  feedback_headline?: string;
  feedback_headline_nota?: number;
  feedback_sobre?: string;
  feedback_sobre_nota?: number;
  feedback_experience?: string;
  feedback_experience_nota?: number;
  feedback_projetos?: string;
  feedback_projetos_nota?: number;
  feedback_certificados?: string;
  feedback_certificados_nota?: number;
}

// Interface para resposta da API
export interface ApiResponse {
  data: LinkedInProfile | null;
  error?: string;
  status?: number;
  message?: string;
  recordId?: string; // Add recordId to the response interface
}

// URL do webhook para enviar os dados iniciais (URL do LinkedIn em produção)
const webhookUrl = "https://workflow.dnc.group/webhook/eb9d29a2-c1d8-4d05-ae7e-70c84c46ac06";

// Função para enviar a URL do LinkedIn e o ID gerado para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<ApiResponse> => {
  try {
    console.log("[LINKEDIN_SERVICE] Processando URL do LinkedIn:", linkedinUrl);
    
    // Verificar conexão com Supabase
    try {
      // Primeiro, salva a URL no banco de dados para obter um ID
      const { data: insertedData, error: insertError } = await supabase
        .from('linkedin_links')
        .insert({
          linkedin_url: linkedinUrl
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("[LINKEDIN_SERVICE] Erro ao salvar URL no banco de dados:", insertError);
        
        // Verificar se este é um erro de conexão
        if (insertError.message.includes("Failed to fetch") || 
            insertError.message.includes("NetworkError") || 
            insertError.message.includes("network")) {
          return { 
            data: null, 
            error: "Problema de conexão com o banco de dados. Por favor, verifique sua conexão com a internet.",
            status: 503
          };
        }
        
        return { 
          data: null, 
          error: `Erro ao salvar URL: ${insertError.message}`,
          status: 500
        };
      }
      
      const recordId = insertedData.id;
      console.log("[LINKEDIN_SERVICE] URL salva no banco com ID:", recordId);
      
      // Armazenar o ID no localStorage e sessionStorage para maior redundância
      localStorage.setItem(`recordId_${linkedinUrl}`, recordId);
      sessionStorage.setItem(`recordId_${linkedinUrl}`, recordId);
      console.log("[LINKEDIN_SERVICE] ID armazenado no storage:", recordId);
      
      // Agora tenta enviar o ID e a URL para o webhook
      try {
        console.log("[LINKEDIN_SERVICE] Enviando URL e ID para o webhook:", linkedinUrl, recordId);
        
        // Enviamos a URL do LinkedIn, o ID do registro e uma referência de tempo
        const webhookData = {
          linkedinUrl,
          recordId,
          requestTime: new Date().toISOString()
        };
        
        console.log("[LINKEDIN_SERVICE] Dados sendo enviados para o webhook:", webhookData);
        
        // Usar o mesmo padrão do fetch para o webhook
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
        
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log("[LINKEDIN_SERVICE] Status da resposta do webhook:", response.status);
        
        // Verificar a resposta
        if (response.ok) {
          // Se conseguiu enviar para o webhook, ótimo
          try {
            const responseData = await response.json();
            console.log("[LINKEDIN_SERVICE] Resposta do webhook:", responseData);
            return { 
              data: null, 
              status: response.status,
              recordId: recordId,
              message: responseData.message || "URL enviada com sucesso"
            };
          } catch (e) {
            console.log("[LINKEDIN_SERVICE] Webhook respondeu com sucesso, mas sem dados JSON");
            return { 
              data: null, 
              status: response.status,
              recordId: recordId,
              message: "URL enviada com sucesso, sem dados retornados"
            };
          }
        } else {
          // Se o webhook falhou, mas temos o ID do registro, continuamos mesmo assim
          console.log("[LINKEDIN_SERVICE] Webhook falhou, mas vamos continuar com o ID do registro:", recordId);
          
          // Captura o erro do webhook para log, mas não interrompe o fluxo
          try {
            const errorData = await response.text();
            console.error("[LINKEDIN_SERVICE] Erro do webhook (ignorado):", errorData);
          } catch (e) {
            console.error("[LINKEDIN_SERVICE] Não foi possível ler o erro do webhook:", e);
          }
          
          // Retorna sucesso mesmo assim, pois o importante é ter o ID do registro
          return {
            data: null,
            recordId: recordId,
            message: "URL registrada com sucesso. O webhook falhou, mas o processo continuará."
          };
        }
      } catch (webhookError) {
        // Se o webhook falhou completamente, mas temos o ID do registro, continuamos mesmo assim
        console.error("[LINKEDIN_SERVICE] Erro ao chamar webhook (ignorado):", webhookError);
        
        // Verificar se é um erro de timeout
        if (webhookError.name === "AbortError") {
          console.log("[LINKEDIN_SERVICE] Timeout ao chamar o webhook, mas continuando com ID:", recordId);
        }
        
        return {
          data: null,
          recordId: recordId,
          message: "URL registrada com sucesso. O webhook não pôde ser chamado, mas o processo continuará."
        };
      }
    } catch (supabaseError) {
      console.error("[LINKEDIN_SERVICE] Erro crítico ao acessar Supabase:", supabaseError);
      
      // Tentar criar um ID local para funcionar offline
      const tempId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(`recordId_${linkedinUrl}`, tempId);
      sessionStorage.setItem(`recordId_${linkedinUrl}`, tempId);
      
      return { 
        data: null,
        recordId: tempId,
        error: "Erro de conexão com o banco de dados. Um ID temporário foi criado para continuidade.",
        status: 503
      };
    }
  } catch (error) {
    console.error("[LINKEDIN_SERVICE] Erro ao processar a requisição:", error);
    return { 
      data: null, 
      error: String(error), 
      status: 500 
    };
  }
};
