import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  'Ativo': 'bg-green-100 text-green-800 border-green-200',
  'Frio': 'bg-blue-100 text-blue-800 border-blue-200',
  'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Finalizado': 'bg-purple-100 text-purple-800 border-purple-200'
};

export default function ClienteList({ 
  clientes, 
  loading, 
  onEdit, 
  onDelete, 
  onNewCliente 
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return '';
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Clientes Cadastrados ({clientes.length})
          </CardTitle>
          <Button onClick={onNewCliente} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </CardHeader>
      </Card>

      {clientes.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <UserCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro cliente
            </p>
            <Button onClick={onNewCliente} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                      <Badge className={`${statusColors[cliente.status]} border text-xs`}>
                        {cliente.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {cliente.interesse}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-1">
                      {cliente.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {cliente.telefone}
                        </span>
                      )}
                      {cliente.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {cliente.email}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {(cliente.faixa_preco_min || cliente.faixa_preco_max) && (
                        <span>
                          Faixa: {formatCurrency(cliente.faixa_preco_min)} - {formatCurrency(cliente.faixa_preco_max)}
                        </span>
                      )}
                      {cliente.data_ultimo_contato && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Último contato: {formatDate(cliente.data_ultimo_contato)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(cliente)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(cliente.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}