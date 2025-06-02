
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import type { Lead, DateRange } from "@/types/lead";

interface DebugInfoProps {
  allLeads: Lead[];
  filteredLeads: Lead[];
  dateRange: DateRange;
  cacheStatus: string;
  validation?: {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  };
}

export function DebugInfo({ 
  allLeads, 
  filteredLeads, 
  dateRange, 
  cacheStatus, 
  validation 
}: DebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const leadsWithStatus = allLeads.filter(lead => {
    const status = lead.Status?.trim();
    return status && status !== '';
  });

  const statusBreakdown = filteredLeads.reduce((acc, lead) => {
    const status = lead.Status || 'Sem Status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const aSerAtendido = filteredLeads.filter(lead => 
    ['Agendado', 'Confirmado', 'Remarcou', 'DCAUSENTE'].includes(lead.Status || '')
  ).length;

  const hasIssues = !validation?.isValid || (allLeads.length - leadsWithStatus.length) > 0;

  return (
    <Card className="mb-4 bg-gray-800/30 border border-gray-700/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-300">
              <span className="font-medium">{filteredLeads.length} leads</span>
              <span className="text-gray-500 mx-2">de</span>
              <span>{leadsWithStatus.length} válidos</span>
              <span className="text-gray-500 mx-2">•</span>
              <span className="text-xs text-gray-400">
                {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
              </span>
            </div>
            {hasIssues && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-700/30 space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Total Carregados</p>
                <p className="font-medium text-gray-200">{allLeads.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Com Status Válido</p>
                <p className="font-medium text-gray-200">{leadsWithStatus.length}</p>
              </div>
              <div>
                <p className="text-gray-400">No Período</p>
                <p className="font-medium text-gray-200">{filteredLeads.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Cache</p>
                <p className={`font-medium ${cacheStatus === 'válido' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {cacheStatus}
                </p>
              </div>
            </div>

            {Object.keys(statusBreakdown).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Distribuição por Status:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-gray-300">{status}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation && !validation.isValid && (
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                <p className="font-medium text-yellow-300 mb-1">⚠️ Avisos:</p>
                {validation.warnings.map((warning, idx) => (
                  <p key={idx} className="text-yellow-200">• {warning}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
