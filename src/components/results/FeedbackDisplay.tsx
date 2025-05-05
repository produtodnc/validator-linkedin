
import React from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { Card } from "@/components/ui/card";

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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#1A1F2C]">Feedback Detalhado</h2>
      
      <Card className="p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-[#0FA0CE]">Feedback Geral</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Headline</h4>
            <p className="text-gray-700">{headlineFeedback}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Sobre</h4>
            <p className="text-gray-700">{sobreFeedback}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Experiência</h4>
            <p className="text-gray-700">{experienceFeedback}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Projetos</h4>
            <p className="text-gray-700">{projetosFeedback}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Certificados</h4>
            <p className="text-gray-700">{certificadosFeedback}</p>
          </div>
        </div>
      </Card>
   
    </div>
  );
};

export default FeedbackDisplay;
