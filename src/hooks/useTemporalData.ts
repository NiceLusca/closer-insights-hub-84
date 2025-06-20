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

function parseHourFromString(hourString: string): number {
  if (!hourString) return 12;
  
  const cleanHour = hourString.trim().toLowerCase();
  
  // Padrões melhorados para formatos brasileiros
  const patterns = [
    /^(\d{1,2}):(\d{2})/, // 8:45, 14:30
    /^(\d{1,2})h(\d{0,2})/, // 8h45, 14h30, 17h
    /^(\d{1,2})\.(\d{2})/, // 8.45, 14.30
    /^(\d{1,2})\s*h/, // 8 h, 14h
    /^(\d{1,2})$/ // 8, 14
  ];
  
  for (const pattern of patterns) {
    const match = cleanHour.match(pattern);
    if (match) {
      const hour = parseInt(match[1]);
      
      // Validar hora
      if (hour >= 0 && hour <= 23) {
        return hour;
      }
    }
  }
  
  console.warn(`⚠️ Hora não parseada: "${hourString}", usando 12h`);
  return 12;
}

export function useTemporalData(leads: Lead[]): TemporalDataResult {
  return useMemo(() => {
    console.log('📊 [TEMPORAL] === ANÁLISE TEMPORAL CORRIGIDA (FASE 5) ===');
    
    // CORREÇÃO: Ser menos restritivo - incluir leads sem data perfeita
    const validLeads = getLeadsExcludingMentorados(leads).filter(lead => {
      // Aceitar leads com parsedDate OU com campo data preenchido
      return (lead.parsedDate && isValid(lead.parsedDate)) || 
             (lead.data && lead.data.trim() !== '');
    });

    const totalLeads = validLeads.length;
    console.log(`📊 [TEMPORAL] Analisando ${totalLeads} leads válidos de ${leads.length} total`);

    // Análise por dia da semana
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
      let dayIndex = 1; // Default segunda-feira
      
      if (lead.parsedDate && isValid(lead.parsedDate)) {
        dayIndex = getDay(lead.parsedDate);
      } else if (lead.data) {
        // Tentar parsear data alternativa
        try {
          const altDate = new Date(lead.data);
          if (isValid(altDate)) {
            dayIndex = getDay(altDate);
          }
        } catch (e) {
          // Usar default
        }
      }
      
      dayDebugCount[dayIndex] = (dayDebugCount[dayIndex] || 0) + 1;
      dayOfWeekData[dayIndex].leads++;
      
      // Verificar fechamento
      if (lead.Status?.toLowerCase().includes('fechou') || 
          lead.Status?.toLowerCase().includes('vendido') ||
          lead.Status?.toLowerCase().includes('cliente')) {
        dayOfWeekData[dayIndex].conversoes++;
      }
    });

    console.log('🗓️ Distribuição por dia (CORRIGIDA):');
    dayNames.forEach((name, index) => {
      const count = dayDebugCount[index] || 0;
      console.log(`  ${name}: ${count} leads`);
    });

    dayOfWeekData.forEach(day => {
      day.taxa = day.leads > 0 ? Number(((day.conversoes / day.leads) * 100).toFixed(1)) : 0;
    });

    // Análise por hora do dia - MELHORADO
    const hourData: HourData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    const hourDebugCount: Record<number, number> = {};
    const hourParseErrors: string[] = [];

    validLeads.forEach(lead => {
      let hour = 12; // Default meio-dia
      
      if (lead.Hora && typeof lead.Hora === 'string') {
        hour = parseHourFromString(lead.Hora);
        if (hour === 12 && lead.Hora !== '12' && lead.Hora !== '12h' && lead.Hora !== '12:00') {
          hourParseErrors.push(lead.Hora);
        }
      } else if (lead.parsedDate && isValid(lead.parsedDate)) {
        hour = getHours(lead.parsedDate);
      }

      hourDebugCount[hour] = (hourDebugCount[hour] || 0) + 1;
      hourData[hour].leads++;
      
      if (lead.Status?.toLowerCase().includes('fechou') || 
          lead.Status?.toLowerCase().includes('vendido') ||
          lead.Status?.toLowerCase().includes('cliente')) {
        hourData[hour].conversoes++;
      }
    });

    console.log('🕐 Distribuição por hora (MELHORADA):');
    Object.entries(hourDebugCount)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([hour, count]) => {
        console.log(`  ${hour}h: ${count} leads`);
      });

    if (hourParseErrors.length > 0) {
      console.warn('⚠️ Horários que não puderam ser parseados (usando 12h):', 
        [...new Set(hourParseErrors)].slice(0, 10));
    }

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
    const significantDays = dayOfWeekData.filter(day => day.leads >= 1); // Menos restritivo
    const significantHours = hourData.filter(hour => hour.leads >= 1);

    const bestDay = significantDays.length > 0 
      ? significantDays.reduce((best, day) => 
          day.leads > best.leads ? day : best) // Baseado em volume, não só taxa
      : null;
    
    const bestHour = significantHours.length > 0
      ? significantHours.reduce((best, hour) => 
          hour.leads > best.leads ? hour : best)
      : null;

    const peakHours = significantHours
      .sort((a, b) => b.leads - a.leads) // Ordenar por volume
      .slice(0, 3);

    console.log('🎯 Insights calculados (OTIMIZADOS):');
    console.log('  Melhor dia:', bestDay?.day, `(${bestDay?.leads} leads, ${bestDay?.taxa}% conversão)`);
    console.log('  Melhor hora:', bestHour?.hourLabel, `(${bestHour?.leads} leads)`);
    console.log('  Dias com dados:', significantDays.length, 'de 7');
    console.log('  Horas com dados:', significantHours.length, 'de 24');

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
