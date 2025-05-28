
import { parseISO, format, subDays, addDays } from 'date-fns';
import type { Lead } from '@/types/lead';

export function generateMockData(count: number = 500): Lead[] {
  console.log('🎭 Gerando dados mock com', count, 'leads');

  const status = ['Agendado', 'Fechou', 'No-Show', 'Reagendamento', 'Não Qualificado', 'Follow-up'];
  const closers = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Ferreira'];
  const origens = ['Facebook Ads', 'Google Ads', 'Instagram', 'Indicação', 'Site Orgânico', 'WhatsApp'];

  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    // Gerar data aleatória nos últimos 60 dias
    const randomDaysAgo = Math.floor(Math.random() * 60);
    const leadDate = subDays(new Date(), randomDaysAgo);
    const dateString = format(leadDate, 'dd/MM/yyyy');

    const leadStatus = status[Math.floor(Math.random() * status.length)];
    const vendaCompleta = leadStatus === 'Fechou' ? Math.floor(Math.random() * 5000) + 1000 : 0;

    const lead: Lead = {
      id: `mock-${i}`,
      Nome: `Lead ${i + 1}`,
      Status: leadStatus,
      Closer: closers[Math.floor(Math.random() * closers.length)],
      origem: origens[Math.floor(Math.random() * origens.length)],
      data: dateString,
      parsedDate: leadDate, // Adicionando a data parseada diretamente
      'Venda Completa': vendaCompleta,
      recorrente: vendaCompleta > 0 ? Math.floor(vendaCompleta * 0.1) : 0,
    };

    leads.push(lead);
  }

  console.log('✅ Dados mock gerados:', leads.length, 'leads');
  console.log('📅 Exemplo de lead com data:', leads[0]?.data, leads[0]?.parsedDate);
  
  return leads;
}
