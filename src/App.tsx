import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from "react-query";
import { queryClient } from "./lib/react-query";

export function App() {
  return (
<QueryClientProvider client={queryClient}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 1000,
         
        }} 
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}