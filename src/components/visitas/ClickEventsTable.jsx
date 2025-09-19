import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MousePointerClick, Smartphone, Monitor } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClickEventsTable({ events }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "dd/MM/yy HH:mm:ss", { locale: ptBR });
    } catch {
      return '';
    }
  };

  const getEventDescription = (event) => {
    switch(event.tipo_evento) {
        case 'click_whatsapp': return 'Clicou no WhatsApp';
        case 'click_telefone': return 'Clicou no Telefone';
        case 'submit_formulario': return 'Enviou Formulário';
        case 'click_portal_externo': return `Clicou no portal: ${event.detalhes || 'N/A'}`;
        default: return 'Ação desconhecida';
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-purple-600" />
          Eventos de Clique Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ação</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="text-center">Dispositivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{getEventDescription(event)}</TableCell>
                <TableCell>{formatDateTime(event.created_date)}</TableCell>
                <TableCell>{event.ip_address}</TableCell>
                <TableCell className="text-center">
                  {event.dispositivo === 'Mobile' ? 
                    <Smartphone className="w-5 h-5 mx-auto text-gray-600" /> : 
                    <Monitor className="w-5 h-5 mx-auto text-gray-600" />
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}