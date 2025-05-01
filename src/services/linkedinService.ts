
// Interface para dados do perfil LinkedIn
export interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
  completionScore: number;
  suggestedImprovements: string[];
  // Campos adicionais para os dados recebidos
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
}

// Interface para dados de feedback do LinkedIn
export interface LinkedInFeedback {
  Headline_feedback: string;
  nota_headline: number;
  Sobre_feedback: string;
  nota_sobre: number;
  Experiencias_feedback: string;
  nota_experiencia: number;
  Projetos_feedback: string;
  nota_projetos: number;
  Certificados_feedback: string;
  nota_certificados: number;
}

// Interface para resposta da API
export interface ApiResponse {
  data: LinkedInProfile | null;
  error?: string;
  status?: number;
  message?: string; // Propriedade message incluída na interface
}

// Interface para resposta da API de feedback
export interface FeedbackApiResponse {
  status: string;
  data?: LinkedInFeedback;
  error?: string;
}

// URL do webhook para enviar os dados iniciais (apenas a URL do LinkedIn)
const webhookUrl = "https://workflow.dnc.group/webhook-test/e8a75359-7699-4bef-bdfd-8dcc3d793964";

// Função para enviar APENAS a URL do LinkedIn para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<ApiResponse> => {
  try {
    console.log("Enviando URL para o webhook:", linkedinUrl);
    
    // Enviamos apenas a URL do LinkedIn e uma referência para nosso endpoint
    const webhookData = {
      linkedinUrl,
      requestTime: new Date().toISOString()
    };
    
    console.log("Dados sendo enviados para o webhook:", webhookData);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Removido o no-cors para poder acessar a resposta corretamente
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
        // Adicionamos qualquer mensagem que o webhook possa retornar
        message: responseData.message || "URL enviada com sucesso"
      };
    } catch (e) {
      console.log("Webhook respondeu com sucesso, mas sem dados JSON");
      return { 
        data: null, 
        status: response.status,
        message: "URL enviada com sucesso, sem dados retornados"
      };
    }
  } catch (error) {
    console.error("Erro ao enviar URL para o webhook:", error);
    return { 
      data: null, 
      error: String(error), 
      status: 500 
    };
  }
};

// Função para processar os dados de feedback do LinkedIn
export const processLinkedInFeedback = async (feedbackData: LinkedInFeedback): Promise<FeedbackApiResponse> => {
  try {
    // Validar os dados recebidos
    if (!validateFeedbackData(feedbackData)) {
      return {
        status: "error",
        error: "Dados incompletos ou inválidos no corpo da requisição."
      };
    }
    
    console.log("Dados de feedback recebidos:", feedbackData);
    
    // Como solicitado, retornamos os mesmos dados recebidos para confirmar processamento
    return {
      status: "success",
      data: feedbackData
    };
  } catch (error) {
    console.error("Erro ao processar feedback:", error);
    return {
      status: "error",
      error: String(error)
    };
  }
};

// Função para validar os dados de feedback
function validateFeedbackData(data: any): data is LinkedInFeedback {
  // Verificar se todos os campos necessários estão presentes
  const requiredFields = [
    'Headline_feedback', 'nota_headline',
    'Sobre_feedback', 'nota_sobre', 
    'Experiencias_feedback', 'nota_experiencia', 
    'Projetos_feedback', 'nota_projetos',
    'Certificados_feedback', 'nota_certificados'
  ];
  
  const missingFields = requiredFields.filter(field => data[field] === undefined);
  
  if (missingFields.length > 0) {
    console.error("Campos ausentes:", missingFields);
    return false;
  }
  
  // Verificar se as notas são números válidos entre 1 e 5
  const ratingFields = [
    'nota_headline', 'nota_sobre', 'nota_experiencia', 
    'nota_projetos', 'nota_certificados'
  ];
  
  for (const field of ratingFields) {
    const value = data[field];
    if (typeof value !== 'number' || value < 1 || value > 5) {
      console.error(`Campo inválido ${field}: deve ser um número entre 1 e 5`);
      return false;
    }
  }
  
  // Verificar se os campos de feedback são strings não vazias
  const feedbackFields = [
    'Headline_feedback', 'Sobre_feedback', 'Experiencias_feedback', 
    'Projetos_feedback', 'Certificados_feedback'
  ];
  
  for (const field of feedbackFields) {
    const value = data[field];
    if (typeof value !== 'string' || value.trim() === '') {
      console.error(`Campo inválido ${field}: deve ser uma string não vazia`);
      return false;
    }
  }
  
  return true;
}
