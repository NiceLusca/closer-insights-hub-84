
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ComparisonType = 'period' | 'origem';

interface ComparisonTypeSelectorProps {
  selectedType: ComparisonType;
  onTypeChange: (type: ComparisonType) => void;
}

export const ComparisonTypeSelector = ({ selectedType, onTypeChange }: ComparisonTypeSelectorProps) => {
  const types = [
    { 
      key: 'period' as ComparisonType, 
      label: 'Períodos',
      description: 'Compare diferentes períodos de tempo'
    },
    { 
      key: 'origem' as ComparisonType, 
      label: 'Origens',
      description: 'Compare diferentes fontes/campanhas'
    }
  ];

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100">
          Tipo de Comparação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map(type => (
            <Button
              key={type.key}
              variant={selectedType === type.key ? "default" : "outline"}
              onClick={() => onTypeChange(type.key)}
              className={`p-4 h-auto flex flex-col items-start text-left transition-all duration-300 rounded-lg ${
                selectedType === type.key 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                  : 'border-gray-600 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30 hover:border-gray-500'
              }`}
            >
              <span className="font-semibold text-base mb-1">{type.label}</span>
              <span className="text-sm text-gray-400">{type.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
