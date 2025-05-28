
export function findFieldValue(item: any, possibleKeys: readonly string[], defaultValue: any = ''): any {
  console.log('🔍 Procurando campo:', { possibleKeys, availableKeys: Object.keys(item) });
  
  for (const key of possibleKeys) {
    // Case-sensitive match
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      console.log('✅ Campo encontrado (case-sensitive):', { key, value: item[key] });
      return item[key];
    }
    
    // Case-insensitive match
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === key.toLowerCase());
    if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && item[foundKey] !== '') {
      console.log('✅ Campo encontrado (case-insensitive):', { originalKey: foundKey, searchKey: key, value: item[foundKey] });
      return item[foundKey];
    }
  }
  
  console.log('⚠️ Campo não encontrado, usando valor padrão:', { possibleKeys, defaultValue });
  return defaultValue;
}

export function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

// Expandir mapeamentos com mais variações e case variations
export const FIELD_MAPPINGS = {
  data: [
    'data', 'Data', 'DATA', 'date', 'Date', 'DATE',
    'created_at', 'createdAt', 'created', 'timestamp', 'Timestamp',
    'data_criacao', 'dt_criacao', 'data_cadastro', 'dt_cadastro',
    'datetime', 'dateTime', 'DateTime', 'data_hora', 'data_time',
    'registration_date', 'signup_date', 'lead_date'
  ],
  hora: [
    'Hora', 'hora', 'HORA', 'time', 'Time', 'TIME',
    'horario', 'hour', 'hours', 'tempo', 'hr'
  ],
  nome: [
    'Nome', 'nome', 'NOME', 'name', 'Name', 'NAME',
    'cliente', 'Cliente', 'CLIENTE', 'lead_name', 'leadName',
    'full_name', 'fullName', 'first_name', 'firstName',
    'usuario', 'user', 'pessoa', 'person', 'contato'
  ],
  email: [
    'e-mail', 'email', 'Email', 'EMAIL', 'E-mail', 'E-MAIL',
    'mail', 'Mail', 'MAIL', 'endereco_email', 'enderecoEmail',
    'email_address', 'emailAddress', 'contact_email', 'user_email'
  ],
  whatsapp: [
    'Whatsapp', 'whatsapp', 'WHATSAPP', 'WhatsApp',
    'telefone', 'Telefone', 'TELEFONE', 'phone', 'Phone', 'PHONE',
    'celular', 'Celular', 'CELULAR', 'numero', 'Numero', 'NUMERO',
    'mobile', 'Mobile', 'MOBILE', 'tel', 'Tel', 'TEL',
    'contact', 'contato', 'fone', 'telephone'
  ],
  status: [
    'Status', 'status', 'STATUS', 'estado', 'Estado', 'ESTADO',
    'situacao', 'Situacao', 'SITUACAO', 'stage', 'Stage', 'STAGE',
    'phase', 'Phase', 'PHASE', 'etapa', 'Etapa', 'ETAPA'
  ],
  closer: [
    'Closer', 'closer', 'CLOSER', 'vendedor', 'Vendedor', 'VENDEDOR',
    'consultor', 'Consultor', 'CONSULTOR', 'responsavel', 'Responsavel', 'RESPONSAVEL',
    'agent', 'Agent', 'AGENT', 'seller', 'Seller', 'SELLER',
    'atendente', 'Atendente', 'ATENDENTE', 'usuario', 'assigned_to'
  ],
  origem: [
    'origem', 'Origem', 'ORIGEM', 'source', 'Source', 'SOURCE',
    'canal', 'Canal', 'CANAL', 'campaign', 'Campaign', 'CAMPAIGN',
    'midia', 'Midia', 'MIDIA', 'media', 'Media', 'MEDIA',
    'utm_source', 'utmSource', 'lead_source', 'leadSource', 'traffic_source'
  ],
  vendaCompleta: [
    'Venda Completa', 'vendaCompleta', 'VendaCompleta', 'VENDA_COMPLETA',
    'valor', 'Valor', 'VALOR', 'price', 'Price', 'PRICE',
    'total', 'Total', 'TOTAL', 'amount', 'Amount', 'AMOUNT',
    'receita', 'Receita', 'RECEITA', 'revenue', 'Revenue', 'REVENUE',
    'sale_value', 'saleValue', 'deal_value', 'dealValue'
  ],
  recorrente: [
    'recorrente', 'Recorrente', 'RECORRENTE', 'recurring', 'Recurring', 'RECURRING',
    'valor_recorrente', 'valorRecorrente', 'monthly', 'Monthly', 'MONTHLY',
    'mensal', 'Mensal', 'MENSAL', 'subscription', 'Subscription', 'SUBSCRIPTION',
    'recurring_value', 'recurringValue', 'mrr', 'MRR'
  ]
} as const;
