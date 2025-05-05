
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  retryCount?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ retryCount = 0 }) => {
  const [progress, setProgress] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState("Aguarde enquanto processamos seu perfil do LinkedIn...");
  
  useEffect(() => {
    const startTime = Date.now();
    const maxTime = 20000; // 20 segundos em milissegundos
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.floor((elapsed / maxTime) * 100), 99);
      setProgress(newProgress);
      
      // Atualizar a mensagem com base no tempo decorrido
      if (elapsed > 15000) { // Após 15 segundos
        setWaitingMessage("Quase lá! Estamos finalizando a busca dos seus dados...");
      } else if (elapsed > 10000) { // Após 10 segundos
        setWaitingMessage("Estamos buscando seus dados no banco de dados. Por favor, continue aguardando...");
      } else if (elapsed > 5000) { // Após 5 segundos
        setWaitingMessage("A busca dos seus dados está em andamento. Isso levará alguns segundos...");
      }
      
      if (elapsed >= maxTime) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="h-12 w-12 border-4 border-t-[#0FA0CE] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 mt-4 text-center">{waitingMessage}</p>
      <p className="text-gray-500 text-sm mt-2 text-center">
        {retryCount > 0 
          ? `Tentativa ${retryCount}/3: Estamos verificando novamente o banco de dados.`
          : "Estamos aguardando 20 segundos para buscar os dados completos do seu perfil."}
      </p>
      
      <div className="w-full mt-8">
        <Progress value={progress} className="h-2" />
        <p className="text-gray-500 text-xs mt-1 text-right">{progress}%</p>
      </div>
      
      <div className="w-full mt-8 space-y-3">
        <p className="text-gray-600 font-medium">Aguardando dados do perfil</p>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Headline</span>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Sobre</span>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Experiência</span>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Projetos</span>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Certificados</span>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
