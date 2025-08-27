"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertCircle,
  Coffee,
  ArrowRight,
  Eye,
  EyeOff,
  ChefHat,
  Utensils,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/auth/useAuth";
import { cn } from "@/lib/utils";
import type { AuthCredentials } from "@/types/user";
import { showErrorToast } from "@/components/ui/sonner";

interface FormError {
  identifier?: string;
  senha?: string;
}

export default function SignIn() {
  const [formData, setFormData] = useState<AuthCredentials>({
    identifier: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormError>({});
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const validators = {
    identifier: (value: string): string => {
      if (!value.trim()) return "Login é obrigatório";
      if (value.length < 3) return "Login deve ter pelo menos 3 caracteres";
      return "";
    },
    senha: (value: string): string => {
      if (!value) return "Senha é obrigatória";
      if (value.length < 6) return "Senha deve ter pelo menos 6 caracteres";
      return "";
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validators[name as keyof typeof validators](value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = (): boolean => {
    const newErrors: FormError = {
      identifier: validators.identifier(formData.identifier),
      senha: validators.senha(formData.senha),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn(formData);

      if (result.success && result.user) {
        if (result.user.id_perfil === 1) {
          navigate("/", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao tentar fazer login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    name: keyof AuthCredentials,
    label: string,
    type: string,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={name === "senha" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={isLoading}
          className={cn(
            "h-12 text-base placeholder:text-muted-foreground/50",
            "transition-all duration-300",
            "border-2 focus:border-[#f97316]/30 focus:ring-2 focus:ring-[#f97316]/20",
            errors[name] &&
              "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
          )}
        />
        {name === "senha" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      {errors[name] && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors[name]}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff7ed] via-background to-[#fff7ed] p-4 dark:from-[#27150a]/20 dark:via-background dark:to-[#27150a]/20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-[#fed7aa]/20 blur-3xl dark:bg-[#f97316]/10" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#fdba74]/10 blur-3xl dark:bg-[#ea580c]/10" />
        <div className="absolute left-1/3 top-1/4 h-48 w-48 rounded-full bg-[#ffedd5]/30 blur-2xl dark:bg-[#c2410c]/10" />

        <div className="absolute left-[15%] top-[20%] animate-bounce opacity-20">
          <Coffee className="h-12 w-12 text-[#ea580c] dark:text-[#f97316]" />
        </div>
        <div className="absolute right-[20%] top-[30%] animate-pulse opacity-20">
          <ChefHat className="h-10 w-10 text-[#f97316] dark:text-[#fb923c]" />
        </div>
        <div className="absolute bottom-[25%] left-[25%] animate-ping opacity-20">
          <Utensils className="h-8 w-8 text-[#fb923c] dark:text-[#fdba74]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="overflow-hidden border-0 bg-card/80 shadow-xl backdrop-blur-sm">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#fb923c] to-[#ea580c] opacity-10 blur-2xl dark:opacity-20" />

          <CardHeader className="space-y-2 pb-6">
            <div className="mb-6 flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 dark:from-[#f97316] dark:to-[#c2410c]">
                <Coffee className="h-6 w-6" />
                <span className="text-2xl font-bold">E-ticket</span>
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold sm:text-3xl">
              Bem-vindo ao Sistema
            </CardTitle>
            <CardDescription className="text-center text-base">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderInput("identifier", "Login", "text", "Digite seu login")}
              {renderInput("senha", "Senha", "password", "Digite sua senha")}

              <div>
                <Button
                  type="submit"
                  disabled={isLoading || Object.values(errors).some(Boolean)}
                  className={cn(
                    "h-12 w-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-base font-medium text-white dark:from-[#f97316] dark:to-[#c2410c]",
                    "transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-[#f97316]/20 active:scale-[0.98]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Entrar</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pb-8 pt-2">
            <p className="text-center text-sm text-muted-foreground">
              Sistema de gerenciamento de tickets para estabelecimentos
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
