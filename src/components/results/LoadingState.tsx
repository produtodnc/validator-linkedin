
import React from "react";

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="h-12 w-12 border-4 border-t-[#0FA0CE] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 mt-4">Aguarde enquanto processamos seu perfil do LinkedIn...</p>
      <p className="text-gray-500 text-sm mt-2">Enviamos sua solicitação para análise e estamos aguardando os resultados.</p>
      <p className="text-gray-500 text-sm mt-1">Este processo pode levar até 2 minutos para ser concluído.</p>
    </div>
  );
};

export default LoadingState;
