
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "@/types/lead";

interface PeriodSelectorProps {
  selectedPeriods: { period1: DateRange; period2: DateRange };
  onPeriodsChange: (periods: { period1: DateRange; period2: DateRange }) => void;
  comparisonType: string;
}

export const PeriodSelector = React.memo(({ 
  selectedPeriods, 
  onPeriodsChange, 
  comparisonType 
}: PeriodSelectorProps) => {
  const now = new Date();
  
  const presetPeriods = [
    {
      label: 'Este mês vs Mês passado',
      period1: { from: startOfMonth(now), to: endOfMonth(now) },
      period2: { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) }
    },
    {
      label: 'Últimos 2 meses completos',
      period1: { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) },
      period2: { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(subMonths(now, 2)) }
    },
    {
      label: 'Trimestre atual vs anterior',
      period1: { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) },
      period2: { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(subMonths(now, 3)) }
    }
  ];

  if (comparisonType !== 'temporal') {
    return null;
  }

  const getPeriodDisplayName = (dateRange: DateRange): string => {
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    if (dateRange.from.getTime() === startOfCurrentMonth.getTime() && 
        dateRange.to.getTime() === endOfCurrentMonth.getTime()) {
      return "Este Mês";
    }
    
    if (dateRange.from.getTime() === startOfLastMonth.getTime() && 
        dateRange.to.getTime() === endOfLastMonth.getTime()) {
      return "Mês Passado";
    }
    
    const isFullMonth = dateRange.from.getDate() === 1 && 
                       dateRange.to.getDate() === new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate();
    
    if (isFullMonth) {
      return format(dateRange.from, "MMM/yyyy", { locale: ptBR });
    }
    
    return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`;
  };

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Períodos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview dos períodos selecionados */}
        <div className="bg-gray-700/30 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-400 font-medium">
              {getPeriodDisplayName(selectedPeriods.period1)}
            </span>
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-purple-400 font-medium">
              {getPeriodDisplayName(selectedPeriods.period2)}
            </span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Presets rápidos:</p>
          {presetPeriods.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs justify-start"
              onClick={() => onPeriodsChange({ period1: preset.period1, period2: preset.period2 })}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Custom Period Selectors */}
        <div className="space-y-3 pt-3 border-t border-gray-700/30">
          <p className="text-sm text-gray-400">Seleção personalizada:</p>
          <div>
            <label className="text-sm text-blue-400 mb-2 block font-medium">Período 1:</label>
            <DatePickerWithRange
              dateRange={selectedPeriods.period1}
              onDateRangeChange={(range) => range && onPeriodsChange({
                ...selectedPeriods,
                period1: range
              })}
            />
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Período 2:</label>
            <DatePickerWithRange
              dateRange={selectedPeriods.period2}
              onDateRangeChange={(range) => range && onPeriodsChange({
                ...selectedPeriods,
                period2: range
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PeriodSelector.displayName = 'PeriodSelector';
