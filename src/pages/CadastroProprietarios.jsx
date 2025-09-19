import React, { useState, useEffect } from "react";
import { Proprietario } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, User, Plus } from "lucide-react";

import ProprietarioForm from "../components/forms/ProprietarioForm";
import ProprietarioList from "../components/forms/ProprietarioList";

export default function CadastroProprietarios() {
  const [proprietarios, setProprietarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProprietario, setEditingProprietario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProprietarios();
  }, []);

  const loadProprietarios = async () => {
    try {
      const data = await Proprietario.list("-created_date");
      setProprietarios(data);
    } catch (error) {
      console.error("Erro ao carregar proprietários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (proprietarioData) => {
    try {
      if (editingProprietario) {
        await Proprietario.update(editingProprietario.id, proprietarioData);
      } else {
        await Proprietario.create(proprietarioData);
      }
      setShowForm(false);
      setEditingProprietario(null);
      loadProprietarios();
    } catch (error) {
      console.error("Erro ao salvar proprietário:", error);
    }
  };

  const handleEdit = (proprietario) => {
    setEditingProprietario(proprietario);
    setShowForm(true);
  };

  const handleDelete = async (proprietarioId) => {
    if (window.confirm("Tem certeza que deseja excluir este proprietário?")) {
      try {
        await Proprietario.delete(proprietarioId);
        loadProprietarios();
      } catch (error) {
        console.error("Erro ao excluir proprietário:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProprietario(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Proprietário</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os proprietários dos imóveis
            </p>
          </div>
        </div>
        
        {!showForm &&
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700">

            <Plus className="w-4 h-4 mr-2" />
            Novo Proprietário
          </Button>
        }
      </div>

      {/* Content */}
      {showForm ?
      <ProprietarioForm
        proprietario={editingProprietario}
        onSave={handleSave}
        onCancel={handleCancel} /> :


      <ProprietarioList
        proprietarios={proprietarios}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNewProprietario={() => setShowForm(true)} />

      }
    </div>);

}