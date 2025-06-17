import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

// Componentes de ícones 3D customizados mais sutis
const DashboardIcon3D = ({
  className
}: {
  className?: string;
}) => <div className={`relative ${className}`} style={{
  width: '24px',
  height: '24px'
}}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md transform rotate-3">
      <div className="absolute inset-1 bg-gray-800 rounded-md">
        <div className="grid grid-cols-2 gap-0.5 p-1">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-sm h-2"></div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm h-2"></div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-sm h-1"></div>
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-sm h-1"></div>
        </div>
      </div>
    </div>
  </div>;
const AnalyticsIcon3D = ({
  className
}: {
  className?: string;
}) => <div className={`relative ${className}`} style={{
  width: '24px',
  height: '24px'
}}>
    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md transform -rotate-2">
      <div className="absolute inset-1 bg-gray-800 rounded-md p-1">
        <div className="flex items-end justify-between h-full gap-0.5">
          <div className="bg-gradient-to-t from-green-400 to-green-300 rounded-sm w-1 h-2/3"></div>
          <div className="bg-gradient-to-t from-green-500 to-green-400 rounded-sm w-1 h-full"></div>
          <div className="bg-gradient-to-t from-green-400 to-green-300 rounded-sm w-1 h-3/4"></div>
          <div className="bg-gradient-to-t from-green-300 to-green-200 rounded-sm w-1 h-1/2"></div>
        </div>
      </div>
    </div>
  </div>;
const LeadsIcon3D = ({
  className
}: {
  className?: string;
}) => <div className={`relative ${className}`} style={{
  width: '24px',
  height: '24px'
}}>
    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md transform rotate-2">
      <div className="absolute inset-1 bg-gray-800 rounded-md p-1">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex gap-0.5 mb-0.5">
            <div className="w-1.5 h-1.5 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
          </div>
          <div className="w-3 h-0.5 bg-gradient-to-r from-orange-300 to-orange-400 rounded-full"></div>
          <div className="w-2 h-0.5 bg-gradient-to-r from-orange-400 to-orange-300 rounded-full mt-0.5"></div>
        </div>
      </div>
    </div>
  </div>;
const ReportsIcon3D = ({
  className
}: {
  className?: string;
}) => <div className={`relative ${className}`} style={{
  width: '24px',
  height: '24px'
}}>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-md transform -rotate-1">
      <div className="absolute inset-1 bg-gray-800 rounded-md p-1">
        <div className="space-y-0.5">
          <div className="w-full h-0.5 bg-gradient-to-r from-purple-300 to-purple-400 rounded-full"></div>
          <div className="w-3/4 h-0.5 bg-gradient-to-r from-purple-400 to-purple-300 rounded-full"></div>
          <div className="flex gap-0.5">
            <div className="flex-1 h-1 bg-gradient-to-t from-purple-400 to-purple-300 rounded-sm"></div>
            <div className="flex-1 h-1.5 bg-gradient-to-t from-purple-500 to-purple-400 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  </div>;
const menuItems = [{
  title: "Dashboard",
  url: "/",
  icon: DashboardIcon3D
}, {
  title: "Análises",
  url: "/analytics",
  icon: AnalyticsIcon3D
}, {
  title: "Leads",
  url: "/leads",
  icon: LeadsIcon3D
}, {
  title: "Relatórios",
  url: "/reports",
  icon: ReportsIcon3D
}];
export function AppSidebar() {
  const location = useLocation();
  return <Sidebar className="border-r border-gray-700/50 bg-gradient-to-b from-gray-900/95 to-slate-900/95 backdrop-blur-xl">
      <SidebarHeader className="p-6 border-b border-gray-700/30">
        <div className="flex items-center gap-4">
          <img alt="Clarity Logo" src="/lovable-uploads/b6f94494-36d6-4699-8ee0-1523e42505b3.png" style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) brightness(1.1) contrast(1.1)',
          background: 'none',
          backgroundColor: 'transparent'
        }} onError={e => {
          console.log('Erro ao carregar logo principal, usando fallback...');
          (e.target as HTMLImageElement).src = "/lovable-uploads/a9770866-2518-466e-9d50-c2e740a4a14a.png";
        }} className="w-16 h-16 flex-shrink-0 object-cover" />
          <div className="flex-1 min-w-0 overflow-hidden">
            <h2 className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide leading-tight text-4xl my-0 mx-0 px-0 py-0 font-bold">
              Clarity
            </h2>
            <p className="text-gray-400 mt-1 leading-tight my-[6px] text-sm font-semibold text-left px-0 py-[3px] whitespace-nowrap">
              Analytics Dashboard
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 bg-gradient-to-b from-transparent to-gray-900/20">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} className={`text-base font-medium py-4 px-4 mb-2 rounded-xl transition-all duration-300 hover:bg-gray-700/50 hover:transform hover:scale-105 group ${location.pathname === item.url ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30'}`}>
                    <Link to={item.url} className="flex items-center gap-4">
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        <item.icon className="drop-shadow-lg" />
                      </div>
                      <span className="ml-1 group-hover:text-white transition-colors">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-gray-700/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Powered by</p>
          <p className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Oceano Azul
          </p>
          <p className="text-sm text-gray-400 mt-1 font-medium">Analytics & Insights Platform</p>
        </div>
      </SidebarFooter>
    </Sidebar>;
}
