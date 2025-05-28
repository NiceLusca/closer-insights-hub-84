
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, Clock, Target, DollarSign } from "lucide-react";
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
      borderColor: "border-blue-200"
    },
    {
      title: "Receita Total",
      value: formatCurrency(metrics.receitaTotal),
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Taxa de Fechamento",
      value: formatPercentage(metrics.taxaFechamento),
      icon: Target,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(metrics.ticketMedio),
      icon: TrendingUp,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    },
    {
      title: "Taxa de Comparecimento",
      value: formatPercentage(metrics.taxaComparecimento),
      icon: Clock,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200"
    },
    {
      title: "No-Shows",
      value: metrics.noShows.toLocaleString(),
      icon: TrendingDown,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border-l-4 hover:shadow-lg transition-shadow duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {metric.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${metric.iconColor}`} />
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
  );
}
