import React, { useState, useEffect } from "react";
import { Cliente } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, UserCheck, Plus } from "lucide-react";

import ClienteForm from "../components/forms/ClienteForm";
import ClienteList from "../components/forms/ClienteList";

export default function CadastroClientes() {
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await Cliente.list("-created_date");
      setClientes(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (clienteData) => {
    try {
      if (editingCliente) {
        await Cliente.update(editingCliente.id, clienteData);
      } else {
        await Cliente.create(clienteData);
      }
      setShowForm(false);
      setEditingCliente(null);
      loadClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleDelete = async (clienteId) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await Cliente.delete(clienteId);
        loadClientes();
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCliente(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Clientes</h1>
            <p className="text-gray-600 mt-1">
              Gerencie sua carteira de clientes interessados
            </p>
          </div>
        </div>
        
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Content */}
      {showForm ? (
        <ClienteForm 
          cliente={editingCliente}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <ClienteList 
          clientes={clientes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNewCliente={() => setShowForm(true)}
        />
      )}
    </div>
  );
}