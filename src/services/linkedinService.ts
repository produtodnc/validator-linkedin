
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

// Função para enviar a URL do LinkedIn para o webhook
export const sendUrlToWebhook = async (linkedinUrl: string): Promise<void> => {
  try {
    console.log("Enviando URL para o webhook:", linkedinUrl);
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
      console.log("Dados simulados gerados após tempo de espera:", mockData);
      return mockData;
    }
    
    return null; // Continua polling
  } catch (error) {
    console.error("Erro ao verificar dados no endpoint:", error);
    return null;
  }
};
