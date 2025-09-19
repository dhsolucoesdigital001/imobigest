import React, { useState, useEffect } from "react";
import { Imovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Camera, 
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import RelatorioCard from "../components/reports/RelatorioCard";

export default function Relatorios() {
  const [imoveisData, setImoveisData] = useState({
    total: 0,
    ativos: 0,
    desativados: 0,
    semFotos: 0,
    vendidos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatoriosData();
  }, []);

  const loadRelatoriosData = async () => {
    try {
      const imoveis = await Imovel.list();
      
      const ativos = imoveis.filter(i => i.ativo === true).length;
      const desativados = imoveis.filter(i => i.ativo === false).length;
      const semFotos = imoveis.filter(i => !i.fotos || i.fotos.length === 0).length;
      const vendidos = imoveis.filter(i => i.estagio === 'Vendido').length;

      setImoveisData({
        total: imoveis.length,
        ativos,
        desativados,
        semFotos,
        vendidos
      });
    } catch (error) {
      console.error("Erro ao carregar dados dos relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Ativos', value: imoveisData.ativos, color: '#10b981' },
    { name: 'Desativados', value: imoveisData.desativados, color: '#ef4444' },
    { name: 'Sem Fotos', value: imoveisData.semFotos, color: '#f59e0b' },
    { name: 'Vendidos', value: imoveisData.vendidos, color: '#8b5cf6' }
  ];

  const relatoriosBasicos = [
    {
      title: "Imóveis Ativos x Desativados",
      description: "Comparativo entre imóveis ativos e desativados no sistema",
      icon: BarChart3,
      value: `${imoveisData.ativos} / ${imoveisData.desativados}`,
      color: "bg-green-500"
    },
    {
      title: "Imóveis sem Fotos",
      description: "Imóveis que ainda não possuem fotos cadastradas",
      icon: Camera,
      value: imoveisData.semFotos,
      color: "bg-yellow-500"
    },
    {
      title: "Imóveis Vendidos",
      description: "Total de imóveis com status 'Vendido'",
      icon: CheckCircle,
      value: imoveisData.vendidos,
      color: "bg-purple-500"
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">
          Análises e métricas do seu negócio imobiliário
        </p>
      </div>

      {/* Relatórios Básicos - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatoriosBasicos.map((relatorio, index) => (
          <RelatorioCard
            key={index}
            title={relatorio.title}
            description={relatorio.description}
            value={relatorio.value}
            icon={relatorio.icon}
            bgColor={relatorio.color}
          />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Distribuição de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="name" 
                    className="text-gray-600"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-gray-600"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Status dos Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Relatórios Disponíveis */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Imóveis Ativos</h3>
                <Badge className="bg-green-100 text-green-800">
                  {imoveisData.ativos}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Lista completa de imóveis ativos no sistema
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Imóveis Desativados</h3>
                <Badge className="bg-red-100 text-red-800">
                  {imoveisData.desativados}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Imóveis que foram desativados do portfólio
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Sem Fotos</h3>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {imoveisData.semFotos}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Imóveis que precisam de fotos para completar o cadastro
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}