
import { LinkedInProfile } from "@/services/linkedinService";

/**
 * Verifies if all required feedback fields are filled in the profile data
 */
export const areAllFieldsFilled = (data: LinkedInProfile): boolean => {
  // Verify if all feedback fields are filled
  const requiredFields = [
    'feedback_headline', 'feedback_headline_nota',
    'feedback_sobre', 'feedback_sobre_nota',
    'feedback_experience', 'feedback_experience_nota',
    'feedback_projetos', 'feedback_projetos_nota',
    'feedback_certificados', 'feedback_certificados_nota'
  ];
  
  // Check if data exists and all required fields are filled
  return requiredFields.every(field => {
    return !!data[field as keyof LinkedInProfile];
  });
};

/**
 * Checks if data is real (not mocked) by comparing URLs
 */
export const isRealData = (data: LinkedInProfile, linkedinUrl: string): boolean => {
  // If data is actually filled by the backend, it will have a URL property matching linkedinUrl
  return data.url === linkedinUrl;
};
