
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface TrendComparisonProps {
  comparisonData: any;
  comparisonType: string;
}

export const TrendComparison = React.memo(({ comparisonData }: TrendComparisonProps) => {
  if (!comparisonData) {
    return null;
  }

  // Placeholder data - in a real implementation, you'd generate trend data
  const trendData = [
    { name: 'Sem 1', dataset1: 20, dataset2: 15 },
    { name: 'Sem 2', dataset1: 25, dataset2: 22 },
    { name: 'Sem 3', dataset1: 30, dataset2: 18 },
    { name: 'Sem 4', dataset1: 28, dataset2: 25 }
  ];

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Análise de Tendências
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="dataset1" 
              stroke="#60a5fa" 
              name={comparisonData.dataset1.label}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="dataset2" 
              stroke="#a78bfa" 
              name={comparisonData.dataset2.label}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

TrendComparison.displayName = 'TrendComparison';
