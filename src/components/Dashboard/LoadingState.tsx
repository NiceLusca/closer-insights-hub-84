
import React from 'react';
import { RefreshCw, Database, TrendingUp } from "lucide-react";

interface LoadingStateProps {
  progress?: number;
  stage?: string;
}

export function LoadingState({ progress, stage }: LoadingStateProps) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Header com ícone animado */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-100">Carregando Dados</h3>
            <p className="text-gray-400 text-sm">
              {stage || 'Buscando leads diretamente do webhook...'}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        {progress !== undefined && progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Processando</span>
              <span className="text-sm text-blue-400 font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicadores de etapas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Database className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">Webhook</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-xs text-gray-400">Processando</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-400">Dashboard</span>
          </div>
        </div>

        {/* Dica para usuário */}
        <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            {progress && progress > 50 
              ? "Quase lá! Preparando visualizações..." 
              : "Processando dados em lotes para melhor performance..."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
