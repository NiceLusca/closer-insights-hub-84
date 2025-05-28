
export function findFieldValue(item: any, possibleKeys: readonly string[], defaultValue: any = ''): any {
  console.log('🔍 Procurando campo:', { 
    possibleKeys: possibleKeys.slice(0, 3), // mostrar só os primeiros 3 para não poluir
    totalPossibleKeys: possibleKeys.length,
    availableKeys: Object.keys(item).slice(0, 10) // mostrar só as primeiras 10
  });
  
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
  
  console.log('⚠️ Campo não encontrado, usando valor padrão:', { possibleKeys: possibleKeys.slice(0, 3), defaultValue });
  return defaultValue;
}

// MELHORADA: função para detectar colunas de data automaticamente
export function detectDateColumn(item: any): string | null {
  console.log('🔍 ========== DETECTANDO COLUNA DE DATA AUTOMATICAMENTE ==========');
  
  const allKeys = Object.keys(item);
  console.log('🔑 Todas as chaves disponíveis:', allKeys);
  
  // Padrões mais específicos que indicam data
  const datePatterns = [
    /^data$/i, /^date$/i, /^created$/i, /^timestamp$/i,
    /data.*criacao/i, /data.*cadastro/i, /data.*registro/i, /data.*entrada/i,
    /created.*at/i, /created.*date/i, /registration.*date/i,
    /lead.*date/i, /date.*created/i
  ];
  
  // Primeiro, procurar por padrões de nome exatos
  for (const key of allKeys) {
    console.log(`🔍 Analisando chave: "${key}"`);
    
    // Verificar se a chave parece ser de data
    const isDateKey = datePatterns.some(pattern => {
      const matches = pattern.test(key);
      if (matches) {
        console.log(`✅ Padrão "${pattern}" corresponde à chave "${key}"`);
      }
      return matches;
    });
    
    if (isDateKey) {
      const value = item[key];
      console.log(`🎯 Possível coluna de data encontrada: "${key}" = "${value}"`);
      
      // Verificar se o valor parece ser uma data válida
      if (value && typeof value === 'string') {
        console.log(`🧪 Testando se o valor "${value}" parece ser uma data...`);
        
        // Padrões que indicam que é uma data - INCLUINDO FORMATOS BRASILEIROS
        const dateValuePatterns = [
          /^\d{4}-\d{1,2}-\d{1,2}/, // 2024-01-01, 2024-1-1
          /^\d{1,2}\/\d{1,2}\/\d{4}/, // 01/01/2024, 1/1/2024
          /^\d{1,2}-\d{1,2}-\d{4}/, // 01-01-2024, 1-1-2024
          /^\d{8}$/, // 20240101
          /^\d{10,13}$/, // timestamp
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
          /\d{1,2}\s+\w{3}\s+\d{4}/, // 01 Jan 2024
          /^\d{1,2}\s+[a-záêç.]+\.?$/i // NOVO: 12 fev., 24 fev. (formato brasileiro)
        ];
        
        for (let i = 0; i < dateValuePatterns.length; i++) {
          const pattern = dateValuePatterns[i];
          if (pattern.test(value)) {
            console.log(`✅ Valor "${value}" corresponde ao padrão de data ${i + 1}: ${pattern}`);
            if (i === dateValuePatterns.length - 1) {
              console.log('🇧🇷 FORMATO BRASILEIRO DETECTADO!');
            }
            console.log('🎯 ========== COLUNA DE DATA DETECTADA! ==========');
            console.log('🎯 Coluna:', key);
            console.log('🎯 Valor exemplo:', value);
            return key;
          }
        }
        
        console.log(`❌ Valor "${value}" não corresponde a nenhum padrão de data conhecido`);
      } else {
        console.log(`❌ Valor não é string ou está vazio:`, value);
      }
    }
  }
  
  // Se não encontrou por padrões específicos, tentar qualquer chave que contenha palavras-chave
  console.log('🔍 Tentando busca mais ampla por palavras-chave...');
  const broadDateKeywords = ['data', 'date', 'created', 'time', 'timestamp'];
  
  for (const keyword of broadDateKeywords) {
    for (const key of allKeys) {
      if (key.toLowerCase().includes(keyword.toLowerCase())) {
        const value = item[key];
        console.log(`🎯 Chave "${key}" contém palavra-chave "${keyword}", valor: "${value}"`);
        
        if (value && typeof value === 'string' && value.length > 4) {
          console.log(`✅ Usando "${key}" como coluna de data (busca ampla)`);
          return key;
        }
      }
    }
  }
  
  console.log('❌ ========== NENHUMA COLUNA DE DATA DETECTADA ==========');
  return null;
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

// EXPANDIR AINDA MAIS os mapeamentos com base em problemas reais
export const FIELD_MAPPINGS = {
  data: [
    // Variações mais específicas primeiro
    'data', 'Data', 'DATA', 'date', 'Date', 'DATE',
    'created_at', 'createdAt', 'created', 'timestamp', 'Timestamp',
    'data_criacao', 'dt_criacao', 'data_cadastro', 'dt_cadastro',
    'datetime', 'dateTime', 'DateTime', 'data_hora', 'data_time',
    'registration_date', 'signup_date', 'lead_date',
    'Data de Criação', 'Data de Cadastro', 'Data do Lead', 'Data Lead',
    'data_lead', 'dataLead', 'lead_created_at', 'leadCreatedAt',
    'created_date', 'createdDate', 'dt_create', 'dt_created',
    'data_entrada', 'dataEntrada', 'entry_date', 'entryDate',
    'data_criado', 'dataCriado', 'data_registro', 'dataRegistro',
    'created', 'Created', 'CREATED', 'criado', 'Criado', 'CRIADO',
    'data_lead_criacao', 'dataLeadCriacao', 'lead_creation_date',
    'webhook_date', 'webhookDate', 'form_date', 'formDate',
    'submission_date', 'submissionDate', 'capture_date', 'captureDate',
    // NOVOS padrões mais específicos baseados em webhooks reais
    'lead_datetime', 'leadDatetime', 'form_submission_date', 'formSubmissionDate',
    'contact_date', 'contactDate', 'inquiry_date', 'inquiryDate'
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
    'Nome Completo', 'Nome do Lead', 'Cliente Nome', 'Lead Name',
    'nome_completo', 'nomeCompleto', 'nome_cliente', 'nomeCliente',
    'contact_name', 'contactName', 'lead_nome', 'leadNome'
  ],
  email: [
    'e-mail', 'email', 'Email', 'EMAIL', 'E-mail', 'E-MAIL',
    'mail', 'Mail', 'MAIL', 'endereco_email', 'enderecoEmail',
    'email_address', 'emailAddress', 'contact_email', 'user_email',
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
    'WhatsApp', 'Número WhatsApp', 'Telefone WhatsApp', 'Celular WhatsApp',
    'whatsapp_number', 'whatsappNumber', 'numero_whatsapp', 'numeroWhatsapp',
    'phone_number', 'phoneNumber', 'contact_phone', 'contactPhone',
    'lead_phone', 'leadPhone', 'cliente_telefone', 'clienteTelefone'
  ],
  status: [
    'Status', 'status', 'STATUS', 'estado', 'Estado', 'ESTADO',
    'situacao', 'Situacao', 'SITUACAO', 'stage', 'Stage', 'STAGE',
    'phase', 'Phase', 'PHASE', 'etapa', 'Etapa', 'ETAPA',
    'Status do Lead', 'Status Lead', 'Lead Status', 'Situação do Lead',
    'status_lead', 'statusLead', 'lead_status', 'leadStatus',
    'current_status', 'currentStatus', 'status_atual', 'statusAtual'
  ],
  closer: [
    'Closer', 'closer', 'CLOSER', 'vendedor', 'Vendedor', 'VENDEDOR',
    'consultor', 'Consultor', 'CONSULTOR', 'responsavel', 'Responsavel', 'RESPONSAVEL',
    'agent', 'Agent', 'AGENT', 'seller', 'Seller', 'SELLER',
    'atendente', 'Atendente', 'ATENDENTE', 'usuario', 'assigned_to',
    'Responsável', 'Responsável pelo Lead', 'Vendedor Responsável',
    'closer_responsavel', 'closerResponsavel', 'vendedor_lead', 'vendedorLead',
    'assigned_user', 'assignedUser', 'owner', 'Owner', 'proprietario'
  ],
  origem: [
    'origem', 'Origem', 'ORIGEM', 'source', 'Source', 'SOURCE',
    'canal', 'Canal', 'CANAL', 'campaign', 'Campaign', 'CAMPAIGN',
    'midia', 'Midia', 'MIDIA', 'media', 'Media', 'MEDIA',
    'utm_source', 'utmSource', 'lead_source', 'leadSource', 'traffic_source',
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
    'Valor da Venda', 'Valor Total', 'Receita Total', 'Sale Amount',
    'valor_venda', 'valorVenda', 'venda_valor', 'vendaValor',
    'deal_amount', 'dealAmount', 'transaction_value', 'transactionValue'
  ],
  recorrente: [
    'recorrente', 'Recorrente', 'RECORRENTE', 'recurring', 'Recurring', 'RECURRING',
    'valor_recorrente', 'valorRecorrente', 'monthly', 'Monthly', 'MONTHLY',
    'mensal', 'Mensal', 'MENSAL', 'subscription', 'Subscription', 'SUBSCRIPTION',
    'recurring_value', 'recurringValue', 'mrr', 'MRR',
    'Valor Recorrente', 'Receita Recorrente', 'Mensalidade', 'Monthly Revenue',
    'mrr_value', 'mrrValue', 'subscription_value', 'subscriptionValue',
    'valor_mensal', 'valorMensal', 'receita_mensal', 'receitaMensal'
  ]
} as const;
