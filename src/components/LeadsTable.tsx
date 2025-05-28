
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import type { Lead } from "@/types/lead";

interface LeadsTableProps {
  leads: Lead[];
}

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

export function LeadsTable({ leads }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('row_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const filteredAndSortedLeads = useMemo(() => {
    console.log('Processando leads na tabela:', leads?.length || 0);
    
    if (!leads || leads.length === 0) {
      return [];
    }

    let filtered = leads.filter(lead => {
      const nome = lead?.Nome || '';
      const email = lead?.['e-mail'] || '';
      const origem = lead?.origem || '';
      const closer = lead?.Closer || '';
      const status = lead?.Status || '';
      
      const searchLower = searchTerm.toLowerCase();
      
      return nome.toLowerCase().includes(searchLower) ||
             email.toLowerCase().includes(searchLower) ||
             origem.toLowerCase().includes(searchLower) ||
             closer.toLowerCase().includes(searchLower) ||
             status.toLowerCase().includes(searchLower);
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratar valores undefined/null
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = filteredAndSortedLeads.slice(startIndex, startIndex + leadsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  if (!leads || leads.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Leads Detalhados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum lead encontrado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Leads Detalhados ({filteredAndSortedLeads.length} total)
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLeads.map((lead) => (
                <tr key={lead.row_number} className="hover:bg-gray-50">
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
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(startIndex + leadsPerPage, filteredAndSortedLeads.length)} de {filteredAndSortedLeads.length} leads
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
