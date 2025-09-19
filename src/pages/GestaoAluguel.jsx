import React, { useState, useEffect } from "react";
import { ContratoLocacao, PagamentoAluguel, Imovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Home,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";

import DashboardAluguel from "../components/aluguel/DashboardAluguel";
import ContratosLocacao from "../components/aluguel/ContratosLocacao";
import GestaoFinanceira from "../components/aluguel/GestaoFinanceira";
import GestaoVistorias from "../components/aluguel/GestaoVistorias";
import GestaoManutencoes from "../components/aluguel/GestaoManutencoes";
import RelatoriosAluguel from "../components/aluguel/RelatoriosAluguel";

export default function GestaoAluguel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statsData, setStatsData] = useState({
    contratos_ativos: 0,
    imoveis_alugados: 0,
    taxa_inadimplencia: 0,
    receita_mensal: 0,
    pagamentos_pendentes: 0,
    manutencoes_abertas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [contratos, pagamentos, imoveis] = await Promise.all([
        ContratoLocacao.list(),
        PagamentoAluguel.list(),
        Imovel.list()
      ]);

      const contratosAtivos = contratos.filter(c => c.status === 'Ativo').length;
      const imoveisAlugados = contratos.filter(c => c.status === 'Ativo').length;
      const pagamentosPendentes = pagamentos.filter(p => p.status === 'Pendente' || p.status === 'Atrasado').length;
      const receitaMensal = pagamentos
        .filter(p => p.status === 'Pago' && new Date(p.data_pagamento).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + (p.valor_pago || 0), 0);

      setStatsData({
        contratos_ativos: contratosAtivos,
        imoveis_alugados: imoveisAlugados,
        taxa_inadimplencia: pagamentosPendentes > 0 ? ((pagamentosPendentes / contratos.length) * 100).toFixed(1) : 0,
        receita_mensal: receitaMensal,
        pagamentos_pendentes: pagamentosPendentes,
        manutencoes_abertas: 0 // Will be calculated when we load maintenance data
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  if (loading) {
    return <div className="p-6">Carregando gestão de aluguel...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Aluguel</h1>
            <p className="text-gray-600 mt-1">
              Gerencie contratos, pagamentos e manutenções
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Always Visible */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contratos Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{statsData.contratos_ativos}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Imóveis Alugados</p>
                <p className="text-2xl font-bold text-green-600">{statsData.imoveis_alugados}</p>
              </div>
              <Home className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa Inadimplência</p>
                <p className="text-2xl font-bold text-red-600">{statsData.taxa_inadimplencia}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(statsData.receita_mensal)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{statsData.pagamentos_pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manutenções Abertas</p>
                <p className="text-2xl font-bold text-purple-600">{statsData.manutencoes_abertas}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="vistorias">Vistorias</TabsTrigger>
          <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardAluguel statsData={statsData} />
        </TabsContent>

        <TabsContent value="contratos" className="mt-6">
          <ContratosLocacao onUpdateStats={loadDashboardData} />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6">
          <GestaoFinanceira onUpdateStats={loadDashboardData} />
        </TabsContent>

        <TabsContent value="vistorias" className="mt-6">
          <GestaoVistorias />
        </TabsContent>

        <TabsContent value="manutencoes" className="mt-6">
          <GestaoManutencoes />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <RelatoriosAluguel />
        </TabsContent>
      </Tabs>
    </div>
  );
}