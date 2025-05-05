
import { useState, useCallback } from "react";
import { LinkedInProfile } from "@/services/linkedinService";
import { areAllFieldsFilled, isRealData, isCorrectProfileData } from "@/utils/profileDataValidation";
import { useToast } from "@/hooks/use-toast";

// Initialize the object if it doesn't exist yet
if (typeof window !== 'undefined') {
  window._receivedLinkedInData = window._receivedLinkedInData || {};
}

// Type to extend window interface
declare global {
  interface Window {
    _receivedLinkedInData?: {
      [url: string]: LinkedInProfile;
    };
  }
}

/**
 * Hook for checking and processing LinkedIn profile data
 */
export const useProfileDataCheck = (linkedinUrl: string) => {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [dataReceived, setDataReceived] = useState<boolean>(false);
  const { toast } = useToast();

  const checkForData = useCallback(async () => {
    try {
      console.log("[POLLING] Verificando dados para URL:", linkedinUrl);
      
      // Send POST request to the endpoint
      const response = await fetch('/api/resultado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: linkedinUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("[POLLING] Dados recebidos do endpoint:", data);
        
        // Check if data corresponds to the correct profile
        if (!isCorrectProfileData(data, linkedinUrl)) {
          console.log("[POLLING] Dados recebidos não correspondem ao perfil solicitado:", linkedinUrl);
          return false; // Continue polling because the data is not for this profile
        }
        
        // Check if data is real and not mocked
        if (!isRealData(data, linkedinUrl)) {
          console.log("[POLLING] Dados mockados detectados, aguardando dados reais");
          return false; // Continue polling because data is mocked
        }
        
        // Check if all feedback fields are filled
        if (areAllFieldsFilled(data)) {
          setProfile(data);
          setDataReceived(true);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });
          
          return true; // Complete data received, can stop polling
        } else {
          console.log("[POLLING] Dados recebidos, mas alguns campos estão faltando");
          return false; // Continue polling until all fields are filled
        }
      }
      
      // Check if we found anything in global storage
      if (window._receivedLinkedInData && window._receivedLinkedInData[linkedinUrl]) {
        console.log("[POLLING] Dados encontrados no armazenamento global:", window._receivedLinkedInData[linkedinUrl]);
        
        const data = window._receivedLinkedInData[linkedinUrl];
        
        // Check if data corresponds to the correct profile
        if (!isCorrectProfileData(data, linkedinUrl)) {
          console.log("[POLLING] Dados no armazenamento global não correspondem ao perfil solicitado:", linkedinUrl);
          return false; // Continue polling because the data is not for this profile
        }
        
        // Check if data is real and not mocked
        if (!isRealData(data, linkedinUrl)) {
          console.log("[POLLING] Dados mockados detectados no armazenamento global, aguardando dados reais");
          return false; // Continue polling because data is mocked
        }
        
        // Check if all feedback fields are filled
        if (areAllFieldsFilled(data)) {
          delete window._receivedLinkedInData[linkedinUrl]; // Clean up to avoid duplication
          
          setProfile(data);
          setDataReceived(true);
          
          toast({
            title: "Análise concluída",
            description: "Os dados do seu perfil do LinkedIn foram processados com sucesso",
          });

          return true; // Complete data received, can stop polling
        } else {
          console.log("[POLLING] Dados encontrados no armazenamento global, mas alguns campos estão faltando");
          return false; // Continue polling until all fields are filled
        }
      }
      
      return false; // Continue polling
    } catch (error) {
      console.error("[POLLING] Erro verificando dados:", error);
      return false; // Continue trying
    }
  }, [linkedinUrl, toast]);

  return { profile, dataReceived, checkForData };
};
