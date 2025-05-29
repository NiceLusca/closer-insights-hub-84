
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
