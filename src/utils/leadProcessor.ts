
import type { Lead } from '@/types/lead';
import { parseDate } from './dateParser';
import { findFieldValue, parseNumber, FIELD_MAPPINGS, detectDateColumn } from './fieldMapper';

export function processRawDataToLeads(data: any[]): Lead[] {
  console.log('🔄 Processando dados brutos para leads:', { totalItens: data.length });
  
  if (data.length > 0) {
    console.log('📋 Exemplo do primeiro item:', data[0]);
    console.log('🔑 Chaves disponíveis no primeiro item:', Object.keys(data[0]));
    
    // NOVO: Tentar detectar coluna de data automaticamente
    const detectedDateColumn = detectDateColumn(data[0]);
    if (detectedDateColumn) {
      console.log('🎯 Coluna de data detectada automaticamente:', detectedDateColumn);
    }
    
    // Log adicional para identificar problemas de mapeamento
    console.log('🔍 Analisando campos disponíveis:');
    Object.keys(data[0]).forEach(key => {
      console.log(`- Campo: "${key}" = "${data[0][key]}"`);
    });
  }

  const processedLeads = data.map((item: any, index: number) => {
    console.log(`\n📊 Processando lead ${index + 1}:`);
    
    // MUDANÇA: Usar detecção automática como fallback
    let dateValue = findFieldValue(item, FIELD_MAPPINGS.data, '');
    
    // Se não encontrou data pelos mapeamentos, tentar detecção automática
    if (!dateValue) {
      const detectedColumn = detectDateColumn(item);
      if (detectedColumn) {
        dateValue = item[detectedColumn];
        console.log('🎯 Usando coluna detectada automaticamente para data:', detectedColumn, '=', dateValue);
      }
    }
    
    let parsedDate = dateValue ? parseDate(dateValue.toString()) : undefined;
    
    console.log('📅 Processamento de data:', {
      valorOriginal: dateValue,
      dataParsada: parsedDate?.toISOString() || 'não parseada',
      foiParseadaComSucesso: !!parsedDate
    });

    const nomeValue = findFieldValue(item, FIELD_MAPPINGS.nome, `Lead ${index + 1}`);
    const statusValue = findFieldValue(item, FIELD_MAPPINGS.status, '');
    
    console.log('📝 Dados básicos do lead:', {
      nome: nomeValue,
      status: statusValue,
      temDataValida: !!parsedDate
    });

    const lead: Lead = {
      row_number: index + 1,
      data: dateValue.toString() || '',
      Hora: findFieldValue(item, FIELD_MAPPINGS.hora, ''),
      Nome: nomeValue,
      'e-mail': findFieldValue(item, FIELD_MAPPINGS.email, ''),
      Whatsapp: findFieldValue(item, FIELD_MAPPINGS.whatsapp, ''),
      Status: statusValue,
      Closer: findFieldValue(item, FIELD_MAPPINGS.closer, ''),
      origem: findFieldValue(item, FIELD_MAPPINGS.origem, ''),
      'Venda Completa': parseNumber(findFieldValue(item, FIELD_MAPPINGS.vendaCompleta, 0)),
      recorrente: parseNumber(findFieldValue(item, FIELD_MAPPINGS.recorrente, 0)),
      parsedDate: parsedDate,
    };

    console.log('✅ Lead processado:', {
      nome: lead.Nome,
      status: lead.Status,
      data: lead.data,
      parsedDate: lead.parsedDate?.toISOString() || 'sem data válida'
    });

    return lead;
  });

  // Manter leads com dados básicos
  const filteredLeads = processedLeads.filter(lead => {
    const hasBasicData = lead.Nome || lead['e-mail'] || lead.Whatsapp || lead.Status;
    
    if (!hasBasicData) {
      console.log('❌ Lead rejeitado por não ter dados básicos:', lead);
      return false;
    }
    
    console.log('✅ Lead aceito:', lead.Nome || 'sem nome', lead.Status || 'sem status');
    return true;
  });

  console.log('📊 Resumo do processamento:', {
    totalRecebidos: data.length,
    totalProcessados: processedLeads.length,
    totalFiltrados: filteredLeads.length,
    comDataValida: filteredLeads.filter(l => l.parsedDate).length,
    semDataValida: filteredLeads.filter(l => !l.parsedDate).length,
    comStatus: filteredLeads.filter(l => l.Status && l.Status.trim() !== '').length,
    statusEncontrados: [...new Set(filteredLeads.map(l => l.Status).filter(Boolean))]
  });

  // IMPORTANTE: Alertar sobre problemas de data
  const leadsWithoutDate = filteredLeads.filter(l => !l.parsedDate).length;
  if (leadsWithoutDate > 0) {
    console.warn(`⚠️ ATENÇÃO: ${leadsWithoutDate} leads não possuem data válida e serão excluídos dos gráficos temporais`);
  }

  return filteredLeads;
}
