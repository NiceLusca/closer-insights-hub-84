
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, Construction } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de desenvolvimento */}
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl">
          <div className="flex items-center gap-4">
            <Construction className="w-8 h-8 text-orange-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-orange-200 mb-2">
                🚧 Seção em Desenvolvimento
              </h2>
              <p className="text-orange-100">
                Os recursos de relatórios estão sendo desenvolvidos e estarão disponíveis em breve. 
                Nossa equipe está trabalhando para trazer funcionalidades avançadas de exportação e relatórios personalizados.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-gray-300">Exporte dados e gere relatórios personalizados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 opacity-60">
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

          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 opacity-60">
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

          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 opacity-60">
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

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <span>Powered by</span>
            <span className="font-semibold text-cyan-400">Oceano Azul</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
