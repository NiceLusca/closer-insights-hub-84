
import React from 'react';
import { TrendingUp, BarChart3, Users, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: TrendingUp,
  },
  {
    title: "Análises",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <img 
              src="/lovable-uploads/3af8527b-14da-4159-8e82-90dfa8063c10.png" 
              alt="Clarity Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Clarity
            </h2>
            <p className="text-xs text-gray-400 font-medium">Analytics Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-gray-300 mb-3">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-base font-medium py-3 px-4 mb-1 rounded-lg transition-all duration-200 hover:bg-gray-700/50"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
    </Sidebar>
  );
}
