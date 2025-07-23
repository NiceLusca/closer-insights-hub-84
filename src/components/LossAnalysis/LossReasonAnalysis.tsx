import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Lead } from '@/types/lead';

interface LossReasonAnalysisProps {
  leads: Lead[];
}

interface ObjecaoData {
  objecao: string;
  quantidade: number;
  percentual: number;
  impactoFinanceiro: number;
}

const COLORS = [
  'hsl(var(--destructive))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))'
];

export const LossReasonAnalysis = React.memo(({ leads }: LossReasonAnalysisProps) => {
  const objectionAnalysis = React.useMemo(() => {
    // Filtrar apenas leads que não fecharam e têm objeção principal
    const leadsNaoFecharam = leads.filter(lead => {
      const status = lead.Status?.toLowerCase() || '';
      const naoFechou = status.includes('não fechou') || 
                       status.includes('nao fechou') || 
                       status.includes('not closed') ||
                       status.includes('perdido') ||
                       status.includes('recusa');
      
      return naoFechou && lead['Objeção Principal']?.trim();
    });

    if (leadsNaoFecharam.length === 0) {
      return [];
    }

    // Agrupar por objeção principal
    const objecaoGroups = leadsNaoFecharam.reduce((acc, lead) => {
      const objecao = lead['Objeção Principal']?.trim() || 'Não informado';
      
      if (!acc[objecao]) {
        acc[objecao] = {
          leads: [],
          totalFinanceiro: 0
        };
      }
      
      acc[objecao].leads.push(lead);
      
      // Calcular impacto financeiro estimado
      const valor = Number(lead.Valor || lead['Venda Completa'] || 0);
      const recorrente = Number(lead.recorrente || 0);
      acc[objecao].totalFinanceiro += valor + (recorrente * 12); // Assumindo 12x para recorrente
      
      return acc;
    }, {} as Record<string, { leads: Lead[]; totalFinanceiro: number }>);

    // Converter para array e calcular percentuais
    const total = leadsNaoFecharam.length;
    const objectionData: ObjecaoData[] = Object.entries(objecaoGroups)
      .map(([objecao, data]) => ({
        objecao: objecao.length > 30 ? objecao.substring(0, 30) + '...' : objecao,
        quantidade: data.leads.length,
        percentual: (data.leads.length / total) * 100,
        impactoFinanceiro: data.totalFinanceiro
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8); // Top 8 objeções

    return objectionData;
  }, [leads]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.objecao}</p>
          <p className="text-sm text-muted-foreground">
            Quantidade: <span className="font-medium text-foreground">{data.quantidade}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentual: <span className="font-medium text-foreground">{data.percentual.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Impacto: <span className="font-medium text-destructive">
              R$ {data.impactoFinanceiro.toLocaleString('pt-BR')}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (objectionAnalysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🚫</span>
            Análise de Objeções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma objeção encontrada nos dados.</p>
            <p className="text-sm mt-2">
              Verifique se o campo "Objeção Principal" está sendo preenchido para leads que não fecharam.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalImpacto = objectionAnalysis.reduce((sum, item) => sum + item.impactoFinanceiro, 0);
  const totalObjetos = objectionAnalysis.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras - Quantidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            Principal Motivos de Perda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={objectionAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="objecao" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantidade" 
                fill="hsl(var(--destructive))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🥧</span>
            Distribuição de Objeções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={objectionAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ objecao, percentual }) => `${percentual.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {objectionAnalysis.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo e Insights */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            Insights sobre Perdas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-destructive">Principal Objeção</h4>
              <p className="text-lg font-bold">{objectionAnalysis[0]?.objecao || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">
                {objectionAnalysis[0]?.quantidade || 0} leads ({objectionAnalysis[0]?.percentual.toFixed(1) || 0}%)
              </p>
            </div>
            
            <div className="bg-chart-2/10 p-4 rounded-lg border border-chart-2/20">
              <h4 className="font-semibold text-chart-2">Total de Perdas</h4>
              <p className="text-lg font-bold">{totalObjetos}</p>
              <p className="text-sm text-muted-foreground">leads não convertidos</p>
            </div>
            
            <div className="bg-chart-3/10 p-4 rounded-lg border border-chart-3/20">
              <h4 className="font-semibold text-chart-3">Impacto Financeiro</h4>
              <p className="text-lg font-bold">R$ {totalImpacto.toLocaleString('pt-BR')}</p>
              <p className="text-sm text-muted-foreground">potencial perdido</p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">🎯 Ações Recomendadas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-amber-600">📋 Treinamento Focado:</p>
                <p className="text-muted-foreground">
                  Desenvolver argumentação específica para "{objectionAnalysis[0]?.objecao || 'principal objeção'}"
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-600">🔄 Processo de Follow-up:</p>
                <p className="text-muted-foreground">
                  Criar scripts de reconexão para principais objeções identificadas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

LossReasonAnalysis.displayName = 'LossReasonAnalysis';