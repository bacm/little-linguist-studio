import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WordList from "./pages/WordList";
import WordDetail from "./pages/WordDetail";
import Statistics from "./pages/Statistics";
import AISuggestions from "./pages/AISuggestions";
import Flashcards from "./pages/Flashcards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Force rebuild for AI suggestions route

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/:id" element={<WordDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/ai-suggestions" element={<AISuggestions />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
