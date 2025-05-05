
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { LinkedInProfile } from "@/services/linkedinService";
import { ResultContentProps } from "./ResultContent";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";

const CurriculumValidator: React.FC<ResultContentProps> = ({
  isLoading = true,
  isError = false,
  profile = null,
  dataReceived = false,
  retryCount = 0
}) => {
  const navigate = useNavigate();
  
  console.log("[CURRICULUM_VALIDATOR] Estado atual:", { isLoading, isError, dataReceived, retryCount });
  
  if (isLoading) {
    return <LoadingState retryCount={retryCount} />;
  }
  
  if (isError) {
    return <ErrorState />;
  }
  
  if (!dataReceived || !profile) {
    return <NoDataState message={`Não foi possível encontrar dados completos após múltiplas consultas. Por favor, verifique se sua URL do LinkedIn está correta e tente novamente mais tarde.`} />;
  }
  
  // Função para avaliar pontuações e retornar classes CSS correspondentes
  const getScoreClasses = (score: number) => {
    if (score >= 4) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };
  
  // Função para gerar o texto de pontuação
  const getScoreText = (score: number) => {
    return `${score}/5`;
  };
  
  // Extrair os scores das diferentes seções
  const headlineScore = profile.feedback_headline_nota || 0;
  const aboutScore = profile.feedback_sobre_nota || 0;
  const experienceScore = profile.feedback_experience_nota || 0;
  const projectsScore = profile.feedback_projetos_nota || 0;
  const certificatesScore = profile.feedback_certificados_nota || 0;
  
  // Calcular pontos positivos e oportunidades de melhoria
  const positivePoints = [];
  const improvementPoints = [];
  
  if (headlineScore >= 4) positivePoints.push("Headline bem estruturado e impactante.");
  else improvementPoints.push("Aprimore seu headline para destacar suas principais competências.");
  
  if (aboutScore >= 4) positivePoints.push("Seção 'Sobre' clara e informativa.");
  else improvementPoints.push("Adicione um breve resumo profissional destacando suas competências e diferenciais.");
  
  if (experienceScore >= 4) positivePoints.push("Experiência detalhada com responsabilidades e conquistas.");
  else improvementPoints.push("Detalhe melhor suas experiências, incluindo números para evidenciar impacto.");
  
  if (projectsScore >= 4) positivePoints.push("Projetos relevantes e bem descritos.");
  else improvementPoints.push("Adicione mais detalhes sobre seus projetos e resultados alcançados.");
  
  if (certificatesScore >= 4) positivePoints.push("Certificações relevantes para sua área de atuação.");
  else improvementPoints.push("Inclua certificações relevantes para sua área de atuação.");
  
  // Se não tiver pontos positivos suficientes, adicione genéricos
  if (positivePoints.length === 0) {
    positivePoints.push("Seu perfil tem potencial e mostra interesse em desenvolvimento profissional.");
  }
  
  // Se não tiver oportunidades de melhoria suficientes, adicione genéricas
  if (improvementPoints.length === 0) {
    improvementPoints.push("Continue atualizando seu perfil regularmente com novas conquistas e habilidades.");
    improvementPoints.push("Inclua palavras-chave relevantes para ser encontrado por recrutadores.");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] mb-2">Validador de Currículo</h1>
        <p className="text-gray-600">Valide seu currículo e extraia dicas essenciais com nossa IA!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna da esquerda - Score e métricas */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-center mb-4">Meu score</h2>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-gray-200" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="none" 
                />
                <circle 
                  className="text-blue-500" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * profile.completionScore / 100)} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{profile.completionScore}%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-md border">
              <span>Headline</span>
              <Badge className={getScoreClasses(headlineScore)}>{getScoreText(headlineScore)}</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-md border">
              <span>Sobre</span>
              <Badge className={getScoreClasses(aboutScore)}>{getScoreText(aboutScore)}</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-md border">
              <span>Experiências</span>
              <Badge className={getScoreClasses(experienceScore)}>{getScoreText(experienceScore)}</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-md border">
              <span>Projetos</span>
              <Badge className={getScoreClasses(projectsScore)}>{getScoreText(projectsScore)}</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-md border">
              <span>Certificados</span>
              <Badge className={getScoreClasses(certificatesScore)}>{getScoreText(certificatesScore)}</Badge>
            </div>
          </div>
        </div>
        
        {/* Coluna da direita - Feedback */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Feedback Geral:</h2>
          
          <p className="text-gray-700 mb-4">
            Seu currículo tem uma boa estrutura e destaca suas experiências e habilidades de forma clara. 
            No entanto, há alguns pontos que podem ser aprimorados para torná-lo ainda mais atrativo para recrutadores:
          </p>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Pontos Positivos:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {positivePoints.map((point, index) => (
                <li key={index} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Oportunidades de Melhoria:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {improvementPoints.map((point, index) => (
                <li key={index} className="text-gray-700">{point}</li>
              ))}
              <li className="text-gray-700">Utilize termos estratégicos da sua área para melhorar a compatibilidade com sistemas de recrutamento (ATS).</li>
              <li className="text-gray-700">Mantenha um design limpo e profissional, evitando excesso de informações.</li>
            </ul>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={() => navigate("/")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Refazer Currículo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumValidator;
