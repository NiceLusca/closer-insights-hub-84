
import React from "react";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = React.memo(({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl z-[15000] relative">
        <p className="text-gray-200 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.name.includes('Taxa') || entry.name.includes('Conversão') ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';
