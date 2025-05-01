
// Interface para dados do perfil LinkedIn
export interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
  completionScore: number;
  suggestedImprovements: string[];
}

// Interface para resposta da API
export interface ApiResponse {
  data: LinkedInProfile | null;
  error?: string;
}

// URL do webhook para enviar os dados
const webhookUrl = "https://workflow.dnc.group/webhook-test/e8a75359-7699-4bef-bdfd-8dcc3d793964";

// URL do nosso endpoint local que receberá os dados processados
export const ourEndpointUrl = "/api/resultado";

// Variável para armazenar temporariamente dados recebidos via POST
// Em uma aplicação real, você usaria um banco de dados ou outro mecanismo de persistência
let receivedProfileData: LinkedInProfile | null = null;

// Função para enviar a URL do LinkedIn para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<void> => {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Para evitar erros de CORS
      body: JSON.stringify({
        linkedinUrl,
        callbackUrl: window.location.origin + ourEndpointUrl,
        requestTime: new Date().toISOString()
      }),
    });
    
    console.log("URL do LinkedIn enviada para o webhook");
  } catch (error) {
    console.error("Erro ao enviar URL para o webhook:", error);
    throw error;
  }
};

// Função para receber dados via POST no endpoint local
// Esta função seria normalmente implementada no servidor,
// mas para este exemplo, vamos simular usando uma variável global
export const receiveProfileData = (data: LinkedInProfile): void => {
  receivedProfileData = data;
  console.log("Dados do perfil recebidos:", data);
};

// Função para buscar os dados do endpoint local
export const fetchProfileData = async (linkedinUrl: string): Promise<LinkedInProfile | null> => {
  try {
    // Em um cenário real, você faria uma requisição para o endpoint
    // Como estamos em um ambiente de front-end, vamos simular o comportamento
    
    // Verificar se já recebemos dados para esta URL
    if (receivedProfileData && receivedProfileData.url === linkedinUrl) {
      const data = receivedProfileData;
      receivedProfileData = null; // Limpar após usar
      return data;
    }
    
    // Simulando um tempo de processamento se não temos dados ainda
    const currentTime = new Date().getTime();
    const startTime = sessionStorage.getItem('processingStartTime');
    
    if (!startTime) {
      sessionStorage.setItem('processingStartTime', currentTime.toString());
      return null; // Continua o polling
    }
    
    // Simula receber dados após 10 segundos
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
      return mockData;
    }
    
    return null; // Continua polling
  } catch (error) {
    console.error("Erro ao verificar dados no endpoint:", error);
    return null;
  }
};
