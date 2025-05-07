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
  return <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="headline">
          <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-lg rounded-2xl">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Headline</span>
              <span className={`px-3 py-1 rounded-full text-sm ${headlineScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {headlineScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-gray-50 mt-1 rounded-lg">
            <p className="text-gray-700">{headlineFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sobre" className="mt-3">
          <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-lg rounded-2xl">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Sobre</span>
              <span className={`px-3 py-1 rounded-full text-sm ${sobreScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {sobreScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-gray-50 mt-1 rounded-lg">
            <p className="text-gray-700">{sobreFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="experiencia" className="mt-3">
          <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-lg rounded-2xl">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Experiência</span>
              <span className={`px-3 py-1 rounded-full text-sm ${experienceScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {experienceScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-gray-50 mt-1 rounded-lg">
            <p className="text-gray-700">{experienceFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="projetos" className="mt-3">
          <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-lg rounded-2xl">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Projetos</span>
              <span className={`px-3 py-1 rounded-full text-sm ${projetosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {projetosScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-gray-50 mt-1 rounded-lg">
            <p className="text-gray-700">{projetosFeedback}</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="certificados" className="mt-3">
          <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-lg rounded-2xl">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-lg text-gray-800">Certificados</span>
              <span className={`px-3 py-1 rounded-full text-sm ${certificadosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {certificadosScore}/100
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-gray-50 mt-1 rounded-lg">
            <p className="text-gray-700">{certificadosFeedback}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>;
};
export default FeedbackDisplay;