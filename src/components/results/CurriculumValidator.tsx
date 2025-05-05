
import React from "react";
import { ResultContentProps } from "@/components/results/ResultContent";
import ResultContent from "@/components/results/ResultContent";

/**
 * Componente para validação do currículo do LinkedIn
 * Utiliza os dados recebidos da API para exibir informações
 */
const CurriculumValidator: React.FC<ResultContentProps> = (props) => {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-[#1A1F2C] mb-6">Análise do Perfil LinkedIn</h1>
      <ResultContent {...props} />
    </div>
  );
};

export default CurriculumValidator;
