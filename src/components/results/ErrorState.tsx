
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <p className="text-gray-600 mb-2">Ocorreu um erro ao buscar os dados do perfil.</p>
      <p className="text-gray-500 text-sm mb-4">Nosso endpoint não conseguiu receber os dados. Por favor, tente novamente.</p>
      <Button 
        onClick={() => navigate("/")} 
        className="mt-4 bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white"
      >
        Voltar e tentar novamente
      </Button>
    </div>
  );
};

export default ErrorState;
