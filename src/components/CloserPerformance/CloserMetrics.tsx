
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Users } from "lucide-react";

interface CloserMetrics {
  closer: string;
  totalLeads: number;
  agendamentos: number;
  apresentacoes: number;
  fechamentos: number;
  receita: number;
  taxaAgendamento: number;
  taxaFechamento: number;
  aproveitamento: number;
  receitaMedia: number;
  rank: number;
}

interface CloserMetricsCardsProps {
  topPerformer: CloserMetrics | undefined;
  avgAproveitamento: number;
  totalClosers: number;
  totalReceita: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value);
};

export const CloserMetricsCards = React.memo(({ 
  topPerformer, 
  avgAproveitamento, 
  totalClosers, 
  totalReceita 
}: CloserMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-medium">TOP PERFORMER</span>
        </div>
        {topPerformer && (
          <>
            <p className="text-sm font-bold text-white truncate">{topPerformer.closer}</p>
            <p className="text-lg font-bold text-yellow-400">{topPerformer.aproveitamento.toFixed(1)}%</p>
            <p className="text-xs text-gray-300">{topPerformer.fechamentos} vendas</p>
          </>
        )}
      </div>

      <Card className="bg-gray-700/50 border border-gray-600/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">MÉDIA GERAL</span>
          </div>
          <p className="text-lg font-bold text-blue-400">{avgAproveitamento.toFixed(1)}%</p>
          <p className="text-xs text-gray-300">aproveitamento</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-700/50 border border-gray-600/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">CLOSERS ATIVOS</span>
          </div>
          <p className="text-lg font-bold text-green-400">{totalClosers}</p>
          <p className="text-xs text-gray-300">com leads ativos</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-700/50 border border-gray-600/50">
        <CardContent className="p-4">
          <span className="text-xs text-gray-400">RECEITA TOTAL</span>
          <p className="text-lg font-bold text-purple-400">
            {formatCurrency(totalReceita)}
          </p>
          <p className="text-xs text-gray-300">todos os closers</p>
        </CardContent>
      </Card>
    </div>
  );
});

CloserMetricsCards.displayName = 'CloserMetricsCards';
