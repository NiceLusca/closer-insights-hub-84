
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, BarChart3, GitCompare, Users, FileText } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
  },
  {
    title: "Análises",
    url: "/analytics",
    icon: BarChart3
  },
  {
    title: "Comparativo",
    url: "/comparativo",
    icon: GitCompare
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileText
  }
];

export function AppSidebar() {
  const location = useLocation();
  
  return (
    <Sidebar className="border-r border-gray-700/50 bg-gradient-to-b from-gray-900/95 to-slate-900/95 backdrop-blur-xl w-56">
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
                      <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
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
