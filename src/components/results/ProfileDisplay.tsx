
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Interface para dados do perfil LinkedIn
interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
  completionScore: number;
  suggestedImprovements: string[];
}

interface ProfileDisplayProps {
  profile: LinkedInProfile;
}

const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="text-2xl">Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-700">URL</p>
              <p className="text-sm text-gray-600 break-all">{profile.url}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Nome</p>
              <p className="text-gray-900">{profile.name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Título</p>
              <p className="text-gray-900">{profile.headline}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">Recomendações</p>
                <p className="text-gray-900">{profile.recommendations}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Conexões</p>
                <p className="text-gray-900">{profile.connections}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-t-4 border-t-[#0FA0CE]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span>Índice de Completude</span>
            <span className="ml-auto text-[#0FA0CE]">{profile.completionScore}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0FA0CE] rounded-full" 
              style={{ width: `${profile.completionScore}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sugestões de Melhoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {profile.suggestedImprovements.map((suggestion, index) => (
              <li key={index} className="text-gray-700">{suggestion}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => navigate("/")}
          className="bg-[#0FA0CE] hover:bg-[#1EAEDB] text-white"
        >
          Validar outro perfil
        </Button>
      </div>
    </div>
  );
};

export default ProfileDisplay;
