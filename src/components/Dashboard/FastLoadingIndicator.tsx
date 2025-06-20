
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Database, Wifi, WifiOff } from "lucide-react";

interface FastLoadingIndicatorProps {
  cacheStatus: {
    source: 'cache' | 'webhook' | 'none';
    ageMinutes: number;
    isValid: boolean;
  };
  lastUpdated: Date | null;
  isUpdatingInBackground?: boolean;
}

export const FastLoadingIndicator = ({ 
  cacheStatus, 
  lastUpdated, 
  isUpdatingInBackground = false 
}: FastLoadingIndicatorProps) => {
  const getStatusColor = () => {
    if (isUpdatingInBackground) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (cacheStatus.source === 'webhook') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (cacheStatus.isValid) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getStatusText = () => {
    if (isUpdatingInBackground) return 'Atualizando...';
    if (cacheStatus.source === 'webhook') return 'Dados Frescos';
    if (cacheStatus.isValid) return 'Cache Válido';
    return 'Cache Expirado';
  };

  const getStatusIcon = () => {
    if (isUpdatingInBackground) return <Wifi className="w-4 h-4 animate-pulse" />;
    if (cacheStatus.source === 'webhook') return <Wifi className="w-4 h-4" />;
    if (cacheStatus.isValid) return <Database className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const formatLastUpdate = () => {
    if (!lastUpdated) return 'Nunca';
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  return (
    <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/30 rounded-lg">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor()} gap-1 text-xs`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            
            {cacheStatus.source === 'cache' && cacheStatus.ageMinutes > 0 && (
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                {Math.floor(cacheStatus.ageMinutes)}min
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastUpdate()}</span>
          </div>
        </div>
        
        {isUpdatingInBackground && (
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
            <div className="bg-blue-400 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
