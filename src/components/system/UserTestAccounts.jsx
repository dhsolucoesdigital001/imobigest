import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/api/entities";
import { Users, Plus, Shield, UserCheck, User as UserIcon, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function UserTestAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await User.list();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTestAccounts = async () => {
    setCreating(true);
    try {
      // Nota: Na Base44, usuários são criados via convite pela plataforma
      // Aqui só mostramos as informações sobre como criar contas de teste
      
      toast({
        title: "Informação",
        description: "Contas de teste devem ser criadas via convite no painel da Base44.",
        variant: "default"
      });

      // Simular criação de usuários de exemplo para demonstrar a estrutura
      const testUsers = [
        {
          full_name: "Super Admin Teste",
          email: "admin@test.com",
          tipo_usuario: "Super Admin",
          permissoes: [
            "dashboard_ver", "imoveis_criar", "imoveis_editar", "imoveis_ver", "imoveis_excluir",
            "clientes_criar", "clientes_editar", "clientes_ver", "clientes_excluir",
            "corretores_criar", "corretores_editar", "corretores_ver", "corretores_excluir",
            "proprietarios_criar", "proprietarios_editar", "proprietarios_ver", "proprietarios_excluir",
            "visitas_criar", "visitas_editar", "visitas_ver", "visitas_excluir",
            "relatorios_ver", "relatorios_exportar", "portal_config", "usuarios_gerenciar", "sistema_configurar"
          ],
          ativo: true
        },
        {
          full_name: "Corretor Teste",
          email: "corretor@test.com",
          tipo_usuario: "Corretor",
          creci: "12345-MG",
          permissoes: [
            "dashboard_ver", "imoveis_ver", "clientes_criar", "clientes_editar", "clientes_ver",
            "visitas_criar", "visitas_editar", "visitas_ver", "relatorios_ver"
          ],
          comissao_padrao: 6,
          meta_mensal: 5,
          ativo: true
        },
        {
          full_name: "Assistente Teste", 
          email: "assistente@test.com",
          tipo_usuario: "Assistente",
          permissoes: [
            "dashboard_ver", "imoveis_ver", "clientes_ver", "visitas_ver", "relatorios_ver"
          ],
          ativo: true
        }
      ];

      console.log("Estrutura de usuários de teste:", testUsers);
      
    } catch (error) {
      console.error("Erro ao criar contas de teste:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar as contas de teste.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getUserIcon = (tipo) => {
    switch (tipo) {
      case "Super Admin": return Shield;
      case "Corretor": return UserCheck;
      case "Assistente": return UserIcon;
      default: return UserIcon;
    }
  };

  const getUserColor = (tipo) => {
    switch (tipo) {
      case "Super Admin": return "bg-red-100 text-red-800 border-red-200";
      case "Corretor": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Assistente": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const usersByType = users.reduce((acc, user) => {
    const type = user.tipo_usuario || 'Outros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(user);
    return acc;
  }, {});

  const requiredTypes = ['Super Admin', 'Corretor', 'Assistente'];
  const missingTypes = requiredTypes.filter(type => !usersByType[type] || usersByType[type].length === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas de Teste</h2>
          <p className="text-gray-600">Validação de usuários para diferentes perfis de acesso</p>
        </div>
        <Button onClick={createTestAccounts} disabled={creating}>
          <Plus className="w-4 h-4 mr-2" />
          {creating ? "Criando..." : "Orientações"}
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {requiredTypes.map(type => {
          const count = usersByType[type]?.length || 0;
          const Icon = getUserIcon(type);
          
          return (
            <Card key={type} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {count > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                    </div>
                  </div>
                  <Icon className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts for Missing Types */}
      {missingTypes.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Tipos de usuário faltando:</strong> {missingTypes.join(', ')}. 
            Crie usuários destes tipos para testar todas as funcionalidades.
          </AlertDescription>
        </Alert>
      )}

      {/* Users by Type */}
      <div className="space-y-6">
        {requiredTypes.map(type => {
          const typeUsers = usersByType[type] || [];
          const Icon = getUserIcon(type);
          
          return (
            <Card key={type} className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {type} ({typeUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Nenhum usuário do tipo {type} encontrado</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Convide um usuário com este perfil pelo painel da Base44
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typeUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-gray-600">
                              {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || 'Nome não informado'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getUserColor(user.tipo_usuario)}>
                            {user.tipo_usuario}
                          </Badge>
                          <Badge className={user.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {user.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          {user.permissoes && (
                            <span className="text-sm text-gray-500">
                              {user.permissoes.length} permissões
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="border-none shadow-lg bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Instruções para Criação de Contas de Teste</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-3">
            <p><strong>1. Super Admin:</strong> Acesso total ao sistema, pode gerenciar usuários e configurações.</p>
            <p><strong>2. Corretor:</strong> Pode gerenciar imóveis, clientes e visitas. Tem metas e comissões.</p>
            <p><strong>3. Assistente:</strong> Acesso básico para consulta e operações limitadas.</p>
            <br />
            <p className="text-sm">
              <strong>Nota:</strong> As contas devem ser criadas através do sistema de convites da Base44. 
              Após criadas, você pode ajustar permissões e configurações através da Gestão de Usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}