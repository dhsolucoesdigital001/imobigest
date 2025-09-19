import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, TrendingDown, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, changeType }) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Icon className="w-8 h-8 text-blue-600" />
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function VisitasStats({ stats }) {
  const statItems = [
    { 
      icon: Users, 
      title: "Total de Visitas (24h)", 
      value: stats.totalVisitas.toLocaleString('pt-BR') 
    },
    { 
      icon: UserCheck, 
      title: "Visitantes Únicos", 
      value: stats.visitantesUnicos.toLocaleString('pt-BR') 
    },
    { 
      icon: TrendingDown, 
      title: "Taxa de Rejeição", 
      value: `${stats.taxaRejeicao}%` 
    },
    { 
      icon: Clock, 
      title: "Tempo Médio no Site", 
      value: stats.tempoMedio 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
}