
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
  recorrente: number | string;
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

export interface Metrics {
  totalLeads: number;
  agendamentos: number;
  noShows: number;
  remarcacoes: number;
  fechamentos: number;
  receitaTotal: number;
  receitaRecorrente: number;
  taxaComparecimento: number;
  taxaFechamento: number;
  taxaDesmarque: number;
  confirmados: number;
  mentorados: number;
  aproveitamentoGeral: number;
  vendasCompletas: number;
  vendasRecorrentes: number;
  receitaCompleta: number;
}
