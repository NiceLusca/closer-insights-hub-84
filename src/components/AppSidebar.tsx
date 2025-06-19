
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

// Ícones 3D exatos do segundo print
const DashboardIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-6 h-6 relative">
      {/* Fundo principal com gradiente azul */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg" />
      {/* Grade de pontos 3x3 */}
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute top-1/2 transform -translate-y-1/2 left-1.5 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute top-1/2 transform -translate-y-1/2 right-1.5 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-90" />
      <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-white rounded-full opacity-90" />
      {/* Sombra 3D */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
    </div>
  </div>
);

const AnalyticsIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-6 h-6 relative">
      {/* Fundo verde */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg" />
      {/* Barras do gráfico */}
      <div className="absolute bottom-1.5 left-1.5 w-1 h-3 bg-white rounded-t opacity-90" />
      <div className="absolute bottom-1.5 left-3 w-1 h-4 bg-white rounded-t opacity-90" />
      <div className="absolute bottom-1.5 right-2 w-1 h-2 bg-white rounded-t opacity-90" />
      {/* Sombra 3D */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
    </div>
  </div>
);

const CompareIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-6 h-6 relative">
      {/* Fundo cyan */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-lg" />
      {/* Ícone de comparação (duas barras lado a lado) */}
      <div className="absolute top-1.5 left-1.5 bottom-1.5 w-1.5 bg-white rounded opacity-90" />
      <div className="absolute top-2 right-1.5 bottom-1.5 w-1.5 bg-white rounded opacity-90" />
      {/* Linha conectora */}
      <div className="absolute top-1/2 left-3.5 right-3.5 h-0.5 bg-white opacity-70" />
      {/* Sombra 3D */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
    </div>
  </div>
);

const LeadsIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-6 h-6 relative">
      {/* Fundo laranja */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg" />
      {/* Ícone de pessoa */}
      <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full opacity-90" />
      <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white rounded-t-full opacity-90" />
      {/* Sombra 3D */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
    </div>
  </div>
);

const ReportsIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-6 h-6 relative">
      {/* Fundo roxo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg" />
      {/* Linhas do documento */}
      <div className="absolute top-1.5 left-1.5 right-1.5 h-0.5 bg-white rounded opacity-90" />
      <div className="absolute top-2.5 left-1.5 right-2 h-0.5 bg-white rounded opacity-90" />
      <div className="absolute top-3.5 left-1.5 right-1.5 h-0.5 bg-white rounded opacity-90" />
      <div className="absolute bottom-1.5 left-1.5 right-3 h-0.5 bg-white rounded opacity-90" />
      {/* Sombra 3D */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
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
    <Sidebar className="bg-gradient-to-b from-gray-900/95 to-slate-900/95 backdrop-blur-xl border-r-0">
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
