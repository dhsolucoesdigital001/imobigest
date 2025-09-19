import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Shield,
  Clock,
  Calendar,
  Eye
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const typeColors = {
  'Super Admin': 'bg-red-100 text-red-800 border-red-200',
  'Gerente': 'bg-purple-100 text-purple-800 border-purple-200',
  'Corretor': 'bg-blue-100 text-blue-800 border-blue-200',
  'Assistente': 'bg-green-100 text-green-800 border-green-200'
};

export default function UserList({ 
  users, 
  loading, 
  onEdit, 
  onDelete, 
  onNewUser 
}) {
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDaysAccess = (dias, restricao) => {
    if (!restricao) return 'Sem restrições';
    if (!dias || dias.length === 0) return 'Nenhum dia';
    if (dias.length === 7) return 'Todos os dias';
    return dias.join(', ');
  };

  const getPermissionCount = (permissoes) => {
    if (!permissoes) return 0;
    return permissoes.length;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Usuários Cadastrados ({users.length})
          </CardTitle>
          <Button onClick={onNewUser} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
        </CardHeader>
      </Card>

      {users.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum usuário cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Clique em "Convidar Usuário" para adicionar o primeiro membro da sua equipe.
            </p>
            <Button onClick={onNewUser} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Convidar Primeiro Usuário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {getInitials(user.full_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{user.full_name}</h3>
                      <Badge className={`${typeColors[user.tipo_usuario] || 'bg-gray-100 text-gray-800'} border text-xs`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.tipo_usuario}
                      </Badge>
                      {!user.ativo && (
                        <Badge variant="destructive" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">{user.cargo}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
                          {user.telefone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {user.telefone}</span>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {user.creci && <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> CRECI: {user.creci}</span>}
                          {user.meta_mensal && <span>Meta: {formatCurrency(user.meta_mensal)}</span>}
                        </div>
                        {user.restringir_acesso_horario && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{user.horario_inicio || 'N/D'} às {user.horario_fim || 'N/D'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDaysAccess(user.dias_acesso, user.restringir_acesso_horario)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{getPermissionCount(user.permissoes)} permissões</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="min-w-[80px]">
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 min-w-[80px]" onClick={() => onDelete(user.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}