
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TableHeader } from "./LeadsTable/TableHeader";
import { TableRow } from "./LeadsTable/TableRow";
import { TablePagination } from "./LeadsTable/TablePagination";
import { useLeadsTable } from "./LeadsTable/useLeadsTable";
import type { Lead } from "@/types/lead";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    leadsPerPage,
    filteredAndSortedLeads,
    paginatedLeads,
    totalPages,
    handleSort
  } = useLeadsTable(leads);

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
            <TableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLeads.map((lead) => (
                <TableRow key={lead.row_number} lead={lead} />
              ))}
            </tbody>
          </table>
        </div>
        
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          leadsPerPage={leadsPerPage}
          totalLeads={filteredAndSortedLeads.length}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
}
