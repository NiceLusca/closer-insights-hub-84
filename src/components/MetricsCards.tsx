
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Calendar, Clock, Target, DollarSign, Info, CheckCircle, CreditCard, RotateCcw, Users, Zap, AlertTriangle } from "lucide-react";
import { calculateMetrics } from "@/utils/metricsCalculations";
import type { Lead } from "@/types/lead";

interface MetricsCardsProps {
  leads: Lead[];
}

export function MetricsCards({ leads }: MetricsCardsProps) {
  const metrics = calculateMetrics(leads);

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
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      tooltip: "Número total de leads recebidos no período selecionado"
    },
    {
      title: "Aproveitamento Geral",
      value: formatPercentage(metrics.aproveitamentoGeral),
      icon: Zap,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200",
      tooltip: "Percentual de fechamentos em relação ao total de leads aproveitáveis (excluindo mentorados)"
    },
    {
      title: "Receita Total",
      value: formatCurrency(metrics.receitaTotal),
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      tooltip: "Soma de todas as vendas realizadas (vendas completas + recorrentes)"
    },
    {
      title: "Taxa de Fechamento",
      value: formatPercentage(metrics.taxaFechamento),
      icon: Target,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      tooltip: "Percentual de fechamentos em relação ao total de apresentações realizadas"
    },
    {
      title: "Taxa de Comparecimento",
      value: formatPercentage(metrics.taxaComparecimento),
      icon: CheckCircle,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      tooltip: "Percentual de leads que compareceram vs agendados + no-shows"
    },
    {
      title: "Vendas Completas",
      value: `${metrics.vendasCompletas} (${formatCurrency(metrics.receitaCompleta)})`,
      icon: CreditCard,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      tooltip: "Número de vendas à vista com valores únicos"
    },
    {
      title: "Vendas Recorrentes",
      value: `${metrics.vendasRecorrentes} (${formatCurrency(metrics.receitaRecorrente)})`,
      icon: RotateCcw,
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      borderColor: "border-cyan-200",
      tooltip: "Número de vendas recorrentes mensais"
    },
    {
      title: "No-Shows",
      value: `${metrics.noShows} (${formatPercentage(metrics.taxaDesmarque)})`,
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
      tooltip: "Leads que não compareceram à apresentação agendada e taxa de desmarque"
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border-l-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {metric.title}
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>{metric.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Icon className={`h-6 w-6 ${metric.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
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
