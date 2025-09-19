import React, { useState, useEffect, useCallback } from "react";
import { ContratoLocacao, Imovel, User, Cliente, Proprietario } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, FileText, Search, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DeleteConfirmModal from "../common/DeleteConfirmModal";

import ContratoForm from "./ContratoForm";

export default function ContratosLocacao({ onUpdateStats }) {
  const [contratos, setContratos] = useState([]);
  const [filteredContratos, setFilteredContratos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingContrato, setDeletingContrato] = useState(null);
  const { toast } = useToast();

  const loadContratos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ContratoLocacao.list("-created_date");
      setContratos(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      toast({
        title: "Erro ao Carregar Contratos",
        description: "Não foi possível buscar a lista de contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    loadContratos();
  }, [loadContratos]);

  const filterContratos = useCallback(() => {
    let filtered = [...contratos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contrato =>
        contrato.numero_contrato?.toLowerCase().includes(term) ||
        contrato.status?.toLowerCase().includes(term)
      );
    }

    setFilteredContratos(filtered);
  }, [contratos, searchTerm]);

  useEffect(() => {
    filterContratos();
  }, [contratos, searchTerm, filterContratos]);

  const handleSaveSuccess = async () => {
    setShowForm(false);
    setEditingContrato(null);
    await loadContratos();
    if (onUpdateStats) {
      onUpdateStats();
    }
  };

  const handleEdit = (contrato) => {
    setEditingContrato(contrato);
    setShowForm(true);
  };

  const handleDeleteRequest = (contrato) => {
    setDeletingContrato(contrato);
  };

  const confirmDelete = async () => {
    if (!deletingContrato) return;
    try {
      await ContratoLocacao.delete(deletingContrato.id);
      toast({
        title: "Sucesso",
        description: `Contrato #${deletingContrato.numero_contrato} excluído com sucesso.`,
      });
      setDeletingContrato(null);
      await loadContratos();
      if (onUpdateStats) {
        onUpdateStats();
      }
    } catch (error) {
      console.error("Erro ao excluir contrato:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o contrato.",
        variant: "destructive",
      });
      setDeletingContrato(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Encerrado': return 'bg-gray-100 text-gray-800';
      case 'Em renovação': return 'bg-yellow-100 text-yellow-800';
      case 'Inadimplente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-4 text-lg text-gray-600">Carregando contratos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <ContratoForm
          contrato={editingContrato}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingContrato(null);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contratos de Locação</h2>
              <p className="text-gray-600">Gerencie todos os contratos de aluguel</p>
            </div>
            <Button onClick={() => { setEditingContrato(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>

          {/* Filters */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por número do contrato ou status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
            </CardContent>
          </Card>

          {/* Contratos List */}
          {filteredContratos.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum contrato encontrado</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Nenhum contrato corresponde aos filtros aplicados" : "Comece cadastrando seu primeiro contrato de locação"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => { setEditingContrato(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contrato
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredContratos.map((contrato) => (
                <Card key={contrato.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Contrato #{contrato.numero_contrato}
                          </h3>
                          <Badge className={getStatusColor(contrato.status)}>
                            {contrato.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-800">Período</p>
                            <p>{contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString('pt-BR') : '-'} até {contrato.data_fim ? new Date(contrato.data_fim).toLocaleDateString('pt-BR') : '-'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Valor do Aluguel</p>
                            <p className="text-green-600 font-semibold">{formatCurrency(contrato.valor_aluguel)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Vencimento</p>
                            <p>Dia {contrato.dia_vencimento} de cada mês</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Próximo Reajuste</p>
                            <p>{contrato.data_proximo_reajuste ? new Date(contrato.data_proximo_reajuste).toLocaleDateString('pt-BR') : 'Não definido'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(contrato)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
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
        isOpen={!!deletingContrato}
        onClose={() => setDeletingContrato(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão de Contrato"
        message={`Tem certeza que deseja excluir o contrato #${deletingContrato?.numero_contrato}?`}
        itemName="Esta ação é irreversível e removerá todos os dados financeiros associados."
        loading={false} // You can add a state for loading during delete if needed
      />
    </div>
  );
}