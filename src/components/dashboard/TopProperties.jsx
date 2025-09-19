
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Square, 
  Eye,
  Edit
} from "lucide-react";

const statusColors = {
  'Disponível': 'bg-green-100 text-green-800 border-green-200',
  'Visitado': 'bg-blue-100 text-blue-800 border-blue-200',
  'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Vendido': 'bg-purple-100 text-purple-800 border-purple-200',
  'Alugado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Reservado': 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function TopProperties({ properties }) {
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const handleViewDetails = (e, codigo) => {
    e.stopPropagation();
    navigate(createPageUrl(`ImovelDetalhes/${codigo}`));
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(createPageUrl(`CadastroImoveis?edit=${id}`));
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Imóveis Recentes
        </CardTitle>
        <Link to={createPageUrl("PesquisaImoveis")}>
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {properties.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">Nenhum imóvel cadastrado</p>
            <p className="text-gray-400 text-sm">Cadastre seu primeiro imóvel para começar</p>
            <Link to={createPageUrl("CadastroImoveis")}>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Cadastrar Imóvel
              </Button>
            </Link>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {property.foto_principal ? (
                      <img 
                        src={property.foto_principal} 
                        alt={property.codigo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">#{property.codigo}</span>
                      <Badge className={`${statusColors[property.estagio]} border`}>
                        {property.estagio}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="w-4 h-4" />
                      {property.endereco}, {property.bairro}
                    </p>
                    <p className="font-bold text-lg text-blue-600">
                      {formatCurrency(property.valor)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="Ver Detalhes"
                    onClick={(e) => handleViewDetails(e, property.codigo)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="Editar Imóvel"
                    onClick={(e) => handleEdit(e, property.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="font-medium">{property.tipo}</span>
                </span>
                {property.quartos && (
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {property.quartos}
                  </span>
                )}
                {property.banheiros && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {property.banheiros}
                  </span>
                )}
                {property.vagas && (
                  <span className="flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    {property.vagas}
                  </span>
                )}
                {property.area_total && (
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    {property.area_total}m²
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
