
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp, Clock, Activity } from "lucide-react";
import { format, parseISO, isValid, getHours, getDay, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "@/types/lead";

interface TemporalAnalysisProps {
  leads: Lead[];
}

export const TemporalAnalysis = React.memo(({ leads }: TemporalAnalysisProps) => {
  const temporalData = useMemo(() => {
    // Filtrar leads válidos com data
    const validLeads = leads.filter(lead => 
      lead.Status !== 'Mentorado' && 
      lead.parsedDate && 
      isValid(lead.parsedDate)
    );

    // Análise por dia da semana
    const dayOfWeekData = Array.from({ length: 7 }, (_, i) => ({
      day: format(new Date(2024, 0, i + 1), 'EEEE', { locale: ptBR }),
      dayIndex: i,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    validLeads.forEach(lead => {
      const dayIndex = getDay(lead.parsedDate!);
      dayOfWeekData[dayIndex].leads++;
      if (lead.Status === 'Fechou') {
        dayOfWeekData[dayIndex].conversoes++;
      }
    });

    dayOfWeekData.forEach(day => {
      day.taxa = day.leads > 0 ? (day.conversoes / day.leads) * 100 : 0;
    });

    // Análise por hora do dia (usando Hora field se disponível)
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    validLeads.forEach(lead => {
      let hour = 12; // Default para meio-dia se não conseguir extrair
      
      // Tentar extrair hora do campo Hora
      if (lead.Hora && typeof lead.Hora === 'string') {
        const timeMatch = lead.Hora.match(/(\d{1,2}):?(\d{0,2})/);
        if (timeMatch) {
          hour = parseInt(timeMatch[1]);
          if (hour < 0 || hour > 23) hour = 12;
        }
      } else if (lead.parsedDate) {
        // Fallback: usar hora da parsedDate
        hour = getHours(lead.parsedDate);
      }

      hourData[hour].leads++;
      if (lead.Status === 'Fechou') {
        hourData[hour].conversoes++;
      }
    });

    hourData.forEach(h => {
      h.taxa = h.leads > 0 ? (h.conversoes / h.leads) * 100 : 0;
    });

    // Análise temporal (últimos 30 dias)
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    const dailyData = last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLeads = validLeads.filter(lead => {
        if (lead.parsedDate && isValid(lead.parsedDate)) {
          return format(lead.parsedDate, 'yyyy-MM-dd') === dateStr;
        }
        return false;
      });

      const conversoes = dayLeads.filter(lead => lead.Status === 'Fechou').length;
      const agendamentos = dayLeads.filter(lead => 
        ['Agendado', 'Confirmado'].includes(lead.Status || '')
      ).length;

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: dateStr,
        leads: dayLeads.length,
        conversoes,
        agendamentos,
        taxa: dayLeads.length > 0 ? (conversoes / dayLeads.length) * 100 : 0
      };
    });

    // Identificar padrões
    const bestDay = dayOfWeekData.reduce((best, day) => 
      day.taxa > best.taxa ? day : best
    );
    
    const bestHour = hourData.reduce((best, hour) => 
      hour.taxa > best.taxa ? hour : best
    );

    const peakHours = hourData
      .filter(h => h.leads >= 3) // Mínimo de 3 leads para ser considerado
      .sort((a, b) => b.taxa - a.taxa)
      .slice(0, 3);

    return {
      dayOfWeekData,
      hourData: hourData.filter(h => h.leads > 0), // Mostrar apenas horas com leads
      dailyData,
      insights: {
        bestDay,
        bestHour,
        peakHours,
        totalValidLeads: validLeads.length
      }
    };
  }, [leads]);

  const CustomTooltip = React.memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Taxa') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  });

  CustomTooltip.displayName = 'CustomTooltip';

  return (
    <div className="space-y-8">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">MELHOR DIA</span>
            </div>
            <p className="text-lg font-bold text-white">{temporalData.insights.bestDay.day}</p>
            <p className="text-sm text-blue-300">{temporalData.insights.bestDay.taxa.toFixed(1)}% conversão</p>
            <p className="text-xs text-gray-400">{temporalData.insights.bestDay.leads} leads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">MELHOR HORÁRIO</span>
            </div>
            <p className="text-lg font-bold text-white">{temporalData.insights.bestHour.hourLabel}</p>
            <p className="text-sm text-green-300">{temporalData.insights.bestHour.taxa.toFixed(1)}% conversão</p>
            <p className="text-xs text-gray-400">{temporalData.insights.bestHour.leads} leads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">LEADS COM DATA</span>
            </div>
            <p className="text-lg font-bold text-white">{temporalData.insights.totalValidLeads}</p>
            <p className="text-sm text-purple-300">analisados</p>
            <p className="text-xs text-gray-400">com timestamp válido</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Dia da Semana */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Performance por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={temporalData.dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" fill="#60a5fa" name="Leads" radius={[2, 2, 0, 0]} />
              <Bar dataKey="conversoes" fill="#34d399" name="Conversões" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise por Horário */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Heatmap por Horário do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temporalData.hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hourLabel" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#60a5fa" 
                name="Leads"
                strokeWidth={2}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="taxa" 
                stroke="#f59e0b" 
                name="Taxa de Conversão (%)"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Top 3 Horários */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-200 mb-3">Melhores Horários de Conversão</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {temporalData.insights.peakHours.map((hour, index) => (
                <div key={hour.hour} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-amber-600 text-white'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-white">{hour.hourLabel}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {hour.conversoes}/{hour.leads} leads • {hour.taxa.toFixed(1)}% conversão
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tendência dos Últimos 30 Dias */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Tendência dos Últimos 30 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={temporalData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#60a5fa" 
                name="Leads Diários"
                strokeWidth={2}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="agendamentos" 
                stroke="#34d399" 
                name="Agendamentos"
                strokeWidth={2}
                dot={{ fill: '#34d399', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversoes" 
                stroke="#f59e0b" 
                name="Conversões"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
});

TemporalAnalysis.displayName = 'TemporalAnalysis';
