
import type { Lead } from "@/types/lead";

const WEBHOOK_URL = "https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul";

export interface WebhookLead {
  row_number: number;
  data: string | number;
  Hora: string;
  Nome: string;
  'e-mail': string;
  Whatsapp: string;
  origem: string;
  Status: 'Agendado' | 'Não Apareceu' | 'Desmarcou' | 'Fechou' | 'Mentorado' | 'Remarcou' | 'Confirmado' | 'Aguardando resposta' | 'Número errado' | 'Não Fechou' | '';
  Closer: string;
  'Venda Completa': number | string;
  recorrente: number | string;
  'Coluna 1'?: string;
}

function parseWebhookDate(dateStr: string | number): Date | undefined {
  try {
    // Converter para string se for número
    const dateString = String(dateStr).trim();
    console.log('Parseando data:', dateString);
    
    // Se está vazio, retornar undefined
    if (!dateString || dateString === '') {
      console.log('Data vazia, retornando undefined');
      return undefined;
    }
    
    // Format: "DD MMM." - exemplo: "15 Jan.", "03 fev."
    const cleanDate = dateString.replace('.', '').trim();
    const currentYear = new Date().getFullYear();
    
    const months: Record<string, number> = {
      'Jan': 0, 'jan': 0, 'Fev': 1, 'fev': 1, 'Mar': 2, 'mar': 2, 
      'Abr': 3, 'abr': 3, 'Mai': 4, 'mai': 4, 'Jun': 5, 'jun': 5,
      'Jul': 6, 'jul': 6, 'Ago': 7, 'ago': 7, 'Set': 8, 'set': 8, 
      'Out': 9, 'out': 9, 'Nov': 10, 'nov': 10, 'Dez': 11, 'dez': 11
    };
    
    const parts = cleanDate.split(' ');
    if (parts.length >= 2) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const month = months[monthStr];
      
      console.log(`Dia: ${day}, Mês: ${monthStr} (${month})`);
      
      if (month !== undefined && !isNaN(day) && day >= 1 && day <= 31) {
        const parsedDate = new Date(currentYear, month, day);
        console.log('Data parseada com sucesso:', parsedDate);
        return parsedDate;
      }
    }
    
    console.log('Formato de data não reconhecido:', cleanDate);
  } catch (error) {
    console.error('Erro ao parsear data:', dateStr, error);
  }
  return undefined;
}

function normalizeWebhookLead(webhookLead: WebhookLead): Lead {
  console.log('Normalizando lead:', webhookLead);
  
  // Normalizar valores numéricos
  const vendaCompleta = typeof webhookLead['Venda Completa'] === 'string' 
    ? (webhookLead['Venda Completa'] === '' ? 0 : parseFloat(webhookLead['Venda Completa']) || 0)
    : (webhookLead['Venda Completa'] || 0);

  const recorrente = typeof webhookLead.recorrente === 'string'
    ? (webhookLead.recorrente === '' ? 0 : parseFloat(webhookLead.recorrente) || 0)
    : (webhookLead.recorrente || 0);

  // Normalizar campos de texto
  const status = webhookLead.Status || '';
  const closer = webhookLead.Closer || '';
  const origem = webhookLead.origem || '';
  
  const normalizedLead: Lead = {
    row_number: webhookLead.row_number,
    data: String(webhookLead.data),
    Hora: webhookLead.Hora || '',
    Nome: webhookLead.Nome || '',
    'e-mail': webhookLead['e-mail'] || '',
    Whatsapp: webhookLead.Whatsapp || '',
    origem: origem,
    Status: status as Lead['Status'],
    Closer: closer,
    'Venda Completa': vendaCompleta,
    recorrente: recorrente,
    'Coluna 1': webhookLead['Coluna 1'],
    parsedDate: parseWebhookDate(webhookLead.data)
  };
  
  console.log('Lead normalizado:', normalizedLead);
  return normalizedLead;
}

export async function fetchLeadsFromWebhook(): Promise<Lead[]> {
  try {
    console.log('Buscando dados do webhook:', WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados recebidos do webhook:', data);

    // Se os dados são um array, processar cada item
    if (Array.isArray(data)) {
      const normalizedData = data.map(normalizeWebhookLead);
      
      // Debug: verificar quantos leads têm data parseada
      const leadsWithDate = normalizedData.filter(lead => lead.parsedDate);
      console.log(`${leadsWithDate.length} de ${normalizedData.length} leads têm data parseada`);
      
      // Debug: verificar distribuição de status
      const statusCount = normalizedData.reduce((acc, lead) => {
        acc[lead.Status] = (acc[lead.Status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Distribuição de status:', statusCount);
      
      console.log('Dados normalizados:', normalizedData);
      return normalizedData;
    }
    
    // Se é um objeto único, colocar em array
    if (data && typeof data === 'object') {
      return [normalizeWebhookLead(data as WebhookLead)];
    }

    console.warn('Formato de dados inesperado do webhook:', data);
    return [];
    
  } catch (error) {
    console.error('Erro ao buscar dados do webhook:', error);
    throw error;
  }
}
