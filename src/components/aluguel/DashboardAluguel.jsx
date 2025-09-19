import React, { useState, useEffect } from "react";
import { ContratoLocacao, PagamentoAluguel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardAluguel({ statsData }) {
  const [contratosVencendo, setContratosVencendo] = useState([]);
  const [pagamentosAtrasados, setPagamentosAtrasados] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadDashboardDetails();
  }, []);

  const loadDashboardDetails = async () => {
    try {
      const [contratos, pagamentos] = await Promise.all([
        ContratoLocacao.list(),
        PagamentoAluguel.list()
      ]);

      // Contratos vencendo nos próximos 90 dias
      const hoje = new Date();
      const em90Dias = new Date();
      em90Dias.setDate(hoje.getDate() + 90);

      const vencendo = contratos.filter(c => {
        const dataFim = new Date(c.data_fim);
        return dataFim >= hoje && dataFim <= em90Dias;
      }).slice(0, 5);

      setContratosVencendo(vencendo);

      // Pagamentos atrasados
      const atrasados = pagamentos.filter(p => {
        return p.status === 'Atrasado' || (p.status === 'Pendente' && new Date(p.data_vencimento) < hoje);
      }).slice(0, 5);

      setPagamentosAtrasados(atrasados);

      // Dados para gráfico - últimos 6 meses
      const chartDataTemp = [];
      for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mesAno = data.toISOString().slice(0, 7); // YYYY-MM

        const pagamentosMes = pagamentos.filter(p => 
          p.data_pagamento && p.data_pagamento.slice(0, 7) === mesAno && p.status === 'Pago'
        );

        const recebido = pagamentosMes.reduce((sum, p) => sum + (p.valor_pago || 0), 0);

        chartDataTemp.push({
          mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          recebido: recebido
        });
      }

      setChartData(chartDataTemp);

    } catch (error) {
      console.error("Erro ao carregar detalhes do dashboard:", error);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Receita */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Receita dos Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Recebido']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="recebido" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Status dos Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Contratos Ativos</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{statsData.contratos_ativos}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Pagamentos Pendentes</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">{statsData.pagamentos_pendentes}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Taxa de Inadimplência</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{statsData.taxa_inadimplencia}%</Badge>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-700 mb-1">Receita Mensal</p>
                <p className="text-2xl font-bold text-blue-800">{formatCurrency(statsData.receita_mensal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contratos Vencendo */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Contratos Vencendo (90 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contratosVencendo.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum contrato vencendo nos próximos 90 dias</p>
            ) : (
              <div className="space-y-3">
                {contratosVencendo.map((contrato) => (
                  <div key={contrato.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Contrato #{contrato.numero_contrato}</p>
                      <p className="text-sm text-gray-600">Vencimento: {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      {Math.ceil((new Date(contrato.data_fim) - new Date()) / (1000 * 60 * 60 * 24))} dias
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamentos Atrasados */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Pagamentos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pagamentosAtrasados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum pagamento em atraso</p>
            ) : (
              <div className="space-y-3">
                {pagamentosAtrasados.map((pagamento) => (
                  <div key={pagamento.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Ref: {new Date(pagamento.referencia_mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                      <p className="text-sm text-gray-600">Vencimento: {new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{formatCurrency(pagamento.valor_total)}</p>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {Math.ceil((new Date() - new Date(pagamento.data_vencimento)) / (1000 * 60 * 60 * 24))} dias
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}