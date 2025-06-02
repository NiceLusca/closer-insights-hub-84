
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Target, DollarSign, Info, CheckCircle, CreditCard, RotateCcw, Zap, AlertTriangle } from "lucide-react";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import type { Lead } from "@/types/lead";

interface MetricsCardsProps {
  leads: Lead[];
}

export function MetricsCards({ leads }: MetricsCardsProps) {
  const metrics = calculateStandardizedMetrics(leads);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const metricsData = [
    {
      title: "Total de Leads",
      value: metrics.totalLeads.toLocaleString(),
      icon: Calendar,
      bgGradient: "from-blue-600/20 to-blue-800/20",
      iconColor: "text-blue-400",
      borderColor: "border-l-blue-500",
      tooltip: `📊 DEFINIÇÃO: Total de leads válidos no período (excluindo mentorados)\n\n🔢 VALOR: ${metrics.totalLeads} leads\n\n📋 COMPOSIÇÃO:\n• ✅ Fechados: ${metrics.fechados}\n• ⏳ A Ser Atendido: ${metrics.aSerAtendido}\n• 🕐 Atendido Não Fechou: ${metrics.atendidoNaoFechou}\n• ❌ Perdido/Inativo: ${metrics.perdidoInativo}`
    },
    {
      title: "Aproveitamento Geral",
      value: formatPercentage(metrics.aproveitamentoGeral),
      icon: Zap,
      bgGradient: "from-indigo-600/20 to-indigo-800/20",
      iconColor: "text-indigo-400",
      borderColor: "border-l-indigo-500",
      tooltip: `📊 DEFINIÇÃO: Percentual geral de conversão de todos os leads\n\n🧮 FÓRMULA: Fechados ÷ Total de Leads\n\n🔢 CÁLCULO: ${metrics.fechados} ÷ ${metrics.totalLeads} = ${formatPercentage(metrics.aproveitamentoGeral)}\n\n💡 SIGNIFICADO: Do total de leads recebidos, qual % efetivamente comprou`
    },
    {
      title: "Receita Total",
      value: formatCurrency(metrics.receitaTotal),
      icon: DollarSign,
      bgGradient: "from-green-600/20 to-green-800/20",
      iconColor: "text-green-400",
      borderColor: "border-l-green-500",
      tooltip: `📊 DEFINIÇÃO: Soma de todas as receitas geradas\n\n🔢 COMPOSIÇÃO:\n• 💰 Vendas Completas: ${formatCurrency(metrics.receitaCompleta)}\n• 🔄 Vendas Recorrentes: ${formatCurrency(metrics.receitaRecorrente)}\n• 🎯 TOTAL: ${formatCurrency(metrics.receitaTotal)}`
    },
    {
      title: "Taxa de Fechamento",
      value: formatPercentage(metrics.taxaFechamento),
      icon: Target,
      bgGradient: "from-orange-600/20 to-orange-800/20",
      iconColor: "text-orange-400",
      borderColor: "border-l-orange-500",
      tooltip: `📊 DEFINIÇÃO: Eficiência de conversão nas apresentações realizadas\n\n🧮 FÓRMULA: Fechados ÷ Apresentações\n\n🔢 CÁLCULO: ${metrics.fechados} ÷ ${metrics.apresentacoes} = ${formatPercentage(metrics.taxaFechamento)}\n\n📋 APRESENTAÇÕES:\n• ✅ Fechados: ${metrics.fechados}\n• 🕐 Atendidos Não Fecharam: ${metrics.atendidoNaoFechou}\n• 🎪 Total Apresentações: ${metrics.apresentacoes}`
    },
    {
      title: "Taxa de Comparecimento",
      value: formatPercentage(metrics.taxaComparecimento),
      icon: CheckCircle,
      bgGradient: "from-purple-600/20 to-purple-800/20",
      iconColor: "text-purple-400",
      borderColor: "border-l-purple-500",
      tooltip: `📊 DEFINIÇÃO: Percentual de leads que não desmarcaram/sumiram\n\n🧮 FÓRMULA: (Total - Perdidos/Inativos) ÷ Total\n\n🔢 CÁLCULO: (${metrics.totalLeads} - ${metrics.perdidoInativo}) ÷ ${metrics.totalLeads} = ${formatPercentage(metrics.taxaComparecimento)}\n\n📋 COMPARECERAM:\n• ✅ Fechados: ${metrics.fechados}\n• ⏳ A Ser Atendido: ${metrics.aSerAtendido}\n• 🕐 Atendidos Não Fecharam: ${metrics.atendidoNaoFechou}\n• 👥 Total Compareceram: ${metrics.compareceram}`
    },
    {
      title: "Vendas Completas",
      value: `${metrics.vendasCompletas} (${formatCurrency(metrics.receitaCompleta)})`,
      icon: CreditCard,
      bgGradient: "from-emerald-600/20 to-emerald-800/20",
      iconColor: "text-emerald-400",
      borderColor: "border-l-emerald-500",
      tooltip: `📊 DEFINIÇÃO: Vendas pagas à vista\n\n🔢 QUANTIDADE: ${metrics.vendasCompletas} vendas\n\n💰 RECEITA: ${formatCurrency(metrics.receitaCompleta)}\n\n💡 TIPO: Pagamento único/à vista`
    },
    {
      title: "Vendas Recorrentes",
      value: `${metrics.vendasRecorrentes} (${formatCurrency(metrics.receitaRecorrente)})`,
      icon: RotateCcw,
      bgGradient: "from-cyan-600/20 to-cyan-800/20",
      iconColor: "text-cyan-400",
      borderColor: "border-l-cyan-500",
      tooltip: `📊 DEFINIÇÃO: Vendas com pagamento mensal\n\n🔢 QUANTIDADE: ${metrics.vendasRecorrentes} vendas\n\n🔄 RECEITA MENSAL: ${formatCurrency(metrics.receitaRecorrente)}/mês\n\n💡 TIPO: Assinatura/pagamento recorrente`
    },
    {
      title: "Taxa de Desmarque",
      value: formatPercentage(metrics.taxaDesmarque),
      icon: AlertTriangle,
      bgGradient: "from-red-600/20 to-red-800/20",
      iconColor: "text-red-400",
      borderColor: "border-l-red-500",
      tooltip: `📊 DEFINIÇÃO: Percentual de leads perdidos/inativos\n\n🧮 FÓRMULA: Perdidos/Inativos ÷ Total de Leads\n\n🔢 CÁLCULO: ${metrics.perdidoInativo} ÷ ${metrics.totalLeads} = ${formatPercentage(metrics.taxaDesmarque)}\n\n📋 PERDIDOS/INATIVOS:\n• Desmarcaram\n• Não apareceram\n• Número errado\n• Total: ${metrics.perdidoInativo} leads\n\n⚖️ VALIDAÇÃO: Taxa Comparecimento (${formatPercentage(metrics.taxaComparecimento)}) + Taxa Desmarque (${formatPercentage(metrics.taxaDesmarque)}) = ${formatPercentage(metrics.taxaComparecimento + metrics.taxaDesmarque)} (deve ser ~100%)`
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={index} 
              className={`bg-gradient-to-br ${metric.bgGradient} backdrop-blur-sm ${metric.borderColor} border-l-4 border border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                    {metric.title}
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 hover:text-gray-300 cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm bg-gray-800 border-gray-700 text-gray-200 z-[9999]">
                      <pre className="text-xs whitespace-pre-wrap">{metric.tooltip}</pre>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Icon className={`h-7 w-7 ${metric.iconColor} group-hover:scale-110 transition-transform duration-200`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100 group-hover:text-white transition-colors">
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
