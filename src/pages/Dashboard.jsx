import React, { useState, useEffect } from "react";
import { Imovel, Cliente, Visita } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building2, 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Eye,
  Plus,
  MapPin,
  DollarSign,
  FileText,
  Star,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivity from "../components/dashboard/RecentActivity";
import TopProperties from "../components/dashboard/TopProperties";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import FaturamentoChart from "../components/dashboard/FaturamentoChart";
import CorretorRanking from "../components/dashboard/CorretorRanking";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalImoveis: 0,
    totalClientes: 0,
    totalCorretores: 0,
    visitasHoje: 0,
    imoveisVendidos: 0,
    imoveisComProposta: 0,
    faturamentoMes: 0,
    faturamentoAno: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [corretorRanking, setCorretorRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [imoveis, clientes, corretores, visitas] = await Promise.all([
        Imovel.list("-created_date", 50),
        Cliente.list("-created_date", 10),
        User.list(),
        Visita.list("-data_agendada", 20)
      ]);

      // Calcular estatísticas avançadas
      const hoje = new Date().toISOString().split('T')[0];
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();

      const visitasHoje = visitas.filter(v => 
        v.data_agendada && v.data_agendada.startsWith(hoje)
      ).length;

      const imoveisVendidos = imoveis.filter(i => i.estagio === 'Vendido').length;
      const imoveisComProposta = imoveis.filter(i => i.estagio === 'Proposta').length;

      // Faturamento do mês atual
      const faturamentoMes = imoveis
        .filter(i => {
          if (i.estagio !== 'Vendido' || !i.data_atualizacao) return false;
          const dataVenda = new Date(i.data_atualizacao);
          return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
        })
        .reduce((sum, i) => sum + (i.valor || 0), 0);

      // Faturamento do ano
      const faturamentoAno = imoveis
        .filter(i => {
          if (i.estagio !== 'Vendido' || !i.data_atualizacao) return false;
          const dataVenda = new Date(i.data_atualizacao);
          return dataVenda.getFullYear() === anoAtual;
        })
        .reduce((sum, i) => sum + (i.valor || 0), 0);

      // Ranking de corretores por visitas
      const visitasPorCorretor = {};
      visitas.forEach(v => {
        if (v.corretor_id) {
          visitasPorCorretor[v.corretor_id] = (visitasPorCorretor[v.corretor_id] || 0) + 1;
        }
      });

      const ranking = corretores
        .filter(c => c.tipo_usuario === 'Corretor')
        .map(c => ({
          ...c,
          totalVisitas: visitasPorCorretor[c.id] || 0,
          imoveisVendidos: imoveis.filter(i => i.corretor_id === c.id && i.estagio === 'Vendido').length
        }))
        .sort((a, b) => b.totalVisitas - a.totalVisitas)
        .slice(0, 5);

      setStats({
        totalImoveis: imoveis.length,
        totalClientes: clientes.length,
        totalCorretores: corretores.filter(c => c.tipo_usuario === 'Corretor').length,
        visitasHoje,
        imoveisVendidos,
        imoveisComProposta,
        faturamentoMes,
        faturamentoAno
      });

      setRecentProperties(imoveis.slice(0, 5));
      setRecentVisits(visitas.slice(0, 5));
      setCorretorRanking(ranking);
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header com Branding */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">ImobiGest</h1>
        <h2 className="text-xl text-gray-600 mb-1">Sistema de Gestão</h2>
        <h3 className="text-lg text-gray-500">Imobiliária</h3>
        <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Bem-vindo ao painel de controle da sua imobiliária
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to={createPageUrl("CadastroImoveis")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Imóvel
            </Button>
          </Link>
          <Link to={createPageUrl("CadastroClientes")}>
            <Button variant="outline">
              <UserCheck className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
          <Link to={createPageUrl("PortalPublico")}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Ver Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats
          title="Total de Imóveis"
          value={stats.totalImoveis}
          icon={Building2}
          bgColor="bg-blue-500"
          change="+12% este mês"
          changeType="positive"
        />
        <DashboardStats
          title="Clientes Ativos"
          value={stats.totalClientes}
          icon={Users}
          bgColor="bg-green-500"
          change="+8% este mês"
          changeType="positive"
        />
        <DashboardStats
          title="Corretores"
          value={stats.totalCorretores}
          icon={UserCheck}
          bgColor="bg-purple-500"
        />
        <DashboardStats
          title="Visitas Hoje"
          value={stats.visitasHoje}
          icon={Calendar}
          bgColor="bg-orange-500"
        />
      </div>

      {/* Stats Cards - Linha 2 (Novos KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-r from-green-500 to-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-green-100 font-medium">Imóveis Vendidos</p>
                <p className="text-3xl font-bold mt-2">{stats.imoveisVendidos}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-yellow-100 font-medium">Com Proposta</p>
                <p className="text-3xl font-bold mt-2">{stats.imoveisComProposta}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <Target className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-blue-100 font-medium">Faturamento Anual</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(stats.faturamentoAno)}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Properties */}
        <div className="lg:col-span-2">
          <TopProperties properties={recentProperties} />
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity visits={recentVisits} />
        </div>
      </div>

      {/* Charts and Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div>
          <PerformanceChart />
        </div>

        {/* Corretor Ranking */}
        <div>
          <CorretorRanking corretores={corretorRanking} />
        </div>
      </div>

      {/* Faturamento Chart */}
      <div>
        <FaturamentoChart faturamentoMes={stats.faturamentoMes} />
      </div>
    </div>
  );
}