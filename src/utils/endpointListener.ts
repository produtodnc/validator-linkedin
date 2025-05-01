
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
      
      // Intercept only POST calls to our endpoint
      if (url.endsWith('/api/resultado') && init?.method === 'POST') {
        console.log("[ENDPOINT] Recebendo dados no endpoint /api/resultado");
        try {
          const body = init.body ? JSON.parse(init.body.toString()) : {};
          console.log("[ENDPOINT] Dados recebidos:", body);
          
          // Retrieve current LinkedIn URL from session
          const currentProfileUrl = sessionStorage.getItem('currentProfileUrl');
          if (currentProfileUrl) {
            console.log("[ENDPOINT] Associando dados à URL:", currentProfileUrl);
            
            // Initialize global object if it doesn't exist
            if (!window._receivedLinkedInData) {
              window._receivedLinkedInData = {};
            }
            
            window._receivedLinkedInData[currentProfileUrl] = body;
          }
          
          // Trigger custom event to notify data has been received
          triggerEndpointEvent({
            url: currentProfileUrl,
            data: body,
            status: 200
          });
          
          // Simulate a success response
          return Promise.resolve(new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        } catch (error) {
          console.error("[ENDPOINT] Erro ao processar dados:", error);
          
          // Trigger custom event to notify an error occurred
          triggerEndpointEvent({
            error: 'Erro ao processar dados',
            status: 400
          });
          
          // Simulate an error response
          return Promise.resolve(new Response(JSON.stringify({ error: 'Erro ao processar dados' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
      
      // For all other calls, use the original fetch
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
