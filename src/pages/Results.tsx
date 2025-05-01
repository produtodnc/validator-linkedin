
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultContent from "@/components/results/ResultContent";
import ResultsContainer from "@/components/results/ResultsContainer";
import { setupEndpointListener } from "@/utils/endpointListener";

const Results = () => {
  const location = useLocation();
  
  // Get LinkedIn URL from navigation state
  const linkedinUrl = location.state?.linkedinUrl || "";
  
  // Set up endpoint listener when component loads
  useEffect(() => {
    setupEndpointListener();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#1A1F2C]">Resultados da Validação</h1>
          
          <ResultsContainer linkedinUrl={linkedinUrl}>
            <ResultContent />
          </ResultsContainer>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
