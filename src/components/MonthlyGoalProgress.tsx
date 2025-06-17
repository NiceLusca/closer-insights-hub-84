
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import type { Lead } from "@/types/lead";

interface MonthlyGoalProgressProps {
  allLeads: Lead[];
}

export function MonthlyGoalProgress({ allLeads }: MonthlyGoalProgressProps) {
  const monthlyData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    console.log('📊 [MONTHLY GOAL] Calculando meta para:', currentMonth + 1, '/', currentYear);
    
    // Filtrar apenas leads do mês atual, independente de outros filtros
    const currentMonthLeads = allLeads.filter(lead => {
      if (!lead.parsedDate) return false;
      
      const leadDate = lead.parsedDate;
      return leadDate.getMonth() === currentMonth && 
             leadDate.getFullYear() === currentYear;
    });
    
    // Calcular receita total do mês (Venda Completa + recorrente)
    const monthlyRevenue = currentMonthLeads.reduce((total, lead) => {
      const vendaCompleta = lead['Venda Completa'] || 0;
      const recorrente = lead.recorrente || 0;
      return total + vendaCompleta + recorrente;
    }, 0);
    
    const goal = 50000; // Meta de R$ 50.000
    const progress = (monthlyRevenue / goal) * 100;
    const remaining = Math.max(0, goal - monthlyRevenue);
    
    console.log('📊 [MONTHLY GOAL] Leads do mês:', currentMonthLeads.length);
    console.log('📊 [MONTHLY GOAL] Receita do mês:', monthlyRevenue);
    console.log('📊 [MONTHLY GOAL] Progresso:', progress.toFixed(1) + '%');
    
    return {
      monthlyRevenue,
      goal,
      progress: Math.min(progress, 100), // Limitar a 100%
      remaining,
      leadsCount: currentMonthLeads.length
    };
  }, [allLeads]);
  
  // Definir cor baseada no progresso
  const getProgressColor = (progress: number) => {
    if (progress < 30) return "text-red-400";
    if (progress < 70) return "text-yellow-400";
    return "text-green-400";
  };
  
  const getProgressBg = (progress: number) => {
    if (progress < 30) return "bg-gradient-to-r from-red-500 to-red-600";
    if (progress < 70) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-green-500 to-green-600";
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-100">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          Meta de Faturamento - {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de progresso principal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progresso da Meta</span>
            <span className={`font-bold ${getProgressColor(monthlyData.progress)}`}>
              {monthlyData.progress.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={monthlyData.progress} 
              className="h-3 bg-gray-700/50" 
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${getProgressBg(monthlyData.progress)}`}
              style={{ width: `${Math.min(monthlyData.progress, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Cards de informações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meta */}
          <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Meta Mensal</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(monthlyData.goal)}</p>
          </div>
          
          {/* Faturado */}
          <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Faturado</span>
            </div>
            <p className="text-xl font-bold text-green-400">{formatCurrency(monthlyData.monthlyRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">{monthlyData.leadsCount} vendas</p>
          </div>
          
          {/* Restante */}
          <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Restante</span>
            </div>
            <p className="text-xl font-bold text-orange-400">{formatCurrency(monthlyData.remaining)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {monthlyData.progress >= 100 ? 'Meta atingida! 🎉' : 'para atingir a meta'}
            </p>
          </div>
        </div>
        
        {/* Indicador de status */}
        <div className="text-center p-3 rounded-lg bg-gray-700/30 border border-gray-600/30">
          <p className="text-sm text-gray-400">
            {monthlyData.progress >= 100 ? (
              <span className="text-green-400 font-medium">🎉 Parabéns! Meta do mês atingida!</span>
            ) : monthlyData.progress >= 70 ? (
              <span className="text-yellow-400 font-medium">🔥 Quase lá! Faltam apenas {formatCurrency(monthlyData.remaining)}</span>
            ) : (
              <span className="text-gray-300">💪 Continue focado na meta mensal</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
