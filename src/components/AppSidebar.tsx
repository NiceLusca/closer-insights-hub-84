
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
  return <Sidebar>
      <SidebarHeader className="p-6 border-b border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center p-2">
            <img alt="Clarity Logo" onError={e => {
            console.log('Erro ao carregar logo principal, tentando fallback...');
            (e.target as HTMLImageElement).src = "/lovable-uploads/82cceff9-b8f2-4ee8-a80a-e08dd6b31933.png";
          }} src="/lovable-uploads/a9770866-2518-466e-9d50-c2e740a4a14a.png" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
              Clarity
            </h2>
            <p className="text-sm text-gray-400 font-medium">Analytics Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} className="text-base font-medium py-4 px-4 mb-2 rounded-xl transition-all duration-300 hover:bg-gray-700/50 hover:transform hover:scale-105 group">
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

      <SidebarFooter className="p-4 border-t border-gray-700/30">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Powered by</p>
          <p className="text-sm font-semibold text-cyan-400">Oceano Azul</p>
          <p className="text-xs text-gray-500 mt-1">Analytics & Insights Platform</p>
        </div>
      </SidebarFooter>
    </Sidebar>;
}
