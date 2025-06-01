
import React from "react";

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

interface CloserRankingProps {
  closerData: CloserMetrics[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value);
};

export const CloserRanking = React.memo(({ closerData }: CloserRankingProps) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-200 mb-4">Ranking Completo</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {closerData.map((closer) => (
          <div 
            key={closer.closer} 
            className={`p-3 rounded-lg border ${
              closer.rank === 1 
                ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' 
                : closer.rank <= 3 
                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30'
                : 'bg-gray-700/50 border-gray-600/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  closer.rank === 1 ? 'bg-yellow-500 text-black' :
                  closer.rank <= 3 ? 'bg-green-500 text-white' :
                  'bg-gray-600 text-gray-200'
                }`}>
                  #{closer.rank}
                </span>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-32">
                    {closer.closer}
                  </p>
                  <p className="text-xs text-gray-400">
                    {closer.totalLeads} leads • {closer.fechamentos} vendas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {closer.aproveitamento.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(closer.receita)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CloserRanking.displayName = 'CloserRanking';
