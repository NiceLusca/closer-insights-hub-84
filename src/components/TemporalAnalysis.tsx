
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp, Clock, Activity, AlertTriangle } from "lucide-react";
import { format, parseISO, isValid, getHours, getDay, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getLeadsExcludingMentorados, formatPercentage } from "@/utils/statusClassification";
import { hasSignificantVolume, getVolumeIndicator } from "@/utils/volumeAnalysis";
import type { Lead } from "@/types/lead";

interface TemporalAnalysisProps {
  leads: Lead[];
}

export const TemporalAnalysis = React.memo(({ leads }: TemporalAnalysisProps) => {
  const temporalData = useMemo(() => {
    const validLeads = getLeadsExcludingMentorados(leads).filter(lead => 
      lead.parsedDate && isValid(lead.parsedDate)
    );

    const totalLeads = validLeads.length;
    console.log(`📊 Analisando ${totalLeads} leads válidos`);

    // Corrigir análise por dia da semana
    // getDay() retorna: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayOfWeekData = dayNames.map((name, index) => ({
      day: name,
      dayIndex: index,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    // Debug: contador por dia da semana
    const dayDebugCount: Record<number, number> = {};

    validLeads.forEach(lead => {
      const dayIndex = getDay(lead.parsedDate!);
      dayDebugCount[dayIndex] = (dayDebugCount[dayIndex] || 0) + 1;
      dayOfWeekData[dayIndex].leads++;
      if (lead.Status === 'Fechou') {
        dayOfWeekData[dayIndex].conversoes++;
      }
    });

    // Log de debug para verificar distribuição
    console.log('🗓️ Distribuição por dia da semana:');
    dayNames.forEach((name, index) => {
      const count = dayDebugCount[index] || 0;
      console.log(`  ${name}: ${count} leads`);
    });

    dayOfWeekData.forEach(day => {
      day.taxa = day.leads > 0 ? Number(((day.conversoes / day.leads) * 100).toFixed(1)) : 0;
    });

    // Análise por hora do dia
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      leads: 0,
      conversoes: 0,
      taxa: 0
    }));

    // Debug: contador por hora
    const hourDebugCount: Record<number, number> = {};

    validLeads.forEach(lead => {
      let hour = 12; // Default fallback
      
      // Primeiro, tentar extrair hora do campo Hora
      if (lead.Hora && typeof lead.Hora === 'string') {
        const timeMatch = lead.Hora.match(/(\d{1,2}):?(\d{0,2})/);
        if (timeMatch) {
          const extractedHour = parseInt(timeMatch[1]);
          if (extractedHour >= 0 && extractedHour <= 23) {
            hour = extractedHour;
          }
        }
      } 
      // Fallback: usar hora da parsedDate
      else if (lead.parsedDate) {
        hour = getHours(lead.parsedDate);
      }

      // Validar se hora está no range correto
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

    // Log de debug para verificar distribuição de horas
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

    const dailyData = last30Days.map(date => {
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

    // Filtrar dados significativos para insights
    const significantDays = dayOfWeekData.filter(day => 
      hasSignificantVolume(day.leads, totalLeads)
    );
    const significantHours = hourData.filter(hour => 
      hasSignificantVolume(hour.leads, totalLeads)
    );

    // Identificar padrões apenas com dados significativos
    const bestDay = significantDays.length > 0 
      ? significantDays.reduce((best, day) => day.taxa > best.taxa ? day : best)
      : null;
    
    const bestHour = significantHours.length > 0
      ? significantHours.reduce((best, hour) => hour.taxa > best.taxa ? hour : best)
      : null;

    const peakHours = significantHours
      .sort((a, b) => b.taxa - a.taxa)
      .slice(0, 3);

    // Log final de insights
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

  const CustomTooltip = React.memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Taxa') || entry.name.includes('Conversão') ? '%' : ''}
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
        <Card className={`${temporalData.insights.bestDay ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30' : 'bg-gray-700/50 border border-gray-600/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">MELHOR DIA</span>
            </div>
            {temporalData.insights.bestDay ? (
              <>
                <p className="text-lg font-bold text-white">{temporalData.insights.bestDay.day}</p>
                <p className="text-sm text-blue-300">{temporalData.insights.bestDay.taxa}% conversão</p>
                <p className="text-xs text-gray-400">{temporalData.insights.bestDay.leads} leads</p>
                <p className="text-xs text-green-400 mt-1">
                  {getVolumeIndicator(temporalData.insights.bestDay.leads, temporalData.insights.totalValidLeads).message}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-400">Dados Insuficientes</p>
                </div>
                <p className="text-xs text-gray-400">
                  Nenhum dia com volume significativo (≥5% do total)
                </p>
                <p className="text-xs text-gray-500">
                  {temporalData.insights.significantDays} de 7 dias com dados suficientes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={`${temporalData.insights.bestHour ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">MELHOR HORÁRIO</span>
            </div>
            {temporalData.insights.bestHour ? (
              <>
                <p className="text-lg font-bold text-white">{temporalData.insights.bestHour.hourLabel}</p>
                <p className="text-sm text-green-300">{temporalData.insights.bestHour.taxa}% conversão</p>
                <p className="text-xs text-gray-400">{temporalData.insights.bestHour.leads} leads</p>
                <p className="text-xs text-green-400 mt-1">
                  {getVolumeIndicator(temporalData.insights.bestHour.leads, temporalData.insights.totalValidLeads).message}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-400">Dados Insuficientes</p>
                </div>
                <p className="text-xs text-gray-400">
                  Nenhum horário com volume significativo (≥5% do total)
                </p>
                <p className="text-xs text-gray-500">
                  {temporalData.insights.significantHours} horários com dados suficientes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">LEADS ANALISADOS</span>
            </div>
            <p className="text-lg font-bold text-white">{temporalData.insights.totalValidLeads}</p>
            <p className="text-sm text-purple-300">com data válida</p>
            <p className="text-xs text-gray-400">excluindo mentorados</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Dia da Semana */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Performance por Dia da Semana
          </CardTitle>
          <p className="text-sm text-gray-400">
            Análise considera apenas dias com pelo menos 5% do volume total de leads
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={temporalData.dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" fill="#60a5fa" name="Leads Recebidos" radius={[2, 2, 0, 0]} />
              <Bar dataKey="conversoes" fill="#34d399" name="Conversões" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise por Horário */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Performance por Horário do Dia
          </CardTitle>
          <p className="text-sm text-gray-400">
            Taxas de conversão com 1 casa decimal | Insights baseados em volume ≥5%
          </p>
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
                name="Leads Recebidos"
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

          {/* Top 3 Horários com Volume Significativo */}
          {temporalData.insights.peakHours.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-200 mb-3">
                Melhores Horários de Conversão (Volume ≥5%)
              </h4>
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
                      {hour.conversoes}/{hour.leads} leads • {hour.taxa}% conversão
                    </p>
                    <p className="text-xs text-green-400">
                      {getVolumeIndicator(hour.leads, temporalData.insights.totalValidLeads).percentage.toFixed(1)}% do total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Dados Insuficientes para Ranking</span>
              </div>
              <p className="text-sm text-gray-300">
                Nenhum horário possui volume significativo (≥5% do total) para análise confiável.
                Apenas {temporalData.insights.significantHours} horários têm dados suficientes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendência dos Últimos 30 Dias */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Tendência dos Últimos 30 Dias
          </CardTitle>
          <p className="text-sm text-gray-400">
            Volume diário de leads e vendas efetivadas
          </p>
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
                name="Leads Recebidos"
                strokeWidth={3}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversoes" 
                stroke="#34d399" 
                name="Vendas Fechadas"
                strokeWidth={3}
                dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">Leads Recebidos:</strong> Número de novos leads que chegaram em cada dia<br/>
              <strong className="text-green-400">Vendas Fechadas:</strong> Quantidade de leads que efetivamente compraram (status "Fechou")<br/>
              <strong className="text-yellow-400">Critério de Análise:</strong> Insights considerados apenas com volume ≥5% para maior confiabilidade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TemporalAnalysis.displayName = 'TemporalAnalysis';
