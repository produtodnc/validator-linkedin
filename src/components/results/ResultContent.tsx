
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";
import ProfileDisplay from "@/components/results/ProfileDisplay";
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
  
  if (!dataReceived) {
    return <NoDataState message={`Não foi possível encontrar dados após múltiplas consultas. Por favor, tente novamente mais tarde.`} />;
  }
  
  if (profile) {
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
        <ProfileDisplay profile={profile} />
      </>
    );
  }
  
  return <NoDataState />;
};

export default ResultContent;
