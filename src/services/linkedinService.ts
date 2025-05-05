
import { supabase } from "@/integrations/supabase/client";

// Interface para dados do perfil LinkedIn
export interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
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

// URL do webhook para enviar os dados iniciais (apenas a URL do LinkedIn)
const webhookUrl = "https://workflow.dnc.group/webhook-test/e8a75359-7699-4bef-bdfd-8dcc3d793964";

// Função para enviar a URL do LinkedIn e o ID gerado para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<ApiResponse> => {
  try {
    console.log("Processando URL do LinkedIn:", linkedinUrl);
    
    // Primeiro, salva a URL no banco de dados para obter um ID
    const { data: insertedData, error: insertError } = await supabase
      .from('linkedin_links')
      .insert({
        linkedin_url: linkedinUrl
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Erro ao salvar URL no banco de dados:", insertError);
      return { 
        data: null, 
        error: `Erro ao salvar URL: ${insertError.message}`,
        status: 500
      };
    }
    
    const recordId = insertedData.id;
    console.log("URL salva no banco com ID:", recordId);
    
    // Agora envia o ID e a URL para o webhook
    console.log("Enviando URL e ID para o webhook:", linkedinUrl, recordId);
    
    // Enviamos a URL do LinkedIn, o ID do registro e uma referência de tempo
    const webhookData = {
      linkedinUrl,
      recordId,
      requestTime: new Date().toISOString()
    };
    
    console.log("Dados sendo enviados para o webhook:", webhookData);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });
    
    console.log("Status da resposta do webhook:", response.status);
    
    // Verificar a resposta adequadamente
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao enviar URL para o webhook:", errorText);
      return { 
        data: null, 
        error: `Erro ${response.status}: ${errorText || response.statusText}`,
        status: response.status
      };
    }
    
    // Tenta parsear a resposta como JSON
    try {
      const responseData = await response.json();
      console.log("Resposta do webhook:", responseData);
      return { 
        data: null, 
        status: response.status,
        recordId: recordId, // Return the record ID
        message: responseData.message || "URL enviada com sucesso"
      };
    } catch (e) {
      console.log("Webhook respondeu com sucesso, mas sem dados JSON");
      return { 
        data: null, 
        status: response.status,
        recordId: recordId, // Return the record ID even if webhook doesn't return JSON
        message: "URL enviada com sucesso, sem dados retornados"
      };
    }
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return { 
      data: null, 
      error: String(error), 
      status: 500 
    };
  }
};
