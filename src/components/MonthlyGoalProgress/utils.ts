import type { Lead } from "@/types/lead";
import type { MonthlyData, CloserContribution } from "./types";
import { MONTHLY_GOAL, getCloserColor } from "./constants";

export const calculateMonthlyData = (allLeads: Lead[]): MonthlyData => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  console.log('📊 [MONTHLY GOAL] Calculando meta para:', currentMonth + 1, '/', currentYear);
  
  // Filtrar apenas leads FECHADOS do mês atual
  const currentMonthClosedLeads = allLeads.filter(lead => {
    if (!lead.parsedDate || lead.Status !== 'Fechou') return false;
    
    const leadDate = lead.parsedDate;
    return leadDate.getMonth() === currentMonth && 
           leadDate.getFullYear() === currentYear;
  });
  
  // Calcular receita total apenas dos leads fechados
  const monthlyRevenue = currentMonthClosedLeads.reduce((total, lead) => {
    const vendaCompleta = lead['Venda Completa'] || 0;
    const recorrente = lead.recorrente || 0;
    return total + vendaCompleta + recorrente;
  }, 0);
  
  // Calcular contribuições por closer
  const closerContributions = currentMonthClosedLeads.reduce((acc, lead) => {
    const closer = lead.Closer?.trim() || 'Sem Closer';
    const vendaCompleta = lead['Venda Completa'] || 0;
    const recorrente = lead.recorrente || 0;
    const leadRevenue = vendaCompleta + recorrente;
    
    if (!acc[closer]) {
      acc[closer] = {
        revenue: 0,
        salesCount: 0,
        percentage: 0
      };
    }
    
    acc[closer].revenue += leadRevenue;
    acc[closer].salesCount += 1;
    
    return acc;
  }, {} as Record<string, CloserContribution>);
  
  // Calcular percentuais de contribuição
  Object.keys(closerContributions).forEach(closer => {
    closerContributions[closer].percentage = monthlyRevenue > 0 
      ? (closerContributions[closer].revenue / monthlyRevenue) * 100 
      : 0;
  });
  
  // Ordenar closers por contribuição (maior para menor)
  const sortedClosers = Object.entries(closerContributions)
    .sort(([, a], [, b]) => b.revenue - a.revenue);
  
  const progress = (monthlyRevenue / MONTHLY_GOAL) * 100;
  const remaining = Math.max(0, MONTHLY_GOAL - monthlyRevenue);
  
  console.log('📊 [MONTHLY GOAL] Leads fechados do mês:', currentMonthClosedLeads.length);
  console.log('📊 [MONTHLY GOAL] Receita do mês:', monthlyRevenue);
  console.log('📊 [MONTHLY GOAL] Progresso:', progress.toFixed(1) + '%');
  console.log('📊 [MONTHLY GOAL] Contribuições por closer:', closerContributions);
  
  return {
    monthlyRevenue,
    goal: MONTHLY_GOAL,
    progress: Math.min(progress, 100), // Limitar a 100%
    remaining,
    leadsCount: currentMonthClosedLeads.length, // Agora conta apenas fechados
    closerContributions: sortedClosers
  };
};

export const getProgressColor = (progress: number) => {
  if (progress < 30) return "text-red-400";
  if (progress < 70) return "text-yellow-400";
  return "text-green-400";
};

export const getProgressBg = (progress: number) => {
  if (progress < 30) return "bg-gradient-to-r from-red-500 to-red-600";
  if (progress < 70) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
  return "bg-gradient-to-r from-green-500 to-green-600";
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export { getCloserColor };
