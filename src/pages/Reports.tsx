
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-gray-300">Exporte dados e gere relatórios personalizados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatório Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Resumo executivo com principais KPIs e insights
              </p>
              <Button className="w-full" disabled>
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dados Detalhados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Exportação completa dos dados de leads
              </p>
              <Button className="w-full" disabled>
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Relatórios Agendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Configure envios automáticos de relatórios
              </p>
              <Button className="w-full" disabled>
                Configurar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
