
import React, { useState } from "react";
import { format, parse, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "@/types/lead";

interface DatePickerWithRangeProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DatePickerWithRange({ 
  dateRange, 
  onDateRangeChange, 
  className 
}: DatePickerWithRangeProps) {
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  const presetRanges = [
    {
      label: "Últimos 7 dias",
      range: {
        from: subDays(new Date(), 7),
        to: new Date()
      }
    },
    {
      label: "Últimos 30 dias", 
      range: {
        from: subDays(new Date(), 30),
        to: new Date()
      }
    },
    {
      label: "Últimos 90 dias",
      range: {
        from: subDays(new Date(), 90),
        to: new Date()
      }
    },
    {
      label: "Este mês",
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }
    },
    {
      label: "Mês passado",
      range: {
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1))
      }
    }
  ];

  const handlePresetClick = (range: DateRange) => {
    onDateRangeChange(range);
  };

  const handleManualDateChange = () => {
    if (fromInput && toInput) {
      try {
        const fromDate = parse(fromInput, "dd/MM/yyyy", new Date());
        const toDate = parse(toInput, "dd/MM/yyyy", new Date());
        
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime()) && fromDate <= toDate) {
          onDateRangeChange({
            from: fromDate,
            to: toDate
          });
        }
      } catch (error) {
        console.error("Erro ao parsear datas:", error);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Períodos pré-definidos */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                Períodos sugeridos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {presetRanges.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset.range)}
                    className="justify-start text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Entrada manual de datas */}
            <div>
              <h4 className="text-sm font-medium mb-2">Datas específicas</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-gray-600">De:</label>
                  <Input
                    placeholder="dd/mm/aaaa"
                    value={fromInput}
                    onChange={(e) => setFromInput(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Até:</label>
                  <Input
                    placeholder="dd/mm/aaaa"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleManualDateChange}
                className="w-full"
                disabled={!fromInput || !toInput}
              >
                Aplicar Datas
              </Button>
            </div>

            {/* Calendário visual */}
            <div>
              <h4 className="text-sm font-medium mb-2">Seleção visual</h4>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onDateRangeChange({
                      from: range.from,
                      to: range.to
                    });
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
