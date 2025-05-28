
import { parseISO, parse, isValid, format } from 'date-fns';
import type { Lead } from '@/types/lead';

export async function fetchLeadsFromWebhook(): Promise<Lead[]> {
  console.log('🔌 Buscando dados do webhook...');
  
  try {
    const response = await fetch('https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Dados recebidos:', { tipo: typeof data, isArray: Array.isArray(data), quantidade: data?.length || 0 });
    
    if (!Array.isArray(data)) {
      console.log('⚠️ Dados não são um array, retornando vazio');
      return [];
    }

    if (data.length === 0) {
      console.log('⚠️ Array vazio recebido');
      return [];
    }

    // Log das chaves encontradas nos primeiros itens
    if (data.length > 0) {
      console.log('🔑 Chaves encontradas no primeiro item:', Object.keys(data[0]));
      console.log('📄 Primeiro item completo:', data[0]);
    }

    const processedLeads = data.map((item: any, index: number) => {
      // Função para mapear campos com múltiplas possibilidades
      const findValue = (possibleKeys: string[], defaultValue: any = '') => {
        for (const key of possibleKeys) {
          if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
            return item[key];
          }
        }
        return defaultValue;
      };

      // Processar data
      const dateValue = findValue([
        'data', 'Data', 'DATE', 'date', 'created_at', 'createdAt', 
        'timestamp', 'data_criacao', 'dt_criacao'
      ], '');

      let parsedDate: Date | undefined;
      
      if (dateValue) {
        const dateFormats = [
          'dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy',
          'dd/MM/yyyy HH:mm:ss', 'yyyy-MM-dd HH:mm:ss'
        ];
        
        for (const formatStr of dateFormats) {
          try {
            const testDate = parse(dateValue.toString(), formatStr, new Date());
            if (isValid(testDate) && testDate.getFullYear() >= 2020) {
              parsedDate = testDate;
              break;
            }
          } catch (e) {
            // Continue tentando outros formatos
          }
        }
        
        if (!parsedDate) {
          try {
            const isoDate = parseISO(dateValue.toString());
            if (isValid(isoDate)) {
              parsedDate = isoDate;
            }
          } catch (e) {
            // Data inválida, continuar sem data
          }
        }
      }

      // Processar valores numéricos
      const parseNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };

      const lead: Lead = {
        row_number: index + 1,
        
        data: dateValue.toString() || '',
        
        Hora: findValue([
          'Hora', 'hora', 'time', 'horario', 'hour'
        ], ''),
        
        Nome: findValue([
          'Nome', 'nome', 'name', 'cliente', 'lead_name', 'full_name'
        ], `Lead ${index + 1}`),
        
        'e-mail': findValue([
          'e-mail', 'email', 'Email', 'mail', 'endereco_email'
        ], ''),
        
        Whatsapp: findValue([
          'Whatsapp', 'whatsapp', 'telefone', 'phone', 'celular', 'numero'
        ], ''),
        
        Status: findValue([
          'Status', 'status', 'estado', 'situacao', 'stage'
        ], ''),
        
        Closer: findValue([
          'Closer', 'closer', 'vendedor', 'consultor', 'responsavel'
        ], ''),
        
        origem: findValue([
          'origem', 'Origem', 'source', 'canal', 'campaign', 'midia'
        ], ''),
        
        'Venda Completa': parseNumber(findValue([
          'Venda Completa', 'vendaCompleta', 'valor', 'price', 'total', 'amount'
        ], 0)),
        
        recorrente: parseNumber(findValue([
          'recorrente', 'Recorrente', 'recurring', 'valor_recorrente', 'monthly'
        ], 0)),
        
        parsedDate: parsedDate,
      };

      return lead;
    }).filter(lead => {
      // Filtrar apenas leads com nome válido
      const hasValidName = lead.Nome && lead.Nome !== '' && !lead.Nome.startsWith('Lead ');
      return hasValidName;
    });

    console.log('✅ Processamento concluído:', {
      recebidos: data.length,
      processados: processedLeads.length,
      comData: processedLeads.filter(l => l.parsedDate).length
    });
    
    return processedLeads;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    throw error;
  }
}
