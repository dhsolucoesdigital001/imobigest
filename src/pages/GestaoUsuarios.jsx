import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Users, Plus, Shield, Clock } from "lucide-react";

import UserForm from "../components/users/UserForm";
import UserList from "../components/users/UserList";

export default function GestaoUsuarios() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await User.list("-created_date");
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await User.update(editingUser.id, userData);
      } else {
        // A criação de usuários é feita via convite pelo painel da Base44,
        // aqui apenas atualizamos os dados customizados.
        // Se a lógica de criação fosse permitida, seria algo como:
        // await User.create(userData);
        console.warn("A criação de novos usuários deve ser feita pelo painel de administração da plataforma.");
      }
      setShowForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      try {
        await User.delete(userId);
        loadUsers();
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }
  
  if (currentUser && currentUser.tipo_usuario !== "Super Admin") {
    return (
      <div className="p-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h3>
            <p className="text-gray-500 mb-6">
              Apenas Super Administradores podem acessar a gestão de usuários.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600 mt-1">
              Controle total de usuários, permissões e horários de acesso
            </p>
          </div>
        </div>
        
        {!showForm && (
          <Button 
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário (Convidar)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total de Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.ativo).length}
                </p>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.tipo_usuario === "Corretor").length}
                </p>
                <p className="text-sm text-gray-600">Corretores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.dias_acesso && u.dias_acesso.length < 7).length}
                </p>
                <p className="text-sm text-gray-600">Com Restrições</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm ? (
        <UserForm 
          user={editingUser}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <UserList 
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNewUser={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}