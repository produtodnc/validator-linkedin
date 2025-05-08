
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ open, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Process the email submission
    try {
      onSubmit(email);
    } catch (error) {
      console.error("Erro ao processar email:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu email",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Informe seu email</DialogTitle>
          <DialogDescription className="text-center">
            Para visualizar os resultados da análise, precisamos do seu email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <DialogFooter className="sm:justify-center">
            <Button 
              type="submit" 
              disabled={isSubmitting || !email}
              className="w-full bg-blue-950 hover:bg-blue-900"
            >
              {isSubmitting ? 
                <span className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" /> 
                : "Continuar"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
