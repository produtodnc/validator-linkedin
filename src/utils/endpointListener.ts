
import { LinkedInProfile } from "@/services/linkedinService";

// Set up a global event for endpoint data reception
export interface EndpointEventDetail {
  url?: string;
  data?: any;
  status: number;
  error?: string;
}

// Create a typed custom event
export const triggerEndpointEvent = (detail: EndpointEventDetail) => {
  const customEvent = new CustomEvent('endpointDataReceived', { detail });
  window.dispatchEvent(customEvent);
};

// Set up the endpoint listener if it hasn't been set up yet
export const setupEndpointListener = () => {
  // Check if listener is already set up
  if (typeof window !== 'undefined' && !window._endpointListenerAdded) {
    window._endpointListenerAdded = true;
    
    // Configure the endpoint simulator
    console.log("[SETUP] Configurando receptor de endpoint simulado /api/resultado");
    
    // Monkey patch fetch to intercept calls to our endpoint
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = input.toString();
      
      // Intercepta chamadas POST e GET para nosso endpoint
      if (url.includes('/api/resultado')) {
        console.log(`[ENDPOINT] Recebendo dados no endpoint /api/resultado via ${init?.method}`);
        
        try {
          if (init?.method === 'POST') {
            // Corpo da requisição POST
            const body = init.body ? JSON.parse(init.body.toString()) : {};
            console.log("[ENDPOINT] Dados recebidos via POST:", body);
            
            // Extrair URL do LinkedIn do corpo
            const linkedinUrl = body.url || '';
            
            if (linkedinUrl) {
              console.log("[ENDPOINT] Associando dados à URL:", linkedinUrl);
              
              // Inicializar objeto global se não existir
              if (!window._receivedLinkedInData) {
                window._receivedLinkedInData = {};
              }
              
              // Simula processamento de dados
              // Podemos usar os dados do corpo diretamente ou gerar simulados
              window._receivedLinkedInData[linkedinUrl] = body.data || {
                url: linkedinUrl,
                name: "Perfil do LinkedIn",
                headline: "Desenvolvedor Front-end",
                recommendations: 5,
                connections: "500+",
                completionScore: 85,
                nota_headline: 4,
                nota_sobre: 4.5,
                nota_experiencia: 3.8,
                nota_projetos: 4.2,
                nota_certificados: 3.5,
                Headline_feedback: "Seu headline está bom, mas poderia destacar mais suas habilidades principais.",
                Sobre_feedback: "Seção 'Sobre' bem escrita, mas considere adicionar mais conquistas mensuráveis.",
                Experiencias_feedback: "Suas experiências estão bem descritas, mas faltam dados quantitativos.",
                Projetos_feedback: "Bons projetos, considere adicionar links ou imagens.",
                Certificados_feedback: "Certificados relevantes, mas alguns estão desatualizados."
              };
            }
            
            // Aciona evento customizado para notificar que os dados foram recebidos
            triggerEndpointEvent({
              url: linkedinUrl,
              data: window._receivedLinkedInData[linkedinUrl],
              status: 200
            });
            
            // Simula uma resposta de sucesso
            return Promise.resolve(new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            // Para chamadas GET, mantém o comportamento anterior
            // Recupera URL atual do LinkedIn da sessão
            const currentProfileUrl = sessionStorage.getItem('currentProfileUrl');
            
            if (currentProfileUrl && window._receivedLinkedInData && window._receivedLinkedInData[currentProfileUrl]) {
              return Promise.resolve(new Response(JSON.stringify(window._receivedLinkedInData[currentProfileUrl]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }));
            }
            
            // Se não encontrar dados, retorna erro
            return Promise.resolve(new Response(JSON.stringify({ error: 'Dados não encontrados' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        } catch (error) {
          console.error("[ENDPOINT] Erro ao processar dados:", error);
          
          // Aciona evento customizado para notificar que ocorreu um erro
          triggerEndpointEvent({
            error: 'Erro ao processar dados',
            status: 400
          });
          
          // Simula uma resposta de erro
          return Promise.resolve(new Response(JSON.stringify({ error: 'Erro ao processar dados' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
      
      // Para todas as outras chamadas, use o fetch original
      return originalFetch.apply(this, [input, init]);
    };
  }
};

// Add the TypeScript declaration
declare global {
  interface Window {
    _endpointListenerAdded?: boolean;
    _receivedLinkedInData?: {
      [url: string]: LinkedInProfile;
    };
  }
}
