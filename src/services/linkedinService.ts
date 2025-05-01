
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

// URL do nosso endpoint que receberá os dados processados
// Este endpoint seria implementado em um servidor real
// Para este exemplo, usaremos um endpoint de demonstração
export const ourEndpointUrl = "https://webhook.site/d8bb66ed-56a3-472c-9a21-2f39144edd01";

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
        callbackUrl: ourEndpointUrl,
        requestTime: new Date().toISOString()
      }),
    });
    
    console.log("URL do LinkedIn enviada para o webhook");
  } catch (error) {
    console.error("Erro ao enviar URL para o webhook:", error);
    throw error;
  }
};

// Função para buscar os dados do endpoint
export const fetchProfileData = async (linkedinUrl: string): Promise<LinkedInProfile | null> => {
  try {
    // Consulta nosso endpoint com a URL como parâmetro para identificar os dados específicos
    await fetch(`${ourEndpointUrl}?url=${encodeURIComponent(linkedinUrl)}`);
    
    // Como estamos usando um endpoint de demonstração, vamos simular a resposta
    // Em um cenário real, aqui você iria verificar a resposta real do seu endpoint
    
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
      return mockData;
    }
    
    return null; // Continua polling
  } catch (error) {
    console.error("Erro ao verificar dados no endpoint:", error);
    return null;
  }
};
