
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Análises Detalhadas</h1>
          <p className="text-gray-300">ROI, tendências e insights avançados</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-100">
                ROI por Origem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Em desenvolvimento...
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-100">
                Análise Temporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Em desenvolvimento...
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-100">
                Heatmap de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
