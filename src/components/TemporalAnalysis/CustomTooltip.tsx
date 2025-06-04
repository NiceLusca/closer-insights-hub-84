
import React from "react";
import { TooltipPortal } from "@/components/ui/TooltipPortal";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  coordinate?: { x: number; y: number };
}

export const CustomTooltip = React.memo(({ active, payload, label, coordinate }: TooltipProps) => {
  if (!active || !payload || !payload.length || !coordinate) {
    return null;
  }

  return (
    <TooltipPortal>
      <div 
        className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none"
        style={{ 
          position: 'absolute',
          left: coordinate.x + 10,
          top: coordinate.y - 10,
          transform: 'none',
          zIndex: 999999
        }}
      >
        <p className="text-gray-200 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.name.includes('Taxa') || entry.name.includes('Conversão') ? '%' : ''}
          </p>
        ))}
      </div>
    </TooltipPortal>
  );
});

CustomTooltip.displayName = 'CustomTooltip';
