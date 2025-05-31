
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/types/lead';

interface TableRowProps {
  lead: Lead;
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    'Fechou': 'bg-green-100 text-green-800',
    'Agendado': 'bg-blue-100 text-blue-800',
    'Confirmado': 'bg-indigo-100 text-indigo-800',
    'Não Apareceu': 'bg-red-100 text-red-800',
    'Desmarcou': 'bg-yellow-100 text-yellow-800',
    'Remarcou': 'bg-orange-100 text-orange-800',
    'Aguardando resposta': 'bg-gray-100 text-gray-800',
    'Mentorado': 'bg-purple-100 text-purple-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const TableRow = React.memo(({ lead }: TableRowProps) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {lead?.data || '-'} {lead?.Hora || ''}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {lead?.Nome || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lead?.['e-mail'] || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {lead?.origem || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {lead?.Status ? (
          <Badge className={getStatusBadgeColor(lead.Status)}>
            {lead.Status}
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800">
            Sem status
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {lead?.Closer || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {lead?.['Venda Completa'] && lead['Venda Completa'] > 0 
          ? formatCurrency(lead['Venda Completa']) 
          : '-'
        }
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';
