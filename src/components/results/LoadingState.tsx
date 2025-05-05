
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
      if (elapsed > 180000) { // Após 3 minutos
        setWaitingMessage("Quase lá! Estamos finalizando a análise completa do seu perfil...");
      } else if (elapsed > 120000) { // Após 2 minutos
        setWaitingMessage("Estamos finalizando a análise do seu perfil. Por favor, continue aguardando...");
      } else if (elapsed > 60000) { // Após 1 minuto
        setWaitingMessage("A análise do seu perfil está em andamento. Isso pode levar alguns minutos...");
      } else if (elapsed > 30000) { // Após 30 segundos
        setWaitingMessage("Nosso sistema está processando seu perfil. Obrigado pela paciência...");
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
      <p className="text-gray-500 text-sm mt-2 text-center">Estamos analisando cada seção do seu perfil para fornecer um feedback completo.</p>
      <p className="text-gray-500 text-sm mt-1 text-center">Este processo pode levar até 5 minutos para ser concluído.</p>
      
      <div className="w-full mt-8">
        <Progress value={progress} className="h-2" />
        <p className="text-gray-500 text-xs mt-1 text-right">{progress}%</p>
      </div>
      
      <div className="w-full mt-8 space-y-3">
        <p className="text-gray-600 font-medium">Analisando seu perfil do LinkedIn</p>
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
