
import React, { useState } from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
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
  const overallScore = Math.round((headlineScore + sobreScore + experienceScore + projetosScore + certificadosScore) / 5);

  // State to track open/closed sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    headline: false,
    sobre: false,
    experiencia: false,
    projetos: false,
    certificados: false
  });

  // Toggle section state
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  return <div className="space-y-4">
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e6e6e6" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#0b1e46" strokeWidth="10" strokeDasharray={`${251.2 * overallScore / 100} 251.2`} strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{overallScore}%</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mt-2">Score Geral</h3>
      </div>
      
      <div className="space-y-4">
        {/* Headline Section */}
        <div className="section-container">
          <Collapsible open={openSections.headline} onOpenChange={() => toggleSection("headline")} className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-5 bg-gray-50 hover:bg-gray-100 transition-all rounded-full">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-lg text-gray-800">Headline</span>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-2 ${headlineScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                    {headlineScore}/100
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openSections.headline ? "transform rotate-180" : ""}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-6 py-4 bg-gray-50 rounded-3xl">
              <p className="text-gray-700">{headlineFeedback}</p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sobre Section */}
        <div className="section-container">
          <Collapsible open={openSections.sobre} onOpenChange={() => toggleSection("sobre")} className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-lg text-gray-800">Sobre</span>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-2 ${sobreScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                    {sobreScore}/100
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openSections.sobre ? "transform rotate-180" : ""}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-6 py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{sobreFeedback}</p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Experiência Section */}
        <div className="section-container">
          <Collapsible open={openSections.experiencia} onOpenChange={() => toggleSection("experiencia")} className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-lg text-gray-800">Experiência</span>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-2 ${experienceScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                    {experienceScore}/100
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openSections.experiencia ? "transform rotate-180" : ""}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-6 py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{experienceFeedback}</p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Projetos Section */}
        <div className="section-container">
          <Collapsible open={openSections.projetos} onOpenChange={() => toggleSection("projetos")} className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-lg text-gray-800">Projetos</span>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-2 ${projetosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                    {projetosScore}/100
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openSections.projetos ? "transform rotate-180" : ""}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-6 py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{projetosFeedback}</p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Certificados Section */}
        <div className="section-container">
          <Collapsible open={openSections.certificados} onOpenChange={() => toggleSection("certificados")} className="w-full">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-lg text-gray-800">Certificados</span>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-2 ${certificadosScore < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                    {certificadosScore}/100
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openSections.certificados ? "transform rotate-180" : ""}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-6 py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{certificadosFeedback}</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>;
};
export default FeedbackDisplay;
