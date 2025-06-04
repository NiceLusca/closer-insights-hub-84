
import React from "react";

interface LossOverviewCardsProps {
  funnelLosses: Array<{
    etapa: string;
    quantidade: number;
    percentualDoTotal: number;
  }>;
  totalPerdaFinanceira: number;
  totalLeads: number;
}

export const LossOverviewCards = React.memo(({ funnelLosses, totalPerdaFinanceira, totalLeads }: LossOverviewCardsProps) => {
  const totalPerdas = funnelLosses.reduce((acc, item) => acc + item.quantidade, 0);
  const naoCompareceram = funnelLosses.find(item => item.etapa === "Não Compareceram");
  const posAtendimento = funnelLosses.find(item => item.etapa === "Compareceram mas Não Fecharam");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-4 rounded-lg border border-red-500/30">
        <div className="text-center">
          <p className="text-red-300 text-xs font-semibold uppercase tracking-wide">Total de Perdas</p>
          <p className="text-2xl font-bold text-red-200">{totalPerdas}</p>
          <p className="text-red-400 text-sm">
            {totalLeads > 0 ? ((totalPerdas / totalLeads) * 100).toFixed(1) : 0}% do total
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-4 rounded-lg border border-amber-500/30">
        <div className="text-center">
          <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide">Não Compareceram</p>
          <p className="text-2xl font-bold text-amber-200">{naoCompareceram?.quantidade || 0}</p>
          <p className="text-amber-400 text-sm">{(naoCompareceram?.percentualDoTotal || 0).toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-4 rounded-lg border border-orange-500/30">
        <div className="text-center">
          <p className="text-orange-300 text-xs font-semibold uppercase tracking-wide">Perdas Pós-Atendimento</p>
          <p className="text-2xl font-bold text-orange-200">{posAtendimento?.quantidade || 0}</p>
          <p className="text-orange-400 text-sm">{(posAtendimento?.percentualDoTotal || 0).toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-lg border border-purple-500/30">
        <div className="text-center">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Impacto Financeiro</p>
          <p className="text-2xl font-bold text-purple-200">R$ {(totalPerdaFinanceira / 1000).toFixed(0)}k</p>
          <p className="text-purple-400 text-sm">Potencial perdido</p>
        </div>
      </div>
    </div>
  );
});

LossOverviewCards.displayName = 'LossOverviewCards';
