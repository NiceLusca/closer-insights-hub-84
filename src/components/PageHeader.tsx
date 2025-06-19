
import React from 'react';

// Ícones 3D com cores distintas para headers das páginas
const DashboardIcon3D = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`} style={{ width: '32px', height: '32px' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg transform rotate-3">
      <div className="absolute inset-1 bg-gray-800 rounded-lg">
        <div className="grid grid-cols-2 gap-0.5 p-1.5">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-sm h-2.5"></div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm h-2.5"></div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-sm h-1.5"></div>
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-sm h-1.5"></div>
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsIcon3D = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`} style={{ width: '32px', height: '32px' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg transform -rotate-2">
      <div className="absolute inset-1 bg-gray-800 rounded-lg p-1.5">
        <div className="flex items-end justify-between h-full gap-0.5">
          <div className="bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-sm w-1.5 h-2/3"></div>
          <div className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm w-1.5 h-full"></div>
          <div className="bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-sm w-1.5 h-3/4"></div>
          <div className="bg-gradient-to-t from-emerald-300 to-emerald-200 rounded-sm w-1.5 h-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

const ComparativoIcon3D = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`} style={{ width: '32px', height: '32px' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl shadow-lg transform rotate-1">
      <div className="absolute inset-1 bg-gray-800 rounded-lg p-1.5">
        <div className="flex items-center justify-center h-full gap-0.5">
          <div className="flex flex-col gap-0.5">
            <div className="w-1.5 h-2.5 bg-gradient-to-t from-pink-400 to-pink-300 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-t from-pink-300 to-pink-200 rounded-sm"></div>
          </div>
          <div className="w-0.5 h-2 bg-gradient-to-t from-pink-500 to-pink-400 rounded-full"></div>
          <div className="flex flex-col gap-0.5">
            <div className="w-1.5 h-2 bg-gradient-to-t from-pink-300 to-pink-200 rounded-sm"></div>
            <div className="w-1.5 h-2 bg-gradient-to-t from-pink-400 to-pink-300 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LeadsIcon3D = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`} style={{ width: '32px', height: '32px' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg transform rotate-2">
      <div className="absolute inset-1 bg-gray-800 rounded-lg p-1.5">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex gap-0.5 mb-1">
            <div className="w-2 h-2 bg-gradient-to-br from-amber-300 to-amber-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full"></div>
          </div>
          <div className="w-4 h-0.5 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full"></div>
          <div className="w-3 h-0.5 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full mt-0.5"></div>
        </div>
      </div>
    </div>
  </div>
);

const ReportsIcon3D = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`} style={{ width: '32px', height: '32px' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl shadow-lg transform -rotate-1">
      <div className="absolute inset-1 bg-gray-800 rounded-lg p-1.5">
        <div className="space-y-0.5">
          <div className="w-full h-0.5 bg-gradient-to-r from-violet-300 to-violet-400 rounded-full"></div>
          <div className="w-4/5 h-0.5 bg-gradient-to-r from-violet-400 to-violet-300 rounded-full"></div>
          <div className="flex gap-0.5">
            <div className="flex-1 h-1.5 bg-gradient-to-t from-violet-400 to-violet-300 rounded-sm"></div>
            <div className="flex-1 h-2 bg-gradient-to-t from-violet-500 to-violet-400 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const iconMap = {
  dashboard: DashboardIcon3D,
  analytics: AnalyticsIcon3D,
  comparativo: ComparativoIcon3D,
  leads: LeadsIcon3D,
  reports: ReportsIcon3D,
};

interface PageHeaderProps {
  title: string;
  description: string;
  iconType: keyof typeof iconMap;
  className?: string;
}

export function PageHeader({ title, description, iconType, className = '' }: PageHeaderProps) {
  const IconComponent = iconMap[iconType];
  
  return (
    <div className={`mb-8 animate-fade-in-up ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <IconComponent className="flex-shrink-0 hover:scale-110 transition-transform duration-300" />
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-gray-300 text-lg mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
