
import React from "react";
import { LinkedInProfile } from "@/services/linkedinService";

interface FeedbackDisplayProps {
  profile: LinkedInProfile;
}

const FeedbackDisplay = ({ profile }: FeedbackDisplayProps) => {
  // Helper function to get feedback text from profile data (handling both old and new formats)
  const getFeedback = (
    newFormat: string | undefined, 
    oldFormat: string | undefined
  ) => newFormat || oldFormat || "Sem feedback disponível";

  const headlineFeedback = getFeedback(profile.feedback_headline, profile.Headline_feedback);
  const sobreFeedback = getFeedback(profile.feedback_sobre, profile.Sobre_feedback);
  const experienceFeedback = getFeedback(profile.feedback_experience, profile.Experiencias_feedback);
  const projetosFeedback = getFeedback(profile.feedback_projetos, profile.Projetos_feedback);
  const certificadosFeedback = getFeedback(profile.feedback_certificados, profile.Certificados_feedback);
  
  // Convert the 0-5 scale scores to 0-100 scale
  const convertScore = (score: number | undefined) => {
    if (score === undefined || score === null) return 0;
    return Math.round(score * 20); // Convert 0-5 to 0-100
  };

  // Get scores for display
  const headlineScore = convertScore(profile.feedback_headline_nota || profile.nota_headline);
  const sobreScore = convertScore(profile.feedback_sobre_nota || profile.nota_sobre);
  const experienceScore = convertScore(profile.feedback_experience_nota || profile.nota_experiencia);
  const projetosScore = convertScore(profile.feedback_projetos_nota || profile.nota_projetos);
  const certificadosScore = convertScore(profile.feedback_certificados_nota || profile.nota_certificados);
  
  return (
    <div className="space-y-6">
      {/* Headline section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-lg">Headline</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${headlineScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
            {headlineScore}/100
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{headlineFeedback}</p>
        </div>
      </div>
      
      {/* Sobre section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-lg">Sobre</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${sobreScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
            {sobreScore}/100
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{sobreFeedback}</p>
        </div>
      </div>
      
      {/* Experiência section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-lg">Experiência</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${experienceScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
            {experienceScore}/100
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{experienceFeedback}</p>
        </div>
      </div>
      
      {/* Projetos section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-lg">Projetos</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${projetosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
            {projetosScore}/100
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{projetosFeedback}</p>
        </div>
      </div>
      
      {/* Certificados section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-lg">Certificados</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${certificadosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
            {certificadosScore}/100
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{certificadosFeedback}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
