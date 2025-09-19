
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Square,
  Eye,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Imovel } from "@/api/entities"; 

import DeleteConfirmModal from "../common/DeleteConfirmModal";

const statusColors = {
  'Disponível': 'bg-green-100 text-green-800 border-green-200',
  'Visitado': 'bg-blue-100 text-blue-800 border-blue-200',
  'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Vendido': 'bg-purple-100 text-purple-800 border-purple-200',
  'Alugado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Reservado': 'bg-orange-100 text-orange-800 border-orange-200'
};

const situationColors = {
  'Venda': 'bg-blue-100 text-blue-800',
  'Aluguel': 'bg-green-100 text-green-800',
  'Venda/Aluguel': 'bg-purple-100 text-purple-800'
};

export default function PropertyCard({ property, onReload, onViewDetails }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const canDelete = () => {
    if (!currentUser) return false;
    return ['Super Admin'].includes(currentUser.tipo_usuario);
  };

  const handleDelete = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setLoading(true);
    try {
      await Imovel.delete(property.id);
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };
  
  const handleButtonClick = (e) => {
    e.stopPropagation(); // Impede que o clique no botão propague para o card
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <>
      <Card 
        className="border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            {property.foto_principal ? (
              <img 
                src={property.foto_principal} 
                alt={property.codigo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${statusColors[property.estagio]} border shadow-sm`}>
              {property.estagio}
            </Badge>
          </div>
          
          <div className="absolute top-3 right-3">
            <Badge className={`${situationColors[property.situacao]} shadow-sm`}>
              {property.situacao}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Código e Endereço */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-blue-600">#{property.codigo}</span>
                <span className="text-xs text-gray-500">{property.tipo}</span>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{property.endereco}</span>
              </p>
              <p className="text-xs text-gray-500 ml-5">
                {property.bairro}, {property.cidade}/{property.estado}
              </p>
            </div>

            {/* Preço */}
            <div className="py-2">
              <p className="font-bold text-xl text-green-600">
                {formatCurrency(property.valor)}
              </p>
              {property.valor_condominio && (
                <p className="text-xs text-gray-500">
                  + Cond. {formatCurrency(property.valor_condominio)}
                </p>
              )}
            </div>

            {/* Características */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-3">
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
              </div>
              {property.area_util_total && (
                <span className="flex items-center gap-1 text-xs">
                  <Square className="w-4 h-4" />
                  {property.area_util_total}m²
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 mt-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                onClick={handleButtonClick}
                type="button"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
              
              {canDelete() && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  disabled={loading}
                  title="Excluir Imóvel"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Imóvel"
        message={`Tem certeza que deseja excluir o imóvel #${property.codigo}?`}
        itemName={`${property.endereco}, ${property.bairro}`}
        loading={loading}
      />
    </>
  );
}
