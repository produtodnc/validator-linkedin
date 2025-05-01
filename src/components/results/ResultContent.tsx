
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import LoadingState from "@/components/results/LoadingState";
import ErrorState from "@/components/results/ErrorState";
import NoDataState from "@/components/results/NoDataState";
import ProfileDisplay from "@/components/results/ProfileDisplay";
import { LinkedInProfile } from "@/services/linkedinService";

interface ResultContentProps {
  isLoading: boolean;
  isError: boolean;
  profile: LinkedInProfile | null;
  dataReceived: boolean;
  endpointStatus: number | null;
}

const ResultContent: React.FC<ResultContentProps> = ({
  isLoading,
  isError,
  profile,
  dataReceived,
  endpointStatus
}) => {
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isError) {
    return <ErrorState />;
  }
  
  if (!dataReceived) {
    return <NoDataState message="Aguardando dados do endpoint /api/resultado..." />;
  }
  
  if (profile) {
    return (
      <>
        {endpointStatus === 200 && (
          <Alert className="mb-6 bg-green-50">
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>
              Os dados foram recebidos com sucesso no endpoint e estão sendo exibidos abaixo.
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
