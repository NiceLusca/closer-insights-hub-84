
export interface Lead {
  row_number: number;
  data: string;
  Hora: string;
  Nome: string;
  'e-mail': string;
  Whatsapp: string;
  origem: string;
  Status: 'Agendado' | 'Não Apareceu' | 'Desmarcou' | 'Fechou' | 'Mentorado' | 'Remarcou' | 'Confirmado' | 'Aguardando resposta' | 'Número errado' | 'Não Fechou' | '';
  Closer: string;
  'Venda Completa': number;
  recorrente: number;
  'Coluna 1'?: string;
  parsedDate?: Date;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Filters {
  status: string[];
  closer: string[];
  origem: string[];
}

// Interface completa com todas as propriedades necessárias
export interface Metrics {
  // Contadores básicos
  totalLeads: number;
  agendamentos: number;
  noShows: number;
  remarcacoes: number;
  fechamentos: number;
  confirmados: number;
  mentorados: number;
  
  // Receita
  receitaTotal: number;
  receitaRecorrente: number;
  receitaCompleta: number;
  
  // Vendas
  vendasCompletas: number;
  vendasRecorrentes: number;
  
  // Taxas principais
  taxaComparecimento: number;
  taxaFechamento: number;
  taxaDesmarque: number;
  aproveitamentoGeral: number;
  taxaNaoFechamento: number;
  
  // Grupos de classificação (novos)
  fechados: number;
  aSerAtendido: number;
  atendidoNaoFechou: number;
  perdidoInativo: number;
  apresentacoes: number;
  compareceram: number;
  
  // Métricas adicionais
  ticketMedio: number;
}
