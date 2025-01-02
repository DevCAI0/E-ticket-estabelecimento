// import { useState } from "react";
// import FacialRecognitionDialog from "../facial-recognition/FacialRecognitionDialog";
import { Profile } from "../profile";
import { ThemeToggle } from "../Theme/theme-toggle";
// import { Button } from "@/components/ui/button";
// import { Camera } from "lucide-react";

export function Header() {
  // const [isDialogOpen, setIsDialogOpen] = useState(false);

  // const handleSuccess = () => {
  //   setIsDialogOpen(false);
  //   // Adicione aqui qualquer lógica adicional após o sucesso da verificação
  // };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/80 dark:supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-full items-center justify-between px-4">
        <span className="font-semibold text-foreground dark:text-foreground">
          E-Ticket
        </span>

        <div className="ml-auto flex items-center space-x-2">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="text-foreground hover:bg-accent dark:text-foreground dark:hover:bg-accent"
          >
            <Camera className="w-5 h-5" />
          </Button> */}

          {/* <FacialRecognitionDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSuccess={handleSuccess}
            funcionarioId={4823}
          /> */}

          <ThemeToggle />
          <Profile />
        </div>
      </div>
    </header>
  );
}
