import React, { useState, useEffect, useCallback } from "react";
import { ManutencaoImovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, AlertTriangle, Clock, Loader2, Edit, Trash2, FileText, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ManutencaoForm from "./ManutencaoForm";
import DeleteConfirmModal from "../common/DeleteConfirmModal";

export default function GestaoManutencoes() {
  const [manutencoes, setManutencoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManutencao, setEditingManutencao] = useState(null);
  const [deletingManutencao, setDeletingManutencao] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { toast } = useToast();

  const loadManutencoes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ManutencaoImovel.list("-created_date");
      setManutencoes(data);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível buscar a lista de manutenções.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadManutencoes();
  }, [loadManutencoes]);

  const handleSaveSuccess = () => {
    setShowForm(false);
    setEditingManutencao(null);
    loadManutencoes();
  };

  const handleEdit = (manutencao) => {
    setEditingManutencao(manutencao);
    setShowForm(true);
  };
  
  const confirmDelete = async () => {
    if (!deletingManutencao) return;
    try {
      await ManutencaoImovel.delete(deletingManutencao.id);
      toast({
        title: "Sucesso",
        description: "Manutenção excluída com sucesso.",
      });
      setDeletingManutencao(null);
      loadManutencoes();
    } catch (error) {
      console.error("Erro ao excluir manutenção:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir a manutenção.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solicitada': return 'bg-blue-100 text-blue-800';
      case 'Aguardando Orçamento': return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Aprovação': return 'bg-orange-100 text-orange-800';
      case 'Aprovada': return 'bg-green-100 text-green-800';
      case 'Em Execução': return 'bg-indigo-100 text-indigo-800';
      case 'Concluída': return 'bg-gray-100 text-gray-800';
      case 'Rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'Urgente': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const filteredManutencoes = manutencoes.filter(manutencao => {
    if (filtroStatus === "todos") return true;
    if (filtroStatus === "abertas") return ['Solicitada', 'Aguardando Orçamento', 'Aguardando Aprovação', 'Aprovada', 'Em Execução'].includes(manutencao.status);
    if (filtroStatus === "concluidas") return manutencao.status === 'Concluída';
    if (filtroStatus === "urgentes") return manutencao.prioridade === 'Urgente';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <span className="ml-4 text-lg text-gray-600">Carregando manutenções...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <ManutencaoForm
          manutencao={editingManutencao}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingManutencao(null);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-orange-600" />
                Gestão de Manutenções
              </h2>
              <p className="text-gray-600">Solicitações e acompanhamento de manutenções</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Manutenção
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filtroStatus === "todos" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFiltroStatus("todos")}
                >
                  Todas
                </Button>
                <Button 
                  variant={filtroStatus === "abertas" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFiltroStatus("abertas")}
                >
                  Abertas
                </Button>
                <Button 
                  variant={filtroStatus === "concluidas" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFiltroStatus("concluidas")}
                >
                  Concluídas
                </Button>
                <Button 
                  variant={filtroStatus === "urgentes" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFiltroStatus("urgentes")}
                >
                  Urgentes
                </Button>
              </div>
            </CardContent>
          </Card>

          {filteredManutencoes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Wrench className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {filtroStatus === "todos" ? "Nenhuma manutenção cadastrada" : `Nenhuma manutenção ${filtroStatus.toLowerCase()}`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filtroStatus === "todos" ? "As solicitações de manutenção dos inquilinos aparecerão aqui." : `Ajuste os filtros ou cadastre novas manutenções.`}
                </p>
                {filtroStatus === "todos" && (
                  <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeira Manutenção
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredManutencoes.map((manutencao) => (
                <Card key={manutencao.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {manutencao.titulo}
                          </h3>
                          <Badge className={getStatusColor(manutencao.status)}>
                            {manutencao.status}
                          </Badge>
                          <Badge className={getPrioridadeColor(manutencao.prioridade)}>
                            {manutencao.prioridade}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <p className="font-medium text-gray-800">Tipo</p>
                            <p>{manutencao.tipo}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Solicitado em</p>
                            <p>{new Date(manutencao.data_solicitacao).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Prazo</p>
                            <p>{manutencao.data_prazo ? new Date(manutencao.data_prazo).toLocaleDateString('pt-BR') : 'Não definido'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Custo Estimado</p>
                            <p className="text-green-600 font-semibold">
                              {manutencao.orcamentos && manutencao.orcamentos.length > 0 
                                ? formatCurrency(Math.min(...manutencao.orcamentos.map(o => o.valor)))
                                : 'Aguardando orçamento'
                              }
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Descrição:</span> {manutencao.descricao}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(manutencao)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Relatório
                        </Button>
                        <Button variant="destructive-outline" size="sm" onClick={() => setDeletingManutencao(manutencao)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
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
        isOpen={!!deletingManutencao}
        onClose={() => setDeletingManutencao(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir esta manutenção?`}
      />
    </div>
  );
}