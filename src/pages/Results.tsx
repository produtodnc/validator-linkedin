
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CurriculumValidator from "@/components/results/CurriculumValidator";
import ResultsContainer from "@/components/results/ResultsContainer";

const Results = () => {
  const location = useLocation();
  
  // Get LinkedIn URL from navigation state
  const linkedinUrl = location.state?.linkedinUrl || "";
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto w-full">
          <ResultsContainer linkedinUrl={linkedinUrl}>
            <CurriculumValidator />
          </ResultsContainer>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
