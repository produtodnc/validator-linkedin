
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState = () => {
  const [progress, setProgress] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState("Aguarde enquanto processamos seu perfil do LinkedIn...");
  
  useEffect(() => {
    const startTime = Date.now();
    const maxTime = 300000; // 5 minutos em milissegundos
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.floor((elapsed / maxTime) * 100), 99);
      setProgress(newProgress);
      
      // Atualizar a mensagem com base no tempo decorrido
      if (elapsed > 120000) { // Após 2 minutos
        setWaitingMessage("Estamos finalizando a análise do seu perfil. Por favor, continue aguardando...");
      } else if (elapsed > 60000) { // Após 1 minuto
        setWaitingMessage("A análise do seu perfil está em andamento. Isso pode levar alguns minutos...");
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
      <p className="text-gray-600 mt-4">{waitingMessage}</p>
      <p className="text-gray-500 text-sm mt-2">Enviamos sua solicitação para análise e estamos aguardando os resultados.</p>
      <p className="text-gray-500 text-sm mt-1">Este processo pode levar até 5 minutos para ser concluído.</p>
      
      <div className="w-full mt-8">
        <Progress value={progress} className="h-2" />
        <p className="text-gray-500 text-xs mt-1 text-right">{progress}%</p>
      </div>
      
      <div className="w-full mt-8 space-y-3">
        <p className="text-gray-600 font-medium">Preparando visualização</p>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
