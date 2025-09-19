
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Car,
  Square,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

import DeleteConfirmModal from "../common/DeleteConfirmModal";

const statusColors = {
  'Disponível': 'bg-green-100 text-green-800 border-green-200',
  'Visitado': 'bg-blue-100 text-blue-800 border-blue-200',
  'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Vendido': 'bg-purple-100 text-purple-800 border-purple-200',
  'Alugado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Reservado': 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function PropertyList({ properties, onReload, onViewDetails }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
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

  const canEdit = () => {
    if (!currentUser) return false;
    return ['Super Admin', 'Corretor', 'Gerente'].includes(currentUser.tipo_usuario);
  };

  const canDelete = () => {
    if (!currentUser) return false;
    return ['Super Admin'].includes(currentUser.tipo_usuario);
  };

  const handleViewDetails = (propertyId) => {
    if (onViewDetails) {
      onViewDetails(propertyId);
    }
  };

  const handleEditProperty = (property) => {
    // Navegar para edição usando o ID interno
    navigate(`${createPageUrl("CadastroImoveis")}?edit=${property.id}`);
  };

  const handleDeleteClick = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;
    setLoading(true);
    try {
      // Deletion logic would go here, but we're just managing modal state
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedProperty(null);
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

  return (
    <>
      <div className="space-y-3">
        {properties.map((property) => (
          <Card key={property.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-blue-600">#{property.codigo}</span>
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
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(property.id)}
                          title="Ver Detalhes"
                          type="button"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {canEdit() && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditProperty(property)}
                            title="Editar"
                            type="button"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}

                        {canDelete() && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(property)}
                            disabled={loading}
                            title="Excluir"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProperty(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Imóvel"
        message={selectedProperty ?
          `Tem certeza que deseja excluir o imóvel #${selectedProperty.codigo}? Esta ação não pode ser desfeita.` : ''
        }
        itemName={selectedProperty ?
          `${selectedProperty.endereco}, ${selectedProperty.bairro}` : ''
        }
        loading={loading}
      />
    </>
  );
}
