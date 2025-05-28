
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

// EXPANDIR AINDA MAIS os mapeamentos com variações de nomes de colunas
export const FIELD_MAPPINGS = {
  data: [
    // Variações básicas
    'data', 'Data', 'DATA', 'date', 'Date', 'DATE',
    'created_at', 'createdAt', 'created', 'timestamp', 'Timestamp',
    'data_criacao', 'dt_criacao', 'data_cadastro', 'dt_cadastro',
    'datetime', 'dateTime', 'DateTime', 'data_hora', 'data_time',
    'registration_date', 'signup_date', 'lead_date',
    // NOVAS variações mais comuns em webhooks
    'Data de Criação', 'Data de Cadastro', 'Data do Lead', 'Data Lead',
    'data_lead', 'dataLead', 'lead_created_at', 'leadCreatedAt',
    'created_date', 'createdDate', 'dt_create', 'dt_created',
    'data_entrada', 'dataEntrada', 'entry_date', 'entryDate',
    // Variações em português
    'data_criado', 'dataCriado', 'data_registro', 'dataRegistro'
  ],
  hora: [
    'Hora', 'hora', 'HORA', 'time', 'Time', 'TIME',
    'horario', 'hour', 'hours', 'tempo', 'hr',
    'Horário', 'horário', 'hora_criacao', 'horaCriacao'
  ],
  nome: [
    'Nome', 'nome', 'NOME', 'name', 'Name', 'NAME',
    'cliente', 'Cliente', 'CLIENTE', 'lead_name', 'leadName',
    'full_name', 'fullName', 'first_name', 'firstName',
    'usuario', 'user', 'pessoa', 'person', 'contato',
    // NOVAS variações
    'Nome Completo', 'Nome do Lead', 'Cliente Nome', 'Lead Name',
    'nome_completo', 'nomeCompleto', 'nome_cliente', 'nomeCliente',
    'contact_name', 'contactName', 'lead_nome', 'leadNome'
  ],
  email: [
    'e-mail', 'email', 'Email', 'EMAIL', 'E-mail', 'E-MAIL',
    'mail', 'Mail', 'MAIL', 'endereco_email', 'enderecoEmail',
    'email_address', 'emailAddress', 'contact_email', 'user_email',
    // NOVAS variações
    'E-mail do Lead', 'Email do Cliente', 'Lead Email', 'Cliente Email',
    'email_lead', 'emailLead', 'lead_email', 'leadEmail',
    'email_contato', 'emailContato', 'contato_email', 'contatoEmail'
  ],
  whatsapp: [
    'Whatsapp', 'whatsapp', 'WHATSAPP', 'WhatsApp',
    'telefone', 'Telefone', 'TELEFONE', 'phone', 'Phone', 'PHONE',
    'celular', 'Celular', 'CELULAR', 'numero', 'Numero', 'NUMERO',
    'mobile', 'Mobile', 'MOBILE', 'tel', 'Tel', 'TEL',
    'contact', 'contato', 'fone', 'telephone',
    // NOVAS variações
    'WhatsApp', 'Número WhatsApp', 'Telefone WhatsApp', 'Celular WhatsApp',
    'whatsapp_number', 'whatsappNumber', 'numero_whatsapp', 'numeroWhatsapp',
    'phone_number', 'phoneNumber', 'contact_phone', 'contactPhone',
    'lead_phone', 'leadPhone', 'cliente_telefone', 'clienteTelefone'
  ],
  status: [
    'Status', 'status', 'STATUS', 'estado', 'Estado', 'ESTADO',
    'situacao', 'Situacao', 'SITUACAO', 'stage', 'Stage', 'STAGE',
    'phase', 'Phase', 'PHASE', 'etapa', 'Etapa', 'ETAPA',
    // NOVAS variações
    'Status do Lead', 'Status Lead', 'Lead Status', 'Situação do Lead',
    'status_lead', 'statusLead', 'lead_status', 'leadStatus',
    'current_status', 'currentStatus', 'status_atual', 'statusAtual'
  ],
  closer: [
    'Closer', 'closer', 'CLOSER', 'vendedor', 'Vendedor', 'VENDEDOR',
    'consultor', 'Consultor', 'CONSULTOR', 'responsavel', 'Responsavel', 'RESPONSAVEL',
    'agent', 'Agent', 'AGENT', 'seller', 'Seller', 'SELLER',
    'atendente', 'Atendente', 'ATENDENTE', 'usuario', 'assigned_to',
    // NOVAS variações
    'Responsável', 'Responsável pelo Lead', 'Vendedor Responsável',
    'closer_responsavel', 'closerResponsavel', 'vendedor_lead', 'vendedorLead',
    'assigned_user', 'assignedUser', 'owner', 'Owner', 'proprietario'
  ],
  origem: [
    'origem', 'Origem', 'ORIGEM', 'source', 'Source', 'SOURCE',
    'canal', 'Canal', 'CANAL', 'campaign', 'Campaign', 'CAMPAIGN',
    'midia', 'Midia', 'MIDIA', 'media', 'Media', 'MEDIA',
    'utm_source', 'utmSource', 'lead_source', 'leadSource', 'traffic_source',
    // NOVAS variações
    'Origem do Lead', 'Canal de Origem', 'Fonte do Lead', 'Lead Source',
    'origem_lead', 'origemLead', 'canal_origem', 'canalOrigem',
    'fonte', 'Fonte', 'FONTE', 'campanha', 'Campanha', 'CAMPANHA'
  ],
  vendaCompleta: [
    'Venda Completa', 'vendaCompleta', 'VendaCompleta', 'VENDA_COMPLETA',
    'valor', 'Valor', 'VALOR', 'price', 'Price', 'PRICE',
    'total', 'Total', 'TOTAL', 'amount', 'Amount', 'AMOUNT',
    'receita', 'Receita', 'RECEITA', 'revenue', 'Revenue', 'REVENUE',
    'sale_value', 'saleValue', 'deal_value', 'dealValue',
    // NOVAS variações
    'Valor da Venda', 'Valor Total', 'Receita Total', 'Sale Amount',
    'valor_venda', 'valorVenda', 'venda_valor', 'vendaValor',
    'deal_amount', 'dealAmount', 'transaction_value', 'transactionValue'
  ],
  recorrente: [
    'recorrente', 'Recorrente', 'RECORRENTE', 'recurring', 'Recurring', 'RECURRING',
    'valor_recorrente', 'valorRecorrente', 'monthly', 'Monthly', 'MONTHLY',
    'mensal', 'Mensal', 'MENSAL', 'subscription', 'Subscription', 'SUBSCRIPTION',
    'recurring_value', 'recurringValue', 'mrr', 'MRR',
    // NOVAS variações
    'Valor Recorrente', 'Receita Recorrente', 'Mensalidade', 'Monthly Revenue',
    'mrr_value', 'mrrValue', 'subscription_value', 'subscriptionValue',
    'valor_mensal', 'valorMensal', 'receita_mensal', 'receitaMensal'
  ]
} as const;
