import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ProjectAimlA from "./pages/ProjectAimlA.jsx";
import NotFound from "./pages/NotFound.tsx";
import SystemPreloader from "./components/SystemPreloader.jsx";

const queryClient = new QueryClient();

const App = () => {
  const [booted, setBooted] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!booted && <SystemPreloader onComplete={() => setBooted(true)} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProjectAimlA />} />
            <Route path="/aether" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
