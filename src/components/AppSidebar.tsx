
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

// Ícones com mais personalidade usando múltiplos elementos
const DashboardIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-5 h-5 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-80" />
      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-sm opacity-90" />
      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-sm opacity-70" />
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-white rounded-sm opacity-70" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white rounded-sm opacity-90" />
    </div>
  </div>
);

const AnalyticsIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-5 h-5 relative">
      <div className="absolute bottom-0 left-0 w-1 h-4 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t" />
      <div className="absolute bottom-0 left-2 w-1 h-3 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t" />
      <div className="absolute bottom-0 left-4 w-1 h-5 bg-gradient-to-t from-purple-500 to-violet-400 rounded-t" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg" />
    </div>
  </div>
);

const CompareIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-5 h-5 relative">
      <div className="absolute left-0 top-1 w-2 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded transform -rotate-12 shadow-md" />
      <div className="absolute right-0 top-1 w-2 h-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded transform rotate-12 shadow-md" />
      <div className="absolute inset-x-2 top-2.5 h-0.5 bg-gradient-to-r from-cyan-300 to-purple-300 rounded-full" />
    </div>
  </div>
);

const LeadsIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-5 h-5 relative">
      <div className="absolute top-0 left-1 w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full" />
      <div className="absolute bottom-1 left-0 w-2 h-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-80" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-70" />
      <div className="absolute top-1 right-1 w-1 h-1 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full" />
    </div>
  </div>
);

const ReportsIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-5 h-5 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-gray-500 rounded-sm shadow-md" />
      <div className="absolute top-1 left-1 right-1 h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full" />
      <div className="absolute top-2.5 left-1 right-2 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full" />
      <div className="absolute bottom-1 left-1 right-3 h-0.5 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full" />
    </div>
  </div>
);

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: DashboardIcon
  },
  {
    title: "Análises",
    url: "/analytics",
    icon: AnalyticsIcon
  },
  {
    title: "Comparativo",
    url: "/comparativo",
    icon: CompareIcon
  },
  {
    title: "Leads",
    url: "/leads",
    icon: LeadsIcon
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: ReportsIcon
  }
];

export function AppSidebar() {
  const location = useLocation();
  
  return (
    <Sidebar className="bg-gradient-to-b from-gray-900/95 to-slate-900/95 backdrop-blur-xl w-56">
      <SidebarHeader className="p-6 border-b border-gray-700/30">
        <div className="flex items-center gap-3">
          <img 
            alt="Clarity Logo" 
            src="/lovable-uploads/b6f94494-36d6-4699-8ee0-1523e42505b3.png" 
            className="w-12 h-12 flex-shrink-0 object-contain"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) brightness(1.1) contrast(1.1)',
            }} 
            onError={e => {
              console.log('Erro ao carregar logo principal, usando fallback...');
              (e.target as HTMLImageElement).src = "/lovable-uploads/a9770866-2518-466e-9d50-c2e740a4a14a.png";
            }} 
          />
          <div className="flex-1 min-w-0">
            <h2 className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide text-2xl font-bold leading-tight">
              Clarity
            </h2>
            <p className="text-gray-400 text-xs font-medium">
              Analytics Dashboard
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url} 
                    className={`text-sm font-medium py-3 px-4 mb-2 rounded-lg transition-all duration-300 hover:bg-gray-700/50 group ${
                      location.pathname === item.url 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                        : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="transition-transform duration-300 group-hover:scale-110" />
                      <span className="group-hover:text-white transition-colors">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-700/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Powered by</p>
          <p className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Oceano Azul
          </p>
          <p className="text-xs text-gray-400 mt-1 font-normal">
            Analytics Platform
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
