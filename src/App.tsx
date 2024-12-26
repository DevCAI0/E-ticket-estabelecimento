import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/Theme/theme-provider";

import { router } from "./routes";
import { Toaster } from "sonner";

export const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster duration={1000} position="top-right" />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
