
import React from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FeedbackDisplayProps {
  profile: LinkedInProfile;
}

const FeedbackDisplay = ({
  profile
}: FeedbackDisplayProps) => {
  // Helper function to get feedback text from profile data (handling both old and new formats)
  const getFeedback = (newFormat: string | undefined, oldFormat: string | undefined) => newFormat || oldFormat || "Sem feedback disponível";
  
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

  // Calculate the overall score based on all individual scores
  const overallScore = Math.round(
    (headlineScore + sobreScore + experienceScore + projetosScore + certificadosScore) / 5
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e6e6e6" strokeWidth="10" />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="#007bff" 
              strokeWidth="10" 
              strokeDasharray={`${251.2 * overallScore / 100} 251.2`} 
              strokeDashoffset="0" 
              strokeLinecap="round" 
              transform="rotate(-90 50 50)" 
              className="transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{overallScore}%</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mt-2">Score Geral</h3>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="headline" className="border-none overflow-hidden">
          <AccordionTrigger className="flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full data-[state=open]:rounded-b-none">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Headline</span>
              <span className={`px-3 py-1 rounded-full text-sm ${headlineScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {headlineScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50 mt-0 rounded-b-lg">
            <p className="text-gray-700">{headlineFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sobre" className="border-none overflow-hidden">
          <AccordionTrigger className="flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full data-[state=open]:rounded-b-none">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Sobre</span>
              <span className={`px-3 py-1 rounded-full text-sm ${sobreScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {sobreScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50 mt-0 rounded-b-lg">
            <p className="text-gray-700">{sobreFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="experiencia" className="border-none overflow-hidden">
          <AccordionTrigger className="flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full data-[state=open]:rounded-b-none">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Experiência</span>
              <span className={`px-3 py-1 rounded-full text-sm ${experienceScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {experienceScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50 mt-0 rounded-b-lg">
            <p className="text-gray-700">{experienceFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="projetos" className="border-none overflow-hidden">
          <AccordionTrigger className="flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full data-[state=open]:rounded-b-none">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Projetos</span>
              <span className={`px-3 py-1 rounded-full text-sm ${projetosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {projetosScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50 mt-0 rounded-b-lg">
            <p className="text-gray-700">{projetosFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="certificados" className="border-none overflow-hidden">
          <AccordionTrigger className="flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full data-[state=open]:rounded-b-none">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Certificados</span>
              <span className={`px-3 py-1 rounded-full text-sm ${certificadosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {certificadosScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-gray-50 mt-0 rounded-b-lg">
            <p className="text-gray-700">{certificadosFeedback}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FeedbackDisplay;
