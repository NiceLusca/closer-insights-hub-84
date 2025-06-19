
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";
import type { ComparisonInsight } from "@/utils/comparisonUtils";

interface InsightsPanelProps {
  insights: ComparisonInsight[];
}

export const InsightsPanel = React.memo(({ insights }: InsightsPanelProps) => {
  if (!insights || insights.length === 0) {
    return (
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights da Comparação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Nenhum insight significativo encontrado para esta comparação.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-l-green-400';
      case 'negative':
        return 'border-l-red-400';
      default:
        return 'border-l-yellow-400';
    }
  };

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Insights da Comparação
        </CardTitle>
        <p className="text-sm text-gray-400">
          Principais diferenças encontradas na análise comparativa
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 bg-gray-700/30 rounded-lg border-l-4 ${getInsightBorderColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-100 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">
                      {insight.metric}
                    </span>
                    <span className={`text-xs font-medium ${
                      insight.type === 'positive' ? 'text-green-400' : 
                      insight.type === 'negative' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {insight.value > 0 ? '+' : ''}{insight.value.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

InsightsPanel.displayName = 'InsightsPanel';
