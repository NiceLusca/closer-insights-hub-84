
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
  Status: 'Agendado' | 'Não Apareceu' | 'Desmarcou' | 'Fechou' | 'Mentorado' | 'Remarcou' | 'Confirmado' | 'Aguardando resposta' | 'Número errado';
  Closer: string;
  'Venda Completa': number | string;
  recorrente: number | string;
  'Coluna 1'?: string;
}

function parseWebhookDate(dateStr: string | number): Date | undefined {
  try {
    // Converter para string se for número
    const dateString = String(dateStr);
    
    // Format: "DD MMM." - exemplo: "15 Jan."
    const cleanDate = dateString.replace('.', '').trim();
    const currentYear = new Date().getFullYear();
    
    const months: Record<string, number> = {
      'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
      'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
    };
    
    const [day, monthStr] = cleanDate.split(' ');
    const month = months[monthStr];
    
    if (month !== undefined && day) {
      return new Date(currentYear, month, parseInt(day));
    }
  } catch (error) {
    console.error('Erro ao parsear data:', dateStr, error);
  }
  return undefined;
}

function normalizeWebhookLead(webhookLead: WebhookLead): Lead {
  // Normalizar valores numéricos
  const vendaCompleta = typeof webhookLead['Venda Completa'] === 'string' 
    ? (webhookLead['Venda Completa'] === '' ? 0 : parseFloat(webhookLead['Venda Completa']) || 0)
    : (webhookLead['Venda Completa'] || 0);

  const recorrente = typeof webhookLead.recorrente === 'string'
    ? (webhookLead.recorrente === '' ? 0 : parseFloat(webhookLead.recorrente) || 0)
    : (webhookLead.recorrente || 0);

  return {
    row_number: webhookLead.row_number,
    data: String(webhookLead.data),
    Hora: webhookLead.Hora || '',
    Nome: webhookLead.Nome || '',
    'e-mail': webhookLead['e-mail'] || '',
    Whatsapp: webhookLead.Whatsapp || '',
    origem: webhookLead.origem || '',
    Status: webhookLead.Status,
    Closer: webhookLead.Closer || '',
    'Venda Completa': vendaCompleta,
    recorrente: recorrente,
    'Coluna 1': webhookLead['Coluna 1'],
    parsedDate: parseWebhookDate(webhookLead.data)
  };
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
