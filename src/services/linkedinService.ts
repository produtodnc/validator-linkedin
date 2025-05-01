
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
}

// URL do webhook para enviar os dados
const webhookUrl = "https://workflow.dnc.group/webhook-test/e8a75359-7699-4bef-bdfd-8dcc3d793964";

// URL do nosso endpoint local que receberá os dados processados
export const ourEndpointUrl = "/api/resultado";

// Função para enviar a URL do LinkedIn para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<ApiResponse> => {
  try {
    console.log("Enviando URL para o webhook:", linkedinUrl);
    
    // Construa o objeto com os dados necessários para o webhook
    const webhookData = {
      linkedinUrl,
      callbackUrl: window.location.origin + ourEndpointUrl,
      requestTime: new Date().toISOString()
    };
    
    console.log("Dados sendo enviados para o webhook:", webhookData);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Removido o modo no-cors para poder acessar a resposta
      body: JSON.stringify(webhookData),
    });
    
    // Agora podemos verificar a resposta adequadamente
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
      return { data: null, status: response.status };
    } catch (e) {
      console.log("Webhook respondeu com sucesso, mas sem dados JSON");
      return { data: null, status: response.status };
    }
  } catch (error) {
    console.error("Erro ao enviar URL para o webhook:", error);
    return { data: null, error: String(error), status: 500 };
  }
};

// Função para buscar os dados do endpoint local
export const fetchProfileData = async (linkedinUrl: string): Promise<LinkedInProfile | null> => {
  try {
    // Em um cenário real, você faria uma requisição para o endpoint
    // Como estamos em um ambiente de front-end, vamos simular o comportamento
    
    // Simulando um tempo de processamento
    const currentTime = new Date().getTime();
    const startTime = sessionStorage.getItem('processingStartTime');
    
    if (!startTime) {
      sessionStorage.setItem('processingStartTime', currentTime.toString());
      return null; // Continua o polling
    }
    
    // Verificar se há dados no armazenamento global primeiro
    if (window._receivedLinkedInData && window._receivedLinkedInData[linkedinUrl]) {
      console.log("Dados encontrados no armazenamento global:", window._receivedLinkedInData[linkedinUrl]);
      const data = window._receivedLinkedInData[linkedinUrl];
      delete window._receivedLinkedInData[linkedinUrl];
      return data;
    }
    
    // Simula receber dados após 10 segundos (mantemos este comportamento como fallback)
    if (currentTime - parseInt(startTime) > 10000) {
      // Simulando dados recebidos
      const mockData: LinkedInProfile = {
        url: linkedinUrl,
        name: "Nome do Usuário",
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
