
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target } from "lucide-react";

interface WinnerBadgeProps {
  isWinner: boolean;
  type?: 'default' | 'performance' | 'target';
  className?: string;
}

export const WinnerBadge = React.memo(({ 
  isWinner, 
  type = 'default',
  className = '' 
}: WinnerBadgeProps) => {
  if (!isWinner) return null;

  const getIcon = () => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="w-3 h-3" />;
      case 'target':
        return <Target className="w-3 h-3" />;
      default:
        return <Trophy className="w-3 h-3" />;
    }
  };

  const getBadgeClass = () => {
    switch (type) {
      case 'performance':
        return 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30';
      case 'target':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30';
    }
  };

  return (
    <Badge 
      variant="outline"
      className={`${getBadgeClass()} ${className} animate-pulse`}
    >
      {getIcon()}
      <span className="ml-1 text-xs font-bold">MELHOR</span>
    </Badge>
  );
});

WinnerBadge.displayName = 'WinnerBadge';
