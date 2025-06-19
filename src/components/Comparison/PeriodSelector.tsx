
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { subDays, subMonths } from "date-fns";
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
  const presetPeriods = [
    {
      label: 'Últimos 2 meses',
      period1: { from: subMonths(new Date(), 2), to: subMonths(new Date(), 1) },
      period2: { from: subMonths(new Date(), 1), to: new Date() }
    },
    {
      label: 'Este vs Último mês',
      period1: { from: subDays(new Date(), 30), to: new Date() },
      period2: { from: subDays(new Date(), 60), to: subDays(new Date(), 30) }
    },
    {
      label: 'Últimas 2 semanas',
      period1: { from: subDays(new Date(), 14), to: subDays(new Date(), 7) },
      period2: { from: subDays(new Date(), 7), to: new Date() }
    }
  ];

  if (comparisonType !== 'temporal') {
    return null;
  }

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Períodos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Buttons */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Presets rápidos:</p>
          {presetPeriods.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs"
              onClick={() => onPeriodsChange({ period1: preset.period1, period2: preset.period2 })}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Custom Period Selectors */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Período 1:</label>
            <DatePickerWithRange
              selectedRange={selectedPeriods.period1}
              onRangeChange={(range) => range && onPeriodsChange({
                ...selectedPeriods,
                period1: range
              })}
            />
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Período 2:</label>
            <DatePickerWithRange
              selectedRange={selectedPeriods.period2}
              onRangeChange={(range) => range && onPeriodsChange({
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
