
import React from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileScoreDisplayProps {
  profile: LinkedInProfile;
}

interface ScoreItemProps {
  label: string;
  score: number;
}

const ScoreItem = ({ label, score }: ScoreItemProps) => {
  // Define color based on score
  const scoreColor = score < 60 ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500";
  
  return (
    <div className="flex items-center justify-between rounded-full border p-4 mb-4">
      <span className="text-lg font-medium text-gray-700">{label}</span>
      <span className={`px-3 py-1 rounded-full ${scoreColor}`}>
        {score}/100
      </span>
    </div>
  );
};

const ProfileScoreDisplay = ({ profile }: ProfileScoreDisplayProps) => {
  const navigate = useNavigate();
  
  // Convert the 0-5 scale scores to 0-100 scale
  const convertScore = (score: number | undefined) => {
    if (score === undefined || score === null) return 0;
    return Math.round(score * 20); // Convert 0-5 to 0-100
  };

  // Get scores from profile data (handling both old and new formats)
  const headlineScore = convertScore(profile.feedback_headline_nota || profile.nota_headline);
  const sobreScore = convertScore(profile.feedback_sobre_nota || profile.nota_sobre);
  const experienceScore = convertScore(profile.feedback_experience_nota || profile.nota_experiencia);
  const projetosScore = convertScore(profile.feedback_projetos_nota || profile.nota_projetos);
  const certificadosScore = convertScore(profile.feedback_certificados_nota || profile.nota_certificados);
  
  // Calculate overall completion score based on all individual scores
  const completionScore = profile.completionScore || Math.round(
    (headlineScore + sobreScore + experienceScore + projetosScore + certificadosScore) / 5
  );
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center text-[#1A1F2C]">Meu score</h2>
        
        {/* Circular progress indicator */}
        <div className="relative w-40 h-40 mb-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="#e6e6e6" 
              strokeWidth="10" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="#007bff" 
              strokeWidth="10" 
              strokeDasharray={`${251.2 * completionScore / 100} 251.2`} 
              strokeDashoffset="0" 
              strokeLinecap="round" 
              transform="rotate(-90 50 50)" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{completionScore}%</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <ScoreItem label="Headline" score={headlineScore} />
        <ScoreItem label="Sobre" score={sobreScore} />
        <ScoreItem label="Experiência" score={experienceScore} />
        <ScoreItem label="Projetos" score={projetosScore} />
        <ScoreItem label="Certificados" score={certificadosScore} />
      </div>
      
    </div>
  );
};

export default ProfileScoreDisplay;
