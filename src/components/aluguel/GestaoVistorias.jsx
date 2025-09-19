import React, { useState, useEffect, useCallback } from "react";
import { VistoriaImovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Camera, FileText, Loader2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import VistoriaForm from "./VistoriaForm";
import DeleteConfirmModal from "../common/DeleteConfirmModal";

export default function GestaoVistorias() {
  const [vistorias, setVistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVistoria, setEditingVistoria] = useState(null);
  const [deletingVistoria, setDeletingVistoria] = useState(null);
  const { toast } = useToast();

  const loadVistorias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await VistoriaImovel.list("-created_date");
      setVistorias(data);
    } catch (error) {
      console.error("Erro ao carregar vistorias:", error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível buscar a lista de vistorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVistorias();
  }, [loadVistorias]);

  const handleSaveSuccess = () => {
    setShowForm(false);
    setEditingVistoria(null);
    loadVistorias();
  };

  const handleEdit = (vistoria) => {
    setEditingVistoria(vistoria);
    setShowForm(true);
  };
  
  const confirmDelete = async () => {
    if (!deletingVistoria) return;
    try {
      await VistoriaImovel.delete(deletingVistoria.id);
      toast({
        title: "Sucesso",
        description: `Vistoria excluída com sucesso.`,
      });
      setDeletingVistoria(null);
      loadVistorias();
    } catch (error) {
      console.error("Erro ao excluir vistoria:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir a vistoria.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-4 text-lg text-gray-600">Carregando vistorias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <VistoriaForm
          vistoria={editingVistoria}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingVistoria(null);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Camera className="w-6 h-6 text-purple-600" />
                Gestão de Vistorias
              </h2>
              <p className="text-gray-600">Controle de vistorias de entrada e saída</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Vistoria
            </Button>
          </div>

          {vistorias.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma vistoria cadastrada</h3>
                <p className="text-gray-500 mb-6">
                  As vistorias de entrada e saída dos imóveis aparecerão aqui.
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeira Vistoria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vistorias.map((vistoria) => (
                <Card key={vistoria.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-lg font-semibold text-gray-900">
                            Vistoria de {vistoria.tipo}
                          </h3>
                           <Badge variant="outline">{new Date(vistoria.data_vistoria).toLocaleDateString('pt-BR')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Contrato: #{vistoria.contrato_id?.slice(-4) || 'N/A'} | Responsável: {vistoria.responsavel_vistoria || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" /> Laudo
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(vistoria)}>
                          <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                         <Button variant="destructive-outline" size="sm" onClick={() => setDeletingVistoria(vistoria)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      <DeleteConfirmModal
        isOpen={!!deletingVistoria}
        onClose={() => setDeletingVistoria(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir esta vistoria?`}
      />
    </div>
  );
}