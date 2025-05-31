
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Lead } from '@/types/lead';

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

interface TableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function TableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <thead className="bg-gray-50">
      <tr>
        <SortableHeader field="data">Data</SortableHeader>
        <SortableHeader field="Nome">Nome</SortableHeader>
        <SortableHeader field="e-mail">E-mail</SortableHeader>
        <SortableHeader field="origem">Origem</SortableHeader>
        <SortableHeader field="Status">Status</SortableHeader>
        <SortableHeader field="Closer">Closer</SortableHeader>
        <SortableHeader field="Venda Completa">Venda</SortableHeader>
      </tr>
    </thead>
  );
}
