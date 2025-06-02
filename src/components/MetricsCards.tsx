
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
      tooltip: `Total de leads válidos no período (excluindo mentorados): ${metrics.totalLeads}`
    },
    {
      title: "Aproveitamento Geral",
      value: formatPercentage(metrics.aproveitamentoGeral),
      icon: Zap,
      bgGradient: "from-indigo-600/20 to-indigo-800/20",
      iconColor: "text-indigo-400",
      borderColor: "border-l-indigo-500",
      tooltip: `Percentual de conversão geral: ${metrics.fechados} fechados de ${metrics.totalLeads} leads (${formatPercentage(metrics.aproveitamentoGeral)})`
    },
    {
      title: "Receita Total",
      value: formatCurrency(metrics.receitaTotal),
      icon: DollarSign,
      bgGradient: "from-green-600/20 to-green-800/20",
      iconColor: "text-green-400",
      borderColor: "border-l-green-500",
      tooltip: `Receita total gerada: ${formatCurrency(metrics.receitaCompleta)} (completas) + ${formatCurrency(metrics.receitaRecorrente)} (recorrentes)`
    },
    {
      title: "Taxa de Fechamento",
      value: formatPercentage(metrics.taxaFechamento),
      icon: Target,
      bgGradient: "from-orange-600/20 to-orange-800/20",
      iconColor: "text-orange-400",
      borderColor: "border-l-orange-500",
      tooltip: `Taxa de conversão nas apresentações: ${metrics.fechados} fechados de ${metrics.apresentacoes} apresentações`
    },
    {
      title: "Taxa de Comparecimento",
      value: formatPercentage(metrics.taxaComparecimento),
      icon: CheckCircle,
      bgGradient: "from-purple-600/20 to-purple-800/20",
      iconColor: "text-purple-400",
      borderColor: "border-l-purple-500",
      tooltip: `Leads que não desmarcaram: ${metrics.compareceram} de ${metrics.totalLeads} leads`
    },
    {
      title: "Vendas Completas",
      value: `${metrics.vendasCompletas}`,
      icon: CreditCard,
      bgGradient: "from-emerald-600/20 to-emerald-800/20",
      iconColor: "text-emerald-400",
      borderColor: "border-l-emerald-500",
      tooltip: `Vendas pagas à vista: ${metrics.vendasCompletas} vendas - ${formatCurrency(metrics.receitaCompleta)}`
    },
    {
      title: "Vendas Recorrentes",
      value: `${metrics.vendasRecorrentes}`,
      icon: RotateCcw,
      bgGradient: "from-cyan-600/20 to-cyan-800/20",
      iconColor: "text-cyan-400",
      borderColor: "border-l-cyan-500",
      tooltip: `Vendas com pagamento mensal: ${metrics.vendasRecorrentes} vendas - ${formatCurrency(metrics.receitaRecorrente)}/mês`
    },
    {
      title: "Taxa de Desmarque",
      value: formatPercentage(metrics.taxaDesmarque),
      icon: AlertTriangle,
      bgGradient: "from-red-600/20 to-red-800/20",
      iconColor: "text-red-400",
      borderColor: "border-l-red-500",
      tooltip: `Leads perdidos ou inativos: ${metrics.perdidoInativo} de ${metrics.totalLeads} leads (${formatPercentage(metrics.taxaDesmarque)})`
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
                    <TooltipContent side="top" className="max-w-sm">
                      <p className="text-xs">{metric.tooltip}</p>
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
