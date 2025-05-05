
import { LinkedInProfile } from "@/services/linkedinService";

/**
 * Calculate completion score based on available data
 */
export const calculateCompletionScore = (data: any) => {
  const fields = [
    'feedback_headline_nota',
    'feedback_sobre_nota',
    'feedback_experience_nota',
    'feedback_projetos_nota',
    'feedback_certificados_nota'
  ];
  
  let totalScore = 0;
  let fieldsCount = 0;
  
  fields.forEach(field => {
    if (data[field] !== null && data[field] !== undefined) {
      totalScore += Number(data[field]);
      fieldsCount++;
    }
  });
  
  if (fieldsCount === 0) return 50; // Default value if no scores
  
  // Calculate average score (0-5) and convert to percentage (0-100)
  return Math.round((totalScore / fieldsCount) * 20);
};

/**
 * Generate suggested improvements based on feedback
 */
export const generateSuggestedImprovements = (data: any) => {
  const suggestions: string[] = [];
  
  if (data.feedback_headline_nota && data.feedback_headline_nota < 4) {
    suggestions.push("Melhore seu headline para destacar suas habilidades principais");
  }
  
  if (data.feedback_sobre_nota && data.feedback_sobre_nota < 4) {
    suggestions.push("Aprimore a seção 'Sobre' com mais detalhes sobre sua trajetória profissional");
  }
  
  if (data.feedback_experience_nota && data.feedback_experience_nota < 4) {
    suggestions.push("Adicione mais detalhes às suas experiências profissionais, destacando realizações");
  }
  
  if (data.feedback_projetos_nota && data.feedback_projetos_nota < 4) {
    suggestions.push("Inclua mais projetos relevantes para demonstrar suas habilidades práticas");
  }
  
  if (data.feedback_certificados_nota && data.feedback_certificados_nota < 4) {
    suggestions.push("Adicione certificações relevantes para sua área de atuação");
  }
  
  // Add generic suggestions if no specific ones
  if (suggestions.length === 0) {
    suggestions.push("Mantenha seu perfil sempre atualizado");
    suggestions.push("Adicione palavras-chave relevantes para sua área");
    suggestions.push("Solicite recomendações de colegas e supervisores");
  }
  
  return suggestions;
};

/**
 * Check if the minimum required data is available in the profile
 */
export const hasMinimumData = (data: any): boolean => {
  console.log("[DATA CHECK] Verificando dados mínimos:", data);
  
  // Verificar se pelo menos um campo de feedback está preenchido
  const feedbackFields = [
    'feedback_headline', 
    'feedback_sobre', 
    'feedback_experience', 
    'feedback_projetos', 
    'feedback_certificados'
  ];
  
  // Verificar se os campos de nota estão preenchidos
  const notaFields = [
    'feedback_headline_nota', 
    'feedback_sobre_nota', 
    'feedback_experience_nota', 
    'feedback_projetos_nota', 
    'feedback_certificados_nota'
  ];
  
  // Verificar se pelo menos um par (feedback e nota) está completo
  for (let i = 0; i < feedbackFields.length; i++) {
    if (data[feedbackFields[i]] && data[notaFields[i]]) {
      console.log("[DATA CHECK] Encontrou par completo:", feedbackFields[i], data[feedbackFields[i]], notaFields[i], data[notaFields[i]]);
      return true;
    }
  }
  
  console.log("[DATA CHECK] Nenhum par completo de feedback e nota encontrado");
  return false;
};

/**
 * Create a complete profile object from database data
 */
export const createProfileFromData = (data: any, linkedinUrl: string): LinkedInProfile => {
  return {
    url: linkedinUrl,
    name: "Perfil LinkedIn", // Default value
    headline: data.feedback_headline ? "Profissional" : "",
    recommendations: 0, // Default value
    connections: "500+", // Default value
    completionScore: calculateCompletionScore(data),
    suggestedImprovements: generateSuggestedImprovements(data),
    // Copy all other fields from the record to the profile
    linkedin_url: data.linkedin_url,
    feedback_headline: data.feedback_headline,
    feedback_headline_nota: data.feedback_headline_nota,
    feedback_sobre: data.feedback_sobre,
    feedback_sobre_nota: data.feedback_sobre_nota,
    feedback_experience: data.feedback_experience,
    feedback_experience_nota: data.feedback_experience_nota,
    feedback_projetos: data.feedback_projetos,
    feedback_projetos_nota: data.feedback_projetos_nota,
    feedback_certificados: data.feedback_certificados,
    feedback_certificados_nota: data.feedback_certificados_nota
  };
};

/**
 * Create a mock profile for testing/demonstration
 */
export const createMockProfile = (linkedinUrl: string): LinkedInProfile => {
  return {
    url: linkedinUrl,
    name: "Perfil de Teste",
    headline: "Profissional de Tecnologia",
    recommendations: 5,
    connections: "500+",
    completionScore: 70,
    suggestedImprovements: [
      "Adicionar mais detalhes ao headline",
      "Completar a seção de experiências",
      "Adicionar mais certificações"
    ],
    feedback_headline: "Seu headline está bom, mas poderia ser mais específico.",
    feedback_headline_nota: 3,
    feedback_sobre: "A seção 'Sobre' precisa de mais detalhes sobre suas realizações.",
    feedback_sobre_nota: 2,
    feedback_experience: "Adicione mais métricas e resultados em suas experiências.",
    feedback_experience_nota: 3,
    feedback_projetos: "Os projetos estão bem descritos, mas adicione links para demonstração.",
    feedback_projetos_nota: 4,
    feedback_certificados: "Adicione certificações relevantes para sua área.",
    feedback_certificados_nota: 2
  };
};
