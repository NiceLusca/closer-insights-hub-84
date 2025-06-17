
import React from 'react';
import { RefreshCw, Database, TrendingUp } from "lucide-react";
import { SkeletonCard } from './SkeletonCard';

interface LoadingStateProps {
  progress?: number;
  stage?: string;
}

export function LoadingState({ progress, stage }: LoadingStateProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Loading Header */}
      <div className="flex justify-center items-center py-8">
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl p-8 max-w-md w-full">
          {/* Header com ícone animado */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-blue-400/20 animate-pulse"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-100 mb-1">Carregando Dados</h3>
              <p className="text-gray-400 text-sm">
                {stage || 'Processando informações...'}
              </p>
            </div>
          </div>

          {/* Barra de progresso aprimorada */}
          {progress !== undefined && progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-300 font-medium">Progresso</span>
                <span className="text-sm text-blue-400 font-bold">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min(progress, 100)}%`,
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                  }}
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Indicadores de etapas com animação */}
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Dados</span>
              <div className="w-8 h-1 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Processando</span>
              <div className="w-8 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-gray-600/20 border border-gray-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Dashboard</span>
              <div className="w-8 h-1 bg-gray-500 rounded-full"></div>
            </div>
          </div>

          {/* Mensagem motivacional */}
          <div className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg border border-gray-600/20">
            <p className="text-xs text-gray-300 text-center leading-relaxed">
              {progress && progress > 80 
                ? "🎉 Quase pronto! Preparando visualizações..." 
                : progress && progress > 50
                ? "⚡ Processando dados em alta velocidade..."
                : "🚀 Carregando insights poderosos para você..."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Skeleton Cards para preview do conteúdo */}
      <div className="space-y-8">
        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="animate-pulse" />
          ))}
        </div>

        {/* Monthly Goal Skeleton */}
        <SkeletonCard className="animate-pulse" />

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} showChart className="animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
