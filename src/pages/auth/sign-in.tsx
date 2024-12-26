// src/pages/auth/sign-in.tsx
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
} from "@/components/ui/card";
import { AlertCircle, Coffee, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AuthCredentials } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface FormError {
  identifier?: string;
  senha?: string;
}

const animations = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  },
  form: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  input: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  },
};

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
  const { toast } = useToast();

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

      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${result.user?.nome}!`,
          duration: 3000,
        });
        navigate("/", { replace: true });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: result.message || "Login ou senha inválidos.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao tentar fazer login.",
        duration: 5000,
      });
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
    <motion.div variants={animations.input} className="space-y-2">
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
            "border-2 focus:border-primary/20 focus:ring-2 focus:ring-primary/20",
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
      <AnimatePresence>
        {errors[name] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors[name]}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <div className="pattern-dots pattern-blue-500 pattern-bg-white pattern-size-6 pattern-opacity-10 absolute inset-0 h-full w-full" />

      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm"
      >
        <Card className="border-2 bg-background/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2 pb-8">
            <div className="mb-8 flex justify-center">
              <motion.div
                className="flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Coffee className="h-6 w-6 text-primary" />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent">
                  FoodPass
                </span>
              </motion.div>
            </div>
            <CardTitle className="text-center text-2xl font-bold sm:text-3xl">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center text-base">
              Faça login para continuar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <motion.form
              variants={animations.form}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {renderInput("identifier", "Login", "text", "Digite seu login")}
              {renderInput("senha", "Senha", "password", "Digite sua senha")}

              <motion.div variants={animations.input}>
                <Button
                  type="submit"
                  disabled={isLoading || Object.values(errors).some(Boolean)}
                  className={cn(
                    "h-12 w-full text-base font-medium",
                    "transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
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
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
