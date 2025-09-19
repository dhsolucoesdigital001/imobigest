import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { FichaVisita } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import FichaVisitaList from "../components/visitas/FichaVisitaList";
import FichaVisitaForm from "../components/visitas/FichaVisitaForm";

export default function FichaVisitaPage() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFicha, setEditingFicha] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast({ title: "Erro", description: "Não foi possível identificar o usuário logado.", variant: "destructive" });
    }
  }, [toast]);
  
  const loadFichas = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let data = [];
      const isAdmin = currentUser.tipo_usuario === 'Super Admin' || currentUser.tipo_usuario === 'Gerente';
      if (isAdmin) {
        data = await FichaVisita.list("-created_date");
      } else {
        data = await FichaVisita.filter({ corretor_id: currentUser.id }, "-created_date");
      }
      setFichas(data);
    } catch (error) {
      console.error("Erro ao carregar fichas de visita:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar as fichas de visita.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      loadFichas();
    }
  }, [currentUser, loadFichas]);
  
  const handleSave = async (data) => {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        usuario: currentUser.full_name,
        acao: editingFicha ? "Edição da Ficha" : "Criação da Ficha",
      };
      
      const dataToSave = { ...data, historico: [...(data.historico || []), logEntry] };

      if (editingFicha) {
        await FichaVisita.update(editingFicha.id, dataToSave);
        toast({ title: "Sucesso!", description: "Ficha de visita atualizada." });
      } else {
        await FichaVisita.create(dataToSave);
        toast({ title: "Sucesso!", description: "Ficha de visita criada." });
      }
      handleCancel();
      loadFichas();
    } catch (error) {
      console.error("Erro ao salvar ficha:", error);
      toast({ title: "Erro", description: "Não foi possível salvar a ficha. Tente novamente.", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await FichaVisita.delete(id);
      toast({ title: "Sucesso!", description: "Ficha de visita excluída." });
      loadFichas();
    } catch (error) {
      console.error("Erro ao excluir ficha:", error);
      toast({ title: "Erro", description: "Não foi possível excluir a ficha.", variant: "destructive" });
    }
  };

  const handleEdit = (ficha) => {
    setEditingFicha(ficha);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingFicha(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fichas de Visita</h1>
          <p className="text-gray-600 mt-1">Gerencie, crie e emita as fichas de visita aos imóveis.</p>
        </div>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova Ficha
          </Button>
        ) : (
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Lista
          </Button>
        )}
      </div>

      {showForm ? (
        <FichaVisitaForm 
          onSave={handleSave} 
          onCancel={handleCancel} 
          ficha={editingFicha}
          currentUser={currentUser}
        />
      ) : (
        <FichaVisitaList
          fichas={fichas}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}