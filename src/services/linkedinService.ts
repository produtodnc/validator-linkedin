
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

// Interface para resposta da API
export interface ApiResponse {
  data: LinkedInProfile | null;
  error?: string;
  status?: number;
  message?: string; // Propriedade message incluída na interface
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
