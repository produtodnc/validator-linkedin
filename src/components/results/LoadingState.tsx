import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  retryCount?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ retryCount = 0 }) => {
  const [progress, setProgress] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState("Aguarde enquanto consultamos seu perfil do LinkedIn...");
  
  useEffect(() => {
    const startTime = Date.now();
    const maxTime = 20000; // 20 segundos em milissegundos
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.floor((elapsed / maxTime) * 100), 99);
      setProgress(newProgress);
      
      // Atualizar a mensagem com base no tempo decorrido
      if (elapsed > 15000) { // Após 15 segundos
        setWaitingMessage("Quase lá! Continuamos buscando seus dados...");
      } else if (elapsed > 10000) { // Após 10 segundos
        setWaitingMessage("Estamos consultando o banco de dados em tempo real. Por favor, aguarde...");
      } else if (elapsed > 5000) { // Após 5 segundos
        setWaitingMessage("A busca dos seus dados está em andamento. Isso pode levar alguns segundos...");
      }
      
      if (elapsed >= maxTime) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getRetryMessage = () => {
    if (retryCount <= 4) {
      return `Consultando dados... Verificando se os dados já estão disponíveis.`;
    }
    return `Tentativa adicional... Continuamos verificando o banco de dados.`;
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-12">
      
      <p className="text-gray-500 text-sm mt-2 text-center">
        {retryCount > 0 
          ? getRetryMessage()
          : "Estamos consultando o banco de dados em tempo real para buscar os dados do seu perfil."}
      </p>
      
      <div className="w-full mt-8">
        <Progress value={progress} className="h-2 bg-gray-200">
          <div className="h-full bg-[#1A1F2C]"></div>
        </Progress>
        <p className="text-[#1A1F2C] text-xs mt-1 text-right">{progress}%</p>
      </div>
    </div>
  );
};

export default LoadingState;
