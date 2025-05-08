
// Interface for LinkedIn profile data
export interface LinkedInProfile {
  url: string;
  name?: string;
  headline?: string;
  recommendations?: number;
  connections?: string;
  completionScore: number;
  suggestedImprovements: string[];
  // Fields for feedback (old format)
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
  // Fields from database (new format)
  linkedin_url?: string;
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
}

// Interface for API responses
export interface ApiResponse {
  data: LinkedInProfile | null;
  error?: string;
  status?: number;
  message?: string;
  recordId?: string;
}

// Interface for webhook data
export interface WebhookData {
  linkedinUrl: string;
  recordId: string;
  email: string | null;
  requestTime: string;
}
