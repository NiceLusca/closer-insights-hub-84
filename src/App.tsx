
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { FilterProvider } from "@/contexts/FilterContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar";

import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import Comparativo from "@/pages/Comparativo";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FilterProvider>
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <AppSidebar />
                <SidebarInset className="flex-1 bg-gradient-to-br from-slate-900/50 to-purple-900/50 backdrop-blur-sm ml-4">
                  <div className="p-6">
                    <SidebarTrigger className="mb-6 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:text-white transition-all duration-200" />
                  </div>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/comparativo" element={<Comparativo />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </FilterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
