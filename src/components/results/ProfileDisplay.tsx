
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Interface para dados do perfil LinkedIn
interface LinkedInProfile {
  url: string;
  name: string;
  headline: string;
  recommendations: number;
  connections: string;
  completionScore: number;
  suggestedImprovements: string[];
  // Campos de feedback
  Headline_feedback?: string;
  nota_headline?: number;
  Sobre_feedback?: string;
  nota_sobre?: number;
  Experiencias_feedback?: string;
  nota_experiencia?: number;
  Projetos_feedback?: string;
  nota_projetos?: number;
  Certificados_feedback?: string;
  nota_certificados?: number;
  // Campos do banco de dados
  feedback_headline?: string;
  feedback_headline_nota?: number;
  feedback_sobre?: string;
  feedback_sobre_nota?: number;
  feedback_experience?: string;
  feedback_experience_nota?: number;
  feedback_projetos?: string;
  feedback_projetos_nota?: number;
  feedback_certificados?: string;
  feedback_certificados_nota?: number;
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
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seção</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.feedback_headline && (
                  <TableRow>
                    <TableCell className="font-medium">Headline</TableCell>
                    <TableCell>{profile.feedback_headline}</TableCell>
                    <TableCell className="text-center font-bold">{profile.feedback_headline_nota}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.feedback_sobre && (
                  <TableRow>
                    <TableCell className="font-medium">Sobre</TableCell>
                    <TableCell>{profile.feedback_sobre}</TableCell>
                    <TableCell className="text-center font-bold">{profile.feedback_sobre_nota}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.feedback_experience && (
                  <TableRow>
                    <TableCell className="font-medium">Experiências</TableCell>
                    <TableCell>{profile.feedback_experience}</TableCell>
                    <TableCell className="text-center font-bold">{profile.feedback_experience_nota}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.feedback_projetos && (
                  <TableRow>
                    <TableCell className="font-medium">Projetos</TableCell>
                    <TableCell>{profile.feedback_projetos}</TableCell>
                    <TableCell className="text-center font-bold">{profile.feedback_projetos_nota}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.feedback_certificados && (
                  <TableRow>
                    <TableCell className="font-medium">Certificados</TableCell>
                    <TableCell>{profile.feedback_certificados}</TableCell>
                    <TableCell className="text-center font-bold">{profile.feedback_certificados_nota}/5</TableCell>
                  </TableRow>
                )}
                
                {/* Compatibilidade com formato antigo dos dados */}
                {profile.Headline_feedback && !profile.feedback_headline && (
                  <TableRow>
                    <TableCell className="font-medium">Headline</TableCell>
                    <TableCell>{profile.Headline_feedback}</TableCell>
                    <TableCell className="text-center font-bold">{profile.nota_headline}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.Sobre_feedback && !profile.feedback_sobre && (
                  <TableRow>
                    <TableCell className="font-medium">Sobre</TableCell>
                    <TableCell>{profile.Sobre_feedback}</TableCell>
                    <TableCell className="text-center font-bold">{profile.nota_sobre}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.Experiencias_feedback && !profile.feedback_experience && (
                  <TableRow>
                    <TableCell className="font-medium">Experiências</TableCell>
                    <TableCell>{profile.Experiencias_feedback}</TableCell>
                    <TableCell className="text-center font-bold">{profile.nota_experiencia}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.Projetos_feedback && !profile.feedback_projetos && (
                  <TableRow>
                    <TableCell className="font-medium">Projetos</TableCell>
                    <TableCell>{profile.Projetos_feedback}</TableCell>
                    <TableCell className="text-center font-bold">{profile.nota_projetos}/5</TableCell>
                  </TableRow>
                )}
                
                {profile.Certificados_feedback && !profile.feedback_certificados && (
                  <TableRow>
                    <TableCell className="font-medium">Certificados</TableCell>
                    <TableCell>{profile.Certificados_feedback}</TableCell>
                    <TableCell className="text-center font-bold">{profile.nota_certificados}/5</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
      
      {profile.suggestedImprovements && profile.suggestedImprovements.length > 0 && (
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
      )}
      
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
