
import React from "react";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";
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
    <div className="flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6 border border-solid border-gray-200">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center text-[#1A1F2C] mb-8">Resultados da Análise</h2>
          <FeedbackDisplay profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default ResultContent;
