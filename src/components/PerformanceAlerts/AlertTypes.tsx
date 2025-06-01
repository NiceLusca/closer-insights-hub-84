
import { AlertTriangle, TrendingDown, TrendingUp, Target, Zap, Users } from "lucide-react";
import type { Lead } from "@/types/lead";

export interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'success' | 'info';
  icon: React.ElementType;
  title: string;
  description: string;
  metric?: string;
  priority: number;
}

export const getAlertStyles = (type: AlertItem['type']) => {
  switch (type) {
    case 'danger':
      return 'border-red-500/50 bg-red-500/10';
    case 'warning':
      return 'border-yellow-500/50 bg-yellow-500/10';
    case 'success':
      return 'border-green-500/50 bg-green-500/10';
    case 'info':
    default:
      return 'border-blue-500/50 bg-blue-500/10';
  }
};

export const getIconColor = (type: AlertItem['type']) => {
  switch (type) {
    case 'danger':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    case 'success':
      return 'text-green-400';
    case 'info':
    default:
      return 'text-blue-400';
  }
};

export const generateConversionAlerts = (validLeads: Lead[]): AlertItem[] => {
  const alerts: AlertItem[] = [];
  const totalLeads = validLeads.length;
  const fechamentos = validLeads.filter(lead => lead.Status === 'Fechou').length;
  const taxaConversaoGeral = (fechamentos / totalLeads) * 100;

  if (taxaConversaoGeral < 10) {
    alerts.push({
      id: 'low-conversion',
      type: 'danger',
      icon: AlertTriangle,
      title: 'Taxa de conversão muito baixa',
      description: `Apenas ${taxaConversaoGeral.toFixed(1)}% dos leads estão fechando. Revisar processo de vendas.`,
      metric: `${taxaConversaoGeral.toFixed(1)}%`,
      priority: 10
    });
  } else if (taxaConversaoGeral > 25) {
    alerts.push({
      id: 'high-conversion',
      type: 'success',
      icon: TrendingUp,
      title: 'Excelente performance de conversão',
      description: `Taxa de ${taxaConversaoGeral.toFixed(1)}% está acima da média. Parabéns!`,
      metric: `${taxaConversaoGeral.toFixed(1)}%`,
      priority: 2
    });
  }

  return alerts;
};

export const generateNoShowAlerts = (validLeads: Lead[]): AlertItem[] => {
  const alerts: AlertItem[] = [];
  const apresentacoes = validLeads.filter(lead => 
    ['Fechou', 'Não Apareceu', 'Não Fechou'].includes(lead.Status || '')
  ).length;
  const noShows = validLeads.filter(lead => lead.Status === 'Não Apareceu').length;
  const taxaNoShow = apresentacoes > 0 ? (noShows / apresentacoes) * 100 : 0;

  if (taxaNoShow > 30) {
    alerts.push({
      id: 'high-noshow',
      type: 'warning',
      icon: AlertTriangle,
      title: 'Alto índice de faltas',
      description: `${taxaNoShow.toFixed(1)}% dos agendados não compareceram. Melhorar confirmação.`,
      metric: `${taxaNoShow.toFixed(1)}%`,
      priority: 8
    });
  }

  return alerts;
};
