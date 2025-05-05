
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";
import ProfileScoreDisplay from "@/components/results/ProfileScoreDisplay";
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
    <>
      {endpointStatus === 200 && (
        <Alert className="mb-6 bg-green-50">
          <AlertTitle>Sucesso!</AlertTitle>
          <AlertDescription>
            Os dados foram recebidos com sucesso e estão sendo exibidos abaixo.
          </AlertDescription>
        </Alert>
      )}
      <ProfileScoreDisplay profile={profile} />
    </>
  );
};

export default ResultContent;
