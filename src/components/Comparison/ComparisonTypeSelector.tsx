
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp } from "lucide-react";

interface ComparisonTypeSelectorProps {
  comparisonType: 'temporal' | 'closer' | 'origem';
  onTypeChange: (type: 'temporal' | 'closer' | 'origem') => void;
}

export const ComparisonTypeSelector = React.memo(({ 
  comparisonType, 
  onTypeChange 
}: ComparisonTypeSelectorProps) => {
  const types = [
    {
      id: 'temporal' as const,
      label: 'Temporal',
      description: 'Compare períodos',
      icon: Calendar
    },
    {
      id: 'closer' as const,
      label: 'Closers',
      description: 'Compare vendedores',
      icon: Users
    },
    {
      id: 'origem' as const,
      label: 'Origens',
      description: 'Compare fontes',
      icon: TrendingUp
    }
  ];

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Tipo de Comparação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {types.map((type) => (
            <Button
              key={type.id}
              variant={comparisonType === type.id ? "default" : "outline"}
              className={`w-full justify-start gap-3 ${
                comparisonType === type.id
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
              }`}
              onClick={() => onTypeChange(type.id)}
            >
              <type.icon className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">{type.label}</div>
                <div className="text-xs opacity-70">{type.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

ComparisonTypeSelector.displayName = 'ComparisonTypeSelector';
