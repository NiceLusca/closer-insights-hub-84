
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
    console.log('📦 Dados brutos recebidos:', data);
    console.log('📦 Tipo dos dados:', typeof data);
    console.log('📦 É array?', Array.isArray(data));
    
    if (!Array.isArray(data)) {
      console.log('⚠️ Dados não são um array, retornando vazio');
      return [];
    }

    // ANÁLISE DETALHADA DA ESTRUTURA DOS DADOS
    if (data.length > 0) {
      console.log('🔍 =========================');
      console.log('🔍 ANÁLISE DETALHADA DA ESTRUTURA:');
      console.log('🔍 =========================');
      
      // Mostrar todos os itens para identificar padrões
      data.slice(0, 5).forEach((item, index) => {
        console.log(`📋 ITEM ${index + 1}:`, JSON.stringify(item, null, 2));
        console.log(`🔑 Chaves do item ${index + 1}:`, Object.keys(item));
        
        // Analisar cada chave e valor
        Object.entries(item).forEach(([key, value]) => {
          console.log(`  📝 "${key}": "${value}" (tipo: ${typeof value})`);
        });
        console.log('---');
      });
      
      // Compilar todas as chaves únicas encontradas
      const allKeys = new Set<string>();
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });
      
      console.log('🔑 TODAS AS CHAVES ÚNICAS ENCONTRADAS:');
      console.log(Array.from(allKeys).sort());
      
      // Identificar possíveis campos de data
      console.log('📅 ANÁLISE DE CAMPOS DE DATA:');
      Array.from(allKeys).forEach(key => {
        if (key.toLowerCase().includes('data') || 
            key.toLowerCase().includes('date') || 
            key.toLowerCase().includes('created') ||
            key.toLowerCase().includes('timestamp')) {
          console.log(`  📅 Possível campo de data encontrado: "${key}"`);
          // Mostrar valores de exemplo
          const sampleValues = data.slice(0, 3).map(item => item[key]).filter(val => val);
          console.log(`    Valores de exemplo:`, sampleValues);
        }
      });
    }

    const processedLeads = data.map((item: any, index: number) => {
      console.log(`🔍 Processando item ${index + 1}:`, item);
      
      // MAPEAMENTO FLEXÍVEL EXPANDIDO baseado em possíveis renomeações
      const flexibleMapping = (possibleKeys: string[], defaultValue: any = '') => {
        for (const key of possibleKeys) {
          if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
            console.log(`✅ Encontrado valor para "${key}": "${item[key]}"`);
            return item[key];
          }
        }
        console.log(`⚠️ Nenhum valor encontrado para as chaves:`, possibleKeys);
        return defaultValue;
      };

      // MAPEAMENTO DE DATA com todas as possibilidades
      const possibleDateFields = [
        'data', 'Data', 'DATA', 'date', 'Date', 'DATE',
        'created_at', 'createdAt', 'created', 'Created',
        'timestamp', 'Timestamp', 'TIMESTAMP',
        'data_criacao', 'dataCriacao', 'data_lead',
        'dt_criacao', 'dt_lead', 'dt_data'
      ];
      
      let dateValue = '';
      let usedDateField = '';
      
      for (const field of possibleDateFields) {
        if (item[field] && item[field].toString().trim()) {
          dateValue = item[field].toString().trim();
          usedDateField = field;
          console.log(`📅 Encontrado campo de data "${field}": "${dateValue}"`);
          break;
        }
      }

      // PROCESSAR DATA com múltiplos formatos
      let parsedDate: Date | undefined;
      
      if (dateValue) {
        console.log(`📅 Tentando parsear data: "${dateValue}"`);
        
        const dateFormats = [
          'dd/MM/yyyy', 'dd/MM/yy', 'MM/dd/yyyy', 'MM/dd/yy',
          'yyyy-MM-dd', 'yyyy/MM/dd', 'dd-MM-yyyy', 'dd-MM-yy',
          'dd/MM/yyyy HH:mm:ss', 'dd/MM/yyyy HH:mm',
          'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm'
        ];
        
        for (const formatStr of dateFormats) {
          try {
            const testDate = parse(dateValue, formatStr, new Date());
            if (isValid(testDate) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
              parsedDate = testDate;
              console.log(`✅ Data parseada com formato ${formatStr}:`, format(parsedDate, 'dd/MM/yyyy'));
              break;
            }
          } catch (e) {
            // Continuar tentando
          }
        }
        
        // Tentar parseISO se outros formatos falharam
        if (!parsedDate) {
          try {
            const isoDate = parseISO(dateValue);
            if (isValid(isoDate)) {
              parsedDate = isoDate;
              console.log('✅ Data parseada com ISO:', format(parsedDate, 'dd/MM/yyyy'));
            }
          } catch (e) {
            console.warn(`❌ Não foi possível parsear a data: ${dateValue}`);
          }
        }
      }

      // MAPEAMENTO DE TODOS OS CAMPOS com possíveis renomeações
      const lead: Lead = {
        row_number: flexibleMapping([
          'row_number', 'id', 'index', 'numero', 'num', 'linha'
        ], index + 1),
        
        data: dateValue || '',
        
        Hora: flexibleMapping([
          'Hora', 'hora', 'HORA', 'time', 'Time', 'TIME',
          'horario', 'Horario', 'HORARIO', 'hour'
        ], ''),
        
        Nome: flexibleMapping([
          'Nome', 'nome', 'NOME', 'name', 'Name', 'NAME',
          'cliente', 'Cliente', 'CLIENTE', 'lead_name',
          'full_name', 'fullName', 'nome_completo'
        ], `Lead ${index + 1}`),
        
        'e-mail': flexibleMapping([
          'e-mail', 'email', 'Email', 'EMAIL', 'E-mail', 'E-MAIL',
          'mail', 'Mail', 'MAIL', 'endereco_email', 'enderecoEmail'
        ], ''),
        
        Whatsapp: flexibleMapping([
          'Whatsapp', 'whatsapp', 'WhatsApp', 'WHATSAPP',
          'telefone', 'Telefone', 'TELEFONE', 'phone', 'Phone',
          'celular', 'Celular', 'CELULAR', 'mobile', 'numero',
          'fone', 'tel', 'contato'
        ], ''),
        
        Status: flexibleMapping([
          'Status', 'status', 'STATUS', 'estado', 'Estado',
          'situacao', 'Situacao', 'SITUACAO', 'stage', 'Stage'
        ], ''),
        
        Closer: flexibleMapping([
          'Closer', 'closer', 'CLOSER', 'vendedor', 'Vendedor',
          'VENDEDOR', 'consultor', 'Consultor', 'CONSULTOR',
          'responsavel', 'Responsavel', 'assigned_to'
        ], ''),
        
        origem: flexibleMapping([
          'origem', 'Origem', 'ORIGEM', 'source', 'Source', 'SOURCE',
          'canal', 'Canal', 'CANAL', 'campaign', 'Campaign',
          'midia', 'Midia', 'MIDIA', 'traffic_source'
        ], ''),
        
        'Venda Completa': parseFloat(flexibleMapping([
          'Venda Completa', 'vendaCompleta', 'venda_completa',
          'valor', 'Valor', 'VALOR', 'price', 'Price',
          'total', 'Total', 'TOTAL', 'amount', 'Amount',
          'valor_venda', 'valorVenda', 'sale_amount'
        ], '0')) || 0,
        
        recorrente: parseFloat(flexibleMapping([
          'recorrente', 'Recorrente', 'RECORRENTE',
          'recurring', 'Recurring', 'RECURRING',
          'valor_recorrente', 'valorRecorrente',
          'monthly', 'Monthly', 'mensal', 'Mensal'
        ], '0')) || 0,
        
        parsedDate: parsedDate,
      };

      console.log(`${parsedDate ? '✅' : '❌'} Lead processado:`, {
        nome: lead.Nome,
        email: lead['e-mail'],
        whatsapp: lead.Whatsapp,
        status: lead.Status,
        closer: lead.Closer,
        origem: lead.origem,
        data: lead.data,
        parsedDate: parsedDate ? format(parsedDate, 'dd/MM/yyyy') : 'INVÁLIDA',
        valor: lead['Venda Completa'],
        recorrente: lead.recorrente,
        originalKeys: Object.keys(item)
      });

      return lead;
    }).filter(lead => {
      // Filtrar leads com pelo menos nome ou data válida
      const hasValidName = lead.Nome && lead.Nome !== '' && !lead.Nome.startsWith('Lead ');
      const hasValidDate = lead.parsedDate;
      
      if (!hasValidName && !hasValidDate) {
        console.log(`❌ Lead descartado - sem nome válido nem data: ${lead.Nome}`);
        return false;
      }
      
      return true;
    });

    console.log('✅ RESUMO DO PROCESSAMENTO:');
    console.log(`📊 Total de itens recebidos: ${data.length}`);
    console.log(`📊 Leads processados com sucesso: ${processedLeads.length}`);
    console.log(`📊 Taxa de sucesso: ${((processedLeads.length / data.length) * 100).toFixed(1)}%`);
    
    if (processedLeads.length > 0) {
      console.log('📊 Amostra de leads processados:', processedLeads.slice(0, 3));
      
      // Estatísticas dos campos preenchidos
      const stats = {
        comNome: processedLeads.filter(l => l.Nome && !l.Nome.startsWith('Lead ')).length,
        comEmail: processedLeads.filter(l => l['e-mail']).length,
        comWhatsapp: processedLeads.filter(l => l.Whatsapp).length,
        comStatus: processedLeads.filter(l => l.Status).length,
        comCloser: processedLeads.filter(l => l.Closer).length,
        comOrigem: processedLeads.filter(l => l.origem).length,
        comData: processedLeads.filter(l => l.parsedDate).length,
        comValor: processedLeads.filter(l => l['Venda Completa'] > 0).length
      };
      
      console.log('📈 ESTATÍSTICAS DOS CAMPOS PREENCHIDOS:');
      Object.entries(stats).forEach(([campo, count]) => {
        const percentage = ((count / processedLeads.length) * 100).toFixed(1);
        console.log(`  ${campo}: ${count}/${processedLeads.length} (${percentage}%)`);
      });
    }
    
    return processedLeads;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do webhook:', error);
    console.error('❌ Detalhes do erro:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
