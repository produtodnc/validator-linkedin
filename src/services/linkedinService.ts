
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

// URL do endpoint externo que receberá os dados processados posteriormente
export const ourEndpointUrl = "https://validator-linkedin.lovable.app/api/resultado";

// Função para enviar APENAS a URL do LinkedIn para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<ApiResponse> => {
  try {
    console.log("Enviando URL para o webhook:", linkedinUrl);
    
    // Enviamos apenas a URL do LinkedIn e uma referência para nosso endpoint
    const webhookData = {
      linkedinUrl,
      // O webhook pode usar este endpoint para devolver os dados processados posteriormente
      callbackUrl: ourEndpointUrl,
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

// Função para verificar se os dados estão disponíveis no endpoint externo
export const checkExternalEndpoint = async (linkedinUrl: string): Promise<ApiResponse> => {
  try {
    console.log("Verificando dados no endpoint externo para URL:", linkedinUrl);
    
    // Modificado para usar método POST em vez de GET
    const response = await fetch(ourEndpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ url: linkedinUrl }),
      // Removido o no-cors para poder acessar a resposta corretamente
    });
    
    console.log("Status da resposta do endpoint:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao verificar dados no endpoint:", errorText);
      return { 
        data: null, 
        error: `Erro ${response.status}: ${errorText || response.statusText}`,
        status: response.status
      };
    }
    
    // Tenta parsear a resposta como JSON
    try {
      const data = await response.json();
      console.log("Dados recebidos do endpoint:", data);
      return { 
        data, 
        status: response.status
      };
    } catch (e) {
      console.error("Erro ao parsear resposta JSON:", e);
      return { 
        data: null, 
        error: "Erro ao processar resposta do servidor",
        status: response.status
      };
    }
  } catch (error) {
    console.error("Erro ao verificar dados no endpoint:", error);
    return { 
      data: null, 
      error: String(error),
      status: 500
    };
  }
};

// Função para buscar os dados do perfil
export const fetchProfileData = async (linkedinUrl: string): Promise<LinkedInProfile | null> => {
  try {
    // Verificar dados no endpoint externo
    const response = await checkExternalEndpoint(linkedinUrl);
    
    if (response.data) {
      console.log("Dados encontrados no endpoint externo:", response.data);
      return response.data as LinkedInProfile;
    }
    
    // Caso não tenha dados, verificar armazenamento global
    if (window._receivedLinkedInData && window._receivedLinkedInData[linkedinUrl]) {
      console.log("Dados encontrados no armazenamento global:", window._receivedLinkedInData[linkedinUrl]);
      const data = window._receivedLinkedInData[linkedinUrl];
      delete window._receivedLinkedInData[linkedinUrl];
      return data;
    }
    
    // Verificar sessão para simulação de tempo de processamento
    const currentTime = new Date().getTime();
    const startTime = sessionStorage.getItem('processingStartTime');
    
    if (!startTime) {
      sessionStorage.setItem('processingStartTime', currentTime.toString());
      return null; // Continua o polling
    }
    
    // Simula receber dados após 10 segundos (mantemos este comportamento como fallback)
    if (currentTime - parseInt(startTime) > 10000) {
      // Simulando dados recebidos
      const mockData: LinkedInProfile = {
        url: linkedinUrl,
        name: "Deu errro do Usuário",
        headline: "Desenvolvedor Front-end",
        recommendations: 5,
        connections: "500+",
        completionScore: 85,
        suggestedImprovements: [
          "Adicione mais detalhes sobre suas experiências recentes",
          "Complete a seção de habilidades com tecnologias relevantes",
          "Solicite mais recomendações de colegas de trabalho"
        ]
      };
      
      sessionStorage.removeItem('processingStartTime');
      console.log("Dados simulados gerados após tempo de espera:", mockData);
      return mockData;
    }
    
    return null; // Continua polling
  } catch (error) {
    console.error("Erro ao verificar dados no endpoint:", error);
    return null;
  }
};
