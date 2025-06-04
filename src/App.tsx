
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FilterProvider } from "@/contexts/FilterContext";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Leads from "./pages/Leads";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Definir título da aplicação
  React.useEffect(() => {
    document.title = 'Clarity - Analytics Dashboard';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FilterProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
                <AppSidebar />
                <main className="flex-1">
                  <div className="p-4 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <SidebarTrigger />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-md p-1 flex items-center justify-center">
                          <img 
                            src="/lovable-uploads/82cceff9-b8f2-4ee8-a80a-e08dd6b31933.png" 
                            alt="Clarity Logo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-white font-semibold text-lg">Clarity Analytics</span>
                      </div>
                    </div>
                  </div>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              {/* Portal root para tooltips */}
              <div id="portal-root" />
            </SidebarProvider>
          </BrowserRouter>
        </FilterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
