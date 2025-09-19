
import React, { useState, useEffect } from "react";
import { Imovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Building2, Plus } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast"; // Adicionado useToast
import webhookService from "../components/services/webhookService"; // Adicionado webhookService

import PropertyForm from "../components/forms/PropertyForm";
import PropertyFormList from "../components/forms/PropertyFormList";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";

export default function CadastroImoveis() {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const { toast } = useToast(); // Inicializado o toast

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await Imovel.list("-created_date");
      setProperties(data);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (propertyData) => {
    try {
      let message = "";
      if (editingProperty) {
        await Imovel.update(editingProperty.id, propertyData);
        webhookService.onPropertyUpdated({ ...propertyData, id: editingProperty.id });
        message = "Imóvel atualizado com sucesso.";
      } else {
        const newProperty = await Imovel.create(propertyData);
        // Assuming newProperty object returned by Imovel.create contains the ID
        webhookService.onPropertyCreated({ ...propertyData, id: newProperty.id }); 
        message = "Imóvel cadastrado com sucesso.";
      }
      
      toast({ title: "Sucesso!", description: message });

      setShowForm(false);
      setEditingProperty(null);
      loadProperties();
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os dados do imóvel. Tente novamente.", variant: "destructive" });
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const openDeleteModal = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => { // This is the new handleDelete, called by the modal
    if (!propertyToDelete) return;
    try {
      await Imovel.delete(propertyToDelete.id);
      loadProperties();
      toast({ title: "Sucesso!", description: "Imóvel excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      toast({ title: "Erro ao Excluir", description: "Não foi possível excluir o imóvel. Tente novamente.", variant: "destructive" });
    } finally {
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Imóveis</h1>
            <p className="text-gray-600 mt-1">
              Gerencie o portfólio de imóveis da sua imobiliária
            </p>
          </div>
        </div>
        
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Imóvel
          </Button>
        )}
      </div>

      {/* Content */}
      {showForm ? (
        <PropertyForm 
          property={editingProperty}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <PropertyFormList 
          properties={properties}
          loading={loading}
          onEdit={handleEdit}
          onDelete={openDeleteModal}
          onNewProperty={() => setShowForm(true)}
        />
      )}
      <Toaster />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o imóvel "${propertyToDelete?.codigo || 'este imóvel'}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
