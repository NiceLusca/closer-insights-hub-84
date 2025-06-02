
import { useMemo } from "react";
import { format, parseISO, isValid, getHours, getDay, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getLeadsExcludingMentorados } from "@/utils/statusClassification";
import { hasSignificantVolume, getVolumeIndicator } from "@/utils/volumeAnalysis";
import type { Lead } from "@/types/lead";

export interface DayData {
  day: string;
  dayIndex: number;
  leads: number;
  conversoes: number;
  taxa: number;
}

export interface HourData {
  hour: number;
  hourLabel: string;
  leads: number;
  conversoes: number;
  taxa: number;
}

export interface DailyData {
  date: string;
  fullDate: string;
  leads: number;
  conversoes: number;
  taxa: number;
}

export interface TemporalInsights {
  bestDay: DayData | null;
  bestHour: HourData | null;
  peakHours: HourData[];
  totalValidLeads: number;
  significantDays: number;
  significantHours: number;
}

export interface TemporalDataResult {
  dayOfWeekData: DayData[];
  hourData: HourData[];
  dailyData: DailyData[];
  insights: TemporalInsights;
}

export function useTemporalData(leads: Lead[]): TemporalDataResult {
  return useMemo(() => {
    const validLeads = getLeadsExcludingMentorados(leads).filter(lead => 
      lead.parsedDate && isValid(lead.parsedDate)
    );

    const totalLeads = validLeads.length;
    console.log(`📊 Analisando ${totalLeads} leads válidos`);

    // Análise por dia da semana - CORRIGIDO
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayOfWeekData: DayData[] = dayNames.map((name, index) => ({
      day: name,
      dayIndex: index,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    const dayDebugCount: Record<number, number> = {};

    validLeads.forEach(lead => {
      const dayIndex = getDay(lead.parsedDate!);
      dayDebugCount[dayIndex] = (dayDebugCount[dayIndex] || 0) + 1;
      dayOfWeekData[dayIndex].leads++;
      if (lead.Status === 'Fechou') {
        dayOfWeekData[dayIndex].conversoes++;
      }
    });

    console.log('🗓️ Distribuição CORRETA por dia da semana:');
    dayNames.forEach((name, index) => {
      const count = dayDebugCount[index] || 0;
      console.log(`  ${name} (${index}): ${count} leads`);
    });

    dayOfWeekData.forEach(day => {
      day.taxa = day.leads > 0 ? Number(((day.conversoes / day.leads) * 100).toFixed(1)) : 0;
    });

    // Análise por hora do dia - VERIFICADO
    const hourData: HourData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    const hourDebugCount: Record<number, number> = {};

    validLeads.forEach(lead => {
      let hour = 12; // Default fallback
      
      if (lead.Hora && typeof lead.Hora === 'string') {
        const timeMatch = lead.Hora.match(/(\d{1,2}):?(\d{0,2})/);
        if (timeMatch) {
          const extractedHour = parseInt(timeMatch[1]);
          if (extractedHour >= 0 && extractedHour <= 23) {
            hour = extractedHour;
          }
        }
      } else if (lead.parsedDate) {
        hour = getHours(lead.parsedDate);
      }

      if (hour < 0 || hour > 23) {
        console.warn(`⚠️ Hora inválida detectada: ${hour}, usando 12 como fallback`);
        hour = 12;
      }

      hourDebugCount[hour] = (hourDebugCount[hour] || 0) + 1;
      hourData[hour].leads++;
      if (lead.Status === 'Fechou') {
        hourData[hour].conversoes++;
      }
    });

    console.log('🕐 Distribuição por hora do dia:');
    Object.entries(hourDebugCount).forEach(([hour, count]) => {
      console.log(`  ${hour}h: ${count} leads`);
    });

    hourData.forEach(h => {
      h.taxa = h.leads > 0 ? Number(((h.conversoes / h.leads) * 100).toFixed(1)) : 0;
    });

    // Análise temporal dos últimos 30 dias
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    const dailyData: DailyData[] = last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLeads = validLeads.filter(lead => {
        if (lead.parsedDate && isValid(lead.parsedDate)) {
          return format(lead.parsedDate, 'yyyy-MM-dd') === dateStr;
        }
        return false;
      });

      const conversoes = dayLeads.filter(lead => lead.Status === 'Fechou').length;

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: dateStr,
        leads: dayLeads.length,
        conversoes,
        taxa: dayLeads.length > 0 ? Number(((conversoes / dayLeads.length) * 100).toFixed(1)) : 0
      };
    });

    // Insights com dados significativos
    const significantDays = dayOfWeekData.filter(day => 
      hasSignificantVolume(day.leads, totalLeads)
    );
    const significantHours = hourData.filter(hour => 
      hasSignificantVolume(hour.leads, totalLeads)
    );

    const bestDay = significantDays.length > 0 
      ? significantDays.reduce((best, day) => day.taxa > best.taxa ? day : best)
      : null;
    
    const bestHour = significantHours.length > 0
      ? significantHours.reduce((best, hour) => hour.taxa > best.taxa ? hour : best)
      : null;

    const peakHours = significantHours
      .sort((a, b) => b.taxa - a.taxa)
      .slice(0, 3);

    console.log('🎯 Insights calculados:');
    console.log('  Melhor dia:', bestDay?.day, `(${bestDay?.taxa}% conversão)`);
    console.log('  Melhor hora:', bestHour?.hourLabel, `(${bestHour?.taxa}% conversão)`);
    console.log('  Dias significativos:', significantDays.length, 'de 7');
    console.log('  Horas significativas:', significantHours.length, 'de 24');

    return {
      dayOfWeekData,
      hourData: hourData.filter(h => h.leads > 0),
      dailyData,
      insights: {
        bestDay,
        bestHour,
        peakHours,
        totalValidLeads: validLeads.length,
        significantDays: significantDays.length,
        significantHours: significantHours.length
      }
    };
  }, [leads]);
}
