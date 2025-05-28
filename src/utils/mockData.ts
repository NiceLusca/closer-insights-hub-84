
import { parseISO, format, subDays, addDays } from 'date-fns';
import type { Lead } from '@/types/lead';

export function generateMockData(count: number = 500): Lead[] {
  console.log('🎭 Gerando dados mock com', count, 'leads');

  // Usar os status exatos da interface Lead
  const status: Lead['Status'][] = ['Agendado', 'Fechou', 'Não Apareceu', 'Desmarcou', 'Não Fechou', 'Remarcou', 'Confirmado', 'Aguardando resposta', 'Número errado', 'Mentorado'];
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
      row_number: i + 1,
      data: dateString,
      Hora: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      Nome: `Lead ${i + 1}`,
      'e-mail': `lead${i + 1}@email.com`,
      Whatsapp: `+55 11 9${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      Status: leadStatus,
      Closer: closers[Math.floor(Math.random() * closers.length)],
      origem: origens[Math.floor(Math.random() * origens.length)],
      'Venda Completa': vendaCompleta,
      recorrente: vendaCompleta > 0 ? Math.floor(vendaCompleta * 0.1) : 0,
      parsedDate: leadDate, // Adicionando a data parseada diretamente
    };

    leads.push(lead);
  }

  console.log('✅ Dados mock gerados:', leads.length, 'leads');
  console.log('📅 Exemplo de lead com data:', leads[0]?.data, leads[0]?.parsedDate);
  
  return leads;
}
