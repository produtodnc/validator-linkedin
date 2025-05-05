
import React from "react";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";
import ProfileScoreDisplay from "@/components/results/ProfileScoreDisplay";
import FeedbackDisplay from "@/components/results/FeedbackDisplay";
import { LinkedInProfile } from "@/services/linkedinService";

export interface ResultContentProps {
  isLoading?: boolean;
  isError?: boolean;
  profile?: LinkedInProfile | null;
  dataReceived?: boolean;
  endpointStatus?: number | null;
  retryCount?: number;
}

const ResultContent: React.FC<ResultContentProps> = ({
  isLoading = true,
  isError = false,
  profile = null,
  dataReceived = false,
  endpointStatus = null,
  retryCount = 0
}) => {
  console.log("[RESULT_CONTENT] Estado atual:", { isLoading, isError, dataReceived, retryCount });
  
  if (isLoading) {
    return <LoadingState retryCount={retryCount} />;
  }
  
  if (isError) {
    return <ErrorState />;
  }
  
  if (!dataReceived || !profile) {
    return <NoDataState message={`Não foi possível encontrar dados completos após múltiplas consultas. Por favor, verifique se sua URL do LinkedIn está correta e tente novamente mais tarde.`} />;
  }
  
  // Se chegamos aqui, temos dados para exibir
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6 border border-solid border-gray-200">
        <ProfileScoreDisplay profile={profile} />
      </div>
      
      <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6 border border-solid border-gray-200">
        <FeedbackDisplay profile={profile} />
      </div>
    </div>
  );
};

export default ResultContent;
