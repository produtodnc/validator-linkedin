
import { LinkedInProfile, LinkedInFeedback, FeedbackApiResponse } from "@/services/linkedinService";

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
    console.log("[SETUP] Configurando receptor de endpoint simulado /api/resultado e /api/feedback");
    
    // Monkey patch fetch to intercept calls to our endpoints
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = input.toString();
      
      // Intercepta chamadas para endpoint de feedback
      if (url.includes('/api/feedback') && init?.method === 'POST') {
        console.log(`[ENDPOINT] Recebendo dados no endpoint /api/feedback via POST`);
        
        try {
          // Corpo da requisição POST
          const body = init.body ? JSON.parse(init.body.toString()) : {};
          console.log("[ENDPOINT] Dados de feedback recebidos via POST:", body);
          
          // Validar os dados recebidos
          if (!validateFeedbackData(body)) {
            const errorResponse: FeedbackApiResponse = {
              status: "error",
              error: "Dados incompletos ou inválidos no corpo da requisição."
            };
            
            return Promise.resolve(new Response(JSON.stringify(errorResponse), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          
          // Simula processamento e retorna sucesso com os mesmos dados
          const successResponse: FeedbackApiResponse = {
            status: "success",
            data: body as LinkedInFeedback
          };
          
          // Aciona evento customizado para notificar que os dados foram recebidos
          triggerEndpointEvent({
            data: body,
            status: 200
          });
          
          return Promise.resolve(new Response(JSON.stringify(successResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        } catch (error) {
          console.error("[ENDPOINT] Erro ao processar dados de feedback:", error);
          
          const errorResponse: FeedbackApiResponse = {
            status: "error",
            error: "Erro ao processar os dados do feedback."
          };
          
          // Aciona evento customizado para notificar que ocorreu um erro
          triggerEndpointEvent({
            error: 'Erro ao processar dados de feedback',
            status: 400
          });
          
          return Promise.resolve(new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
      
      // Intercepta chamadas POST e GET para endpoint de resultados
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
              
              // Simula processamento de dados e resposta
              const profileResponse: LinkedInProfile = {
                url: linkedinUrl,
                name: "Perfil do LinkedIn",
                headline: "Desenvolvedor Front-end",
                recommendations: 5,
                connections: "500+",
                completionScore: 85,
                suggestedImprovements: [
                  "Melhore seu headline para destacar habilidades principais",
                  "Adicione mais conquistas mensuráveis na seção 'Sobre'",
                  "Inclua dados quantitativos nas suas experiências"
                ],
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
              
              // Armazena os dados para uso posterior
              window._receivedLinkedInData[linkedinUrl] = profileResponse;
              
              // Aciona evento customizado para notificar que os dados foram recebidos
              triggerEndpointEvent({
                url: linkedinUrl,
                data: profileResponse,
                status: 200
              });
              
              // Simula uma resposta de sucesso com os mesmos dados
              return Promise.resolve(new Response(JSON.stringify(profileResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }));
            }
            
            // Simula uma resposta de erro se não houver URL
            return Promise.resolve(new Response(JSON.stringify({ error: 'URL do LinkedIn não fornecida' }), {
              status: 400,
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

// Função para validar dados de feedback do LinkedIn
function validateFeedbackData(data: any): boolean {
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

// Add the TypeScript declaration
declare global {
  interface Window {
    _endpointListenerAdded?: boolean;
    _receivedLinkedInData?: {
      [url: string]: LinkedInProfile;
    };
  }
}
