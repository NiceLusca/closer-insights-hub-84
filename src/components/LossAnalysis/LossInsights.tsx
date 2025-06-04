
import React from "react";

interface BehaviorData {
  tipo: string;
  quantidade: number;
  percentual: number;
  impactoFinanceiro: number;
  cor: string;
}

interface LossInsightsProps {
  behaviorAnalysis: BehaviorData[];
}

export const LossInsights = React.memo(({ behaviorAnalysis }: LossInsightsProps) => {
  const aguardandoResposta = behaviorAnalysis.find(item => item.tipo === "Aguardando Resposta");
  const maiorFontePerda = behaviorAnalysis.length > 0 
    ? behaviorAnalysis.sort((a, b) => b.quantidade - a.quantidade)[0].tipo
    : 'N/A';

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
      <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
        <span className="text-xl">💡</span>
        Insights e Oportunidades
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-amber-400">Oportunidade de Recuperação:</span>
          </p>
          <p className="text-gray-400">
            {aguardandoResposta?.quantidade || 0} leads ainda podem ser recuperados com follow-up ativo.
          </p>
        </div>
        <div>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-red-400">Maior Fonte de Perda:</span>
          </p>
          <p className="text-gray-400">
            {maiorFontePerda} representa a maior fonte de perdas.
          </p>
        </div>
      </div>
    </div>
  );
});

LossInsights.displayName = 'LossInsights';
