
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import type { Lead } from "@/types/lead";

interface MonthlyGoalProgressProps {
  allLeads: Lead[];
}

export const MonthlyGoalProgress = React.memo(({ allLeads }: MonthlyGoalProgressProps) => {
  const monthlyData = useMemo(() => {
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
    }, {} as Record<string, { revenue: number; salesCount: number; percentage: number }>);
    
    // Calcular percentuais de contribuição
    Object.keys(closerContributions).forEach(closer => {
      closerContributions[closer].percentage = monthlyRevenue > 0 
        ? (closerContributions[closer].revenue / monthlyRevenue) * 100 
        : 0;
    });
    
    // Ordenar closers por contribuição (maior para menor)
    const sortedClosers = Object.entries(closerContributions)
      .sort(([, a], [, b]) => b.revenue - a.revenue);
    
    const goal = 50000; // Meta de R$ 50.000
    const progress = (monthlyRevenue / goal) * 100;
    const remaining = Math.max(0, goal - monthlyRevenue);
    
    console.log('📊 [MONTHLY GOAL] Leads fechados do mês:', currentMonthClosedLeads.length);
    console.log('📊 [MONTHLY GOAL] Receita do mês:', monthlyRevenue);
    console.log('📊 [MONTHLY GOAL] Progresso:', progress.toFixed(1) + '%');
    console.log('📊 [MONTHLY GOAL] Contribuições por closer:', closerContributions);
    
    return {
      monthlyRevenue,
      goal,
      progress: Math.min(progress, 100), // Limitar a 100%
      remaining,
      leadsCount: currentMonthClosedLeads.length, // Agora conta apenas fechados
      closerContributions: sortedClosers
    };
  }, [allLeads]);
  
  // Definir cor baseada no progresso
  const getProgressColor = useMemo(() => (progress: number) => {
    if (progress < 30) return "text-red-400";
    if (progress < 70) return "text-yellow-400";
    return "text-green-400";
  }, []);
  
  const getProgressBg = useMemo(() => (progress: number) => {
    if (progress < 30) return "bg-gradient-to-r from-red-500 to-red-600";
    if (progress < 70) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-green-500 to-green-600";
  }, []);
  
  const formatCurrency = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }, []);
  
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  // Cores para diferentes closers
  const getCloserColor = (index: number) => {
    const colors = [
      'text-blue-400',
      'text-green-400', 
      'text-purple-400',
      'text-yellow-400',
      'text-pink-400',
      'text-cyan-400',
      'text-orange-400'
    ];
    return colors[index % colors.length];
  };
  
  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover-lift transition-all duration-300 card-entrance">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-100">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 hover:scale-110 transition-transform duration-200">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Meta de Faturamento - {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de progresso principal com tooltip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-medium">Progresso da Meta</span>
            <span className={`font-bold text-lg transition-colors duration-300 ${getProgressColor(monthlyData.progress)}`}>
              {monthlyData.progress.toFixed(1)}%
            </span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative overflow-hidden cursor-help">
                  <Progress 
                    value={monthlyData.progress} 
                    className="h-4 bg-gray-700/50 rounded-full shadow-inner" 
                  />
                  <div 
                    className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-1000 ease-out ${getProgressBg(monthlyData.progress)} shadow-lg`}
                    style={{ 
                      width: `${Math.min(monthlyData.progress, 100)}%`,
                      boxShadow: `0 0 10px ${monthlyData.progress >= 70 ? 'rgba(34, 197, 94, 0.5)' : monthlyData.progress >= 30 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                    }}
                  >
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm p-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-200 border-b border-gray-600 pb-2">
                    🎯 Contribuições para a Meta
                  </h4>
                  
                  {monthlyData.closerContributions.length > 0 ? (
                    <div className="space-y-2">
                      {monthlyData.closerContributions.map(([closer, data], index) => (
                        <div key={closer} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-current ${getCloserColor(index)}`}></div>
                            <span className="text-gray-300 font-medium">{closer}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getCloserColor(index)}`}>
                              {formatCurrency(data.revenue)}
                            </div>
                            <div className="text-gray-400">
                              {data.salesCount} vendas • {data.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t border-gray-600 pt-2 mt-3">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-200">Total Geral:</span>
                          <div className="text-right">
                            <div className="text-green-400">{formatCurrency(monthlyData.monthlyRevenue)}</div>
                            <div className="text-gray-400">{monthlyData.leadsCount} vendas</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Nenhuma venda registrada neste mês</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Cards de informações com hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meta */}
          <div className="p-4 rounded-xl bg-gray-700/50 border border-gray-600/50 hover-scale transition-all duration-200 group">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium text-gray-300">Meta Mensal</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(monthlyData.goal)}</p>
          </div>
          
          {/* Faturado */}
          <div className="p-4 rounded-xl bg-gray-700/50 border border-gray-600/50 hover-scale transition-all duration-200 group">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium text-gray-300">Faturado</span>
            </div>
            <p className="text-xl font-bold text-green-400">{formatCurrency(monthlyData.monthlyRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">{monthlyData.leadsCount} vendas fechadas</p>
          </div>
          
          {/* Restante */}
          <div className="p-4 rounded-xl bg-gray-700/50 border border-gray-600/50 hover-scale transition-all duration-200 group">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium text-gray-300">Restante</span>
            </div>
            <p className="text-xl font-bold text-orange-400">{formatCurrency(monthlyData.remaining)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {monthlyData.progress >= 100 ? 'Meta atingida! 🎉' : 'para atingir a meta'}
            </p>
          </div>
        </div>
        
        {/* Indicador de status com animação */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300">
          <p className="text-sm font-medium">
            {monthlyData.progress >= 100 ? (
              <span className="text-green-400 animate-pulse">🎉 Parabéns! Meta do mês atingida!</span>
            ) : monthlyData.progress >= 70 ? (
              <span className="text-yellow-400">🔥 Quase lá! Faltam apenas {formatCurrency(monthlyData.remaining)}</span>
            ) : (
              <span className="text-gray-300">💪 Continue focado na meta mensal</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

MonthlyGoalProgress.displayName = 'MonthlyGoalProgress';
