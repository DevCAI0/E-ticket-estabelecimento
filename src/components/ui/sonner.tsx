import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Funções para exibir toasts com cores específicas
const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: {
      backgroundColor: "#28a745", // Verde para sucesso
      color: "#fff",
    },
  });
};

const showErrorToast = (message: string) => {
  toast.error(message, {
    style: {
      backgroundColor: "#dc3545", // Vermelho para erro
      color: "#fff",
    },
  });
};

export { Toaster, showSuccessToast, showErrorToast };
