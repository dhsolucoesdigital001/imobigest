
import React, { useState, useEffect } from 'react';
import { VisitaPortal } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, Users, Eye, HelpCircle } from "lucide-react";
import VisitasStats from '../components/visitas/VisitasStats';
import TrafficSources from '../components/visitas/TrafficSources';
import ClickEventsTable from '../components/visitas/ClickEventsTable';

const mockStats = {
  totalVisitas: 1280,
  visitantesUnicos: 950,
  taxaRejeicao: 42,
  tempoMedio: "3m 15s"
};

const mockTrafficData = [
  { name: 'Busca Orgânica', value: 400 },
  { name: 'Direto', value: 300 },
  { name: 'Referência', value: 200 }, // Corrected: Added colon after 'name'
  { name: 'Mídia Social', value: 150 },
  { name: 'Busca Paga', value: 50 }
];

export default function GestaoVisitas() {
  const [stats, setStats] = useState(mockStats);
  const [trafficData, setTrafficData] = useState(mockTrafficData);
  const [clickEvents, setClickEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const events = await VisitaPortal.list("-created_date", 20);
        setClickEvents(events);
        
        // Simulação de carregamento dos outros dados
        setStats(mockStats);
        setTrafficData(mockTrafficData);

      } catch (error) {
        console.error("Erro ao buscar dados de visitas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando dashboard de visitas...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            Análise de Visitas
          </h1>
          <p className="text-gray-600 mt-1">
            Métricas de tráfego e engajamento do seu portal público.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600"/>
            <p className="text-sm text-blue-800">
                Os dados são simulados. A integração real requer o Google Analytics.
            </p>
        </div>
      </div>

      {/* Stats */}
      <VisitasStats stats={stats} />

      {/* Traffic Sources */}
      <TrafficSources data={trafficData} />

      {/* Click Events */}
      <ClickEventsTable events={clickEvents} />
    </div>
  );
}
