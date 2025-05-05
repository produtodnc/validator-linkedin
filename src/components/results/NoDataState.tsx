
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface NoDataStateProps {
  message?: string;
}

const NoDataState = ({ message }: NoDataStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Dados insuficientes</AlertTitle>
        <AlertDescription>
          {message || "Nenhum dado disponível. Por favor, tente novamente."}
        </AlertDescription>
      </Alert>
      
      <p className="text-gray-600 mb-4">
        Isso pode ocorrer pelos seguintes motivos:
      </p>
      
      <ul className="list-disc text-left mx-auto max-w-md mb-6 text-gray-600">
        <li className="mb-2">O processo de análise pode estar ainda em andamento</li>
        <li className="mb-2">A URL fornecida pode não corresponder a um perfil válido do LinkedIn</li>
        <li className="mb-2">Houve um problema temporário na comunicação com nossos serviços</li>
      </ul>
      
      <Button 
        onClick={() => navigate("/")} 
        className="mt-4 bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white"
      >
        Voltar para a página inicial
      </Button>
    </div>
  );
};

export default NoDataState;
