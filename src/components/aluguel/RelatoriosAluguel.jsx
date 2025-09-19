import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, BarChart3, Calendar } from "lucide-react";

export default function RelatoriosAluguel() {
  const relatoriosDisponiveis = [
    {
      titulo: "Contratos Ativos",
      descricao: "Lista completa de todos os contratos de locação ativos",
      icone: FileText,
      cor: "bg-blue-500"
    },
    {
      titulo: "Relatório de Inadimplência",
      descricao: "Pagamentos em atraso por período e locatário",
      icone: BarChart3,
      cor: "bg-red-500"
    },
    {
      titulo: "Repasses aos Proprietários",
      descricao: "Histórico de repasses realizados aos proprietários",
      icone: Download,
      cor: "bg-green-500"
    },
    {
      titulo: "Manutenções por Imóvel",
      descricao: "Histórico de manutenções realizadas por imóvel",
      icone: Calendar,
      cor: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-600" />
          Relatórios de Aluguel
        </h2>
        <p className="text-gray-600">Gere relatórios detalhados da gestão de aluguéis</p>
      </div>

      {/* Relatórios Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {relatoriosDisponiveis.map((relatorio, index) => {
          const IconComponent = relatorio.icone;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${relatorio.cor}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {relatorio.titulo}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {relatorio.descricao}
                </p>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Relatórios Personalizados</h3>
              <p className="text-blue-700 text-sm">
                Os relatórios serão gerados automaticamente conforme os dados forem inseridos no sistema.
                Você poderá filtrar por período, proprietário, status do contrato e muito mais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}