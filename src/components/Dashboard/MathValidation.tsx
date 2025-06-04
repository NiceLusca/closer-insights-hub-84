
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Calculator, CheckCircle, AlertTriangle } from "lucide-react";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import type { Lead } from "@/types/lead";

interface MathValidationProps {
  leads: Lead[];
}

export function MathValidation({ leads }: MathValidationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const metrics = calculateStandardizedMetrics(leads);

  // Validações matemáticas
  const validations = [
    {
      name: "Soma dos grupos",
      expected: metrics.totalLeads,
      actual: metrics.fechados + metrics.aSerAtendido + metrics.atendidoNaoFechou + metrics.perdidoInativo,
      formula: "Fechados + A Ser Atendido + Atendido Não Fechou + Perdido/Inativo"
    },
    {
      name: "Taxa de Comparecimento + A Ser Atendido + Desmarque",
      expected: 100,
      actual: metrics.taxaComparecimento + ((metrics.aSerAtendido / metrics.totalLeads) * 100) + metrics.taxaDesmarque,
      formula: "Comparecimento% + (A Ser Atendido / Total)% + Desmarque%"
    },
    {
      name: "Taxa de Fechamento + Não Fechamento",
      expected: 100,
      actual: metrics.apresentacoes > 0 ? metrics.taxaFechamento + metrics.taxaNaoFechamento : 0,
      formula: "Fechamento% + Não Fechamento%"
    },
    {
      name: "Apresentações",
      expected: metrics.apresentacoes,
      actual: metrics.fechados + metrics.atendidoNaoFechou,
      formula: "Fechados + Atendido Não Fechou"
    }
  ];

  const isValidationPassed = (validation: typeof validations[0]) => {
    return Math.abs(validation.expected - validation.actual) < 0.1;
  };

  const allValidationsPassed = validations.every(isValidationPassed);

  return (
    <Card className="bg-gray-800/30 border border-gray-700/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-700/20 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-100">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>Validação Matemática</span>
                {allValidationsPassed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-200">Contadores Básicos</h4>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex justify-between">
                      <span>Total Leads:</span>
                      <span className="font-medium">{metrics.totalLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fechados:</span>
                      <span className="font-medium">{metrics.fechados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>A Ser Atendido:</span>
                      <span className="font-medium">{metrics.aSerAtendido}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atendido Não Fechou:</span>
                      <span className="font-medium">{metrics.atendidoNaoFechou}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perdido/Inativo:</span>
                      <span className="font-medium">{metrics.perdidoInativo}</span>
                    </div>
                    <div className="flex justify-between text-yellow-300">
                      <span>Mentorados (excluídos):</span>
                      <span className="font-medium">{metrics.mentorados}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-200">Taxas Calculadas</h4>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex justify-between">
                      <span>Taxa de Fechamento:</span>
                      <span className="font-medium">{metrics.taxaFechamento.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Comparecimento:</span>
                      <span className="font-medium">{metrics.taxaComparecimento.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Desmarque:</span>
                      <span className="font-medium">{metrics.taxaDesmarque.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aproveitamento Geral:</span>
                      <span className="font-medium">{metrics.aproveitamentoGeral.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa Não Fechamento:</span>
                      <span className="font-medium">{metrics.taxaNaoFechamento.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700/30 pt-4">
                <h4 className="font-semibold text-gray-200 mb-3">Verificações Matemáticas</h4>
                <div className="space-y-3">
                  {validations.map((validation, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        isValidationPassed(validation)
                          ? 'bg-green-500/10 border-green-500/20 text-green-300'
                          : 'bg-red-500/10 border-red-500/20 text-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{validation.name}</span>
                        {isValidationPassed(validation) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-xs opacity-80">
                        <div>Esperado: {validation.expected.toFixed(1)}</div>
                        <div>Calculado: {validation.actual.toFixed(1)}</div>
                        <div className="mt-1 text-gray-400">Fórmula: {validation.formula}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded">
                <strong>Nota:</strong> Esta validação confirma que todos os cálculos matemáticos estão consistentes e corretos. 
                Mentorados são sempre excluídos dos cálculos de conversão conforme especificação.
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
