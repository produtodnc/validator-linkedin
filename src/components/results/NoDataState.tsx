
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NoDataState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <p className="text-gray-600">Nenhum dado disponível. Por favor, tente novamente.</p>
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
