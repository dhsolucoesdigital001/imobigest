import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  'Agendada': 'bg-blue-100 text-blue-800 border-blue-200',
  'Realizada': 'bg-green-100 text-green-800 border-green-200',
  'Cancelada': 'bg-red-100 text-red-800 border-red-200',
  'Reagendada': 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

export default function RecentActivity({ visits }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "dd/MM 'às' HH:mm", { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visits.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma visita agendada</p>
            <p className="text-gray-400 text-sm">As próximas visitas aparecerão aqui</p>
          </div>
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${statusColors[visit.status]} border text-xs`}>
                    {visit.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Visita - Imóvel #{visit.imovel_id?.slice(-6) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(visit.data_agendada)}
                </p>
                {visit.observacoes && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {visit.observacoes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}