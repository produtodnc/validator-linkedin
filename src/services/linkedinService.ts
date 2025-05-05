
// Interface para o perfil do LinkedIn
export interface LinkedInProfile {
  url: string;
  name?: string;
  headline?: string;
  recommendations?: number;
  connections?: string;
  completionScore: number;
  suggestedImprovements?: string[];
  
  // Campos específicos de feedback
  feedback_headline?: string;
  feedback_headline_nota?: number;
  feedback_sobre?: string;
  feedback_sobre_nota?: number;
  feedback_experience?: string;
  feedback_experience_nota?: number;
  feedback_projetos?: string;
  feedback_projetos_nota?: number;
  feedback_certificados?: string;
  feedback_certificados_nota?: number;
  
  // Compatibilidade com o formato antigo
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
  
  // Outros campos que podem vir da API
  linkedin_url?: string;
  [key: string]: any;
}

// Esta função simula a chamada para a API do LinkedIn que retornaria o perfil
export const fetchLinkedInProfile = async (linkedinUrl: string): Promise<LinkedInProfile> => {
  // Simula uma chamada à API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: linkedinUrl,
        name: "Usuário Exemplo",
        headline: "Desenvolvedor Full Stack",
        recommendations: 5,
        connections: "500+",
        completionScore: 75,
        feedback_headline: "Seu headline está bom mas poderia ser mais específico.",
        feedback_headline_nota: 4,
        feedback_sobre: "Sua seção 'Sobre' precisa de mais detalhes sobre suas realizações.",
        feedback_sobre_nota: 3,
        feedback_experience: "Suas experiências estão bem descritas, mas faltam métricas de impacto.",
        feedback_experience_nota: 4,
        feedback_projetos: "Adicione mais detalhes sobre seus projetos pessoais.",
        feedback_projetos_nota: 3,
        feedback_certificados: "Suas certificações são relevantes para sua área.",
        feedback_certificados_nota: 5,
        suggestedImprovements: [
          "Adicionar mais detalhes sobre projetos",
          "Incluir métricas de impacto nas experiências",
          "Tornar o headline mais específico"
        ]
      });
    }, 1500);
  });
};

/**
 * Envia a URL do LinkedIn para um webhook
 * Atualmente é uma função simulada que retorna um ID de registro
 */
export const sendUrlToWebhook = async (linkedinUrl: string) => {
  console.log("Enviando URL para webhook:", linkedinUrl);
  
  // Simula uma chamada de API com um pequeno delay
  return new Promise<{ recordId?: string; error?: string }>((resolve) => {
    // Validação simples da URL
    if (!linkedinUrl.includes("linkedin.com/")) {
      resolve({ error: "URL inválida do LinkedIn" });
      return;
    }
    
    setTimeout(() => {
      // Gera um ID aleatório para simular o registro
      const recordId = `rec_${Math.random().toString(36).substring(2, 10)}`;
      resolve({ recordId });
    }, 800);
  });
};
