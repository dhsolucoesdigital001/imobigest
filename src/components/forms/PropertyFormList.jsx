
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus,
  MapPin,
  Edit,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  'Disponível': 'bg-green-100 text-green-800 border-green-200',
  'Visitado': 'bg-blue-100 text-blue-800 border-blue-200',
  'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Vendido': 'bg-purple-100 text-purple-800 border-purple-200',
  'Alugado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Reservado': 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function PropertyFormList({ 
  properties, 
  loading, 
  onNewProperty,
  onEdit,
  onDelete
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-24" />
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
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Imóveis Cadastrados ({properties.length})
            </div>
            <Button onClick={onNewProperty} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Imóvel
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {properties.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum imóvel cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro imóvel
            </p>
            <Button onClick={onNewProperty} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Imóvel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <Card key={property.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {property.foto_principal ? (
                      <img 
                        src={property.foto_principal} 
                        alt={property.codigo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={createPageUrl(`ImovelDetalhes/${property.id}`)} className="hover:underline">
                        <span className="font-bold text-blue-600">#{property.codigo}</span>
                      </Link>
                      <Badge className={`${statusColors[property.estagio]} border text-xs`}>
                        {property.estagio}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {property.situacao}
                      </Badge>
                      {!property.ativo && (
                        <Badge variant="destructive" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      {property.tipo}
                    </p>
                    
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.endereco}, {property.bairro}
                    </p>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(property.valor)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => onEdit(property)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => onDelete(property.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
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
