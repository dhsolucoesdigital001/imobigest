
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Save,
  Clock,
  Shield,
  Edit3
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function MinhaConta() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setFormData({
        full_name: user.full_name || '',
        telefone: user.telefone || '',
        celular: user.celular || '',
        cargo: user.cargo || '',
        observacoes: user.observacoes || ''
      });
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // `toast` is a dependency here because it's called inside loadCurrentUser

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]); // `loadCurrentUser` is now stable due to useCallback

  const handleSave = async () => {
    try {
      await User.updateMyUserData(formData);
      await loadCurrentUser(); // Recarregar dados atualizados
      setEditing(false);
      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getTipoUsuarioColor = (tipo) => {
    const colors = {
      'Super Admin': 'bg-red-100 text-red-800 border-red-200',
      'Gerente': 'bg-purple-100 text-purple-800 border-purple-200',
      'Corretor': 'bg-blue-100 text-blue-800 border-blue-200',
      'Assistente': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Erro ao carregar informações do usuário.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
        
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700">
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-2xl">
                {getInitials(currentUser.full_name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {currentUser.full_name || 'Nome não informado'}
            </h3>
            <p className="text-gray-600 mb-4">{currentUser.email}</p>
            
            <Badge className={`${getTipoUsuarioColor(currentUser.tipo_usuario)} border mb-4`}>
              <Shield className="w-3 h-3 mr-1" />
              {currentUser.tipo_usuario || 'Usuário'}
            </Badge>

            <Separator className="my-4" />
            
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Cadastrado em: {new Date(currentUser.created_date).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {currentUser.data_ultimo_acesso && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Último acesso: {new Date(currentUser.data_ultimo_acesso).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  {editing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">
                      {currentUser.full_name || 'Não informado'}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>E-mail</Label>
                  <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {currentUser.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">E-mail não pode ser alterado</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  {editing ? (
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      placeholder="(31) 3333-4444"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">
                      {currentUser.telefone || 'Não informado'}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="celular">Celular/WhatsApp</Label>
                  {editing ? (
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => handleChange('celular', e.target.value)}
                      placeholder="(31) 99999-8888"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">
                      {currentUser.celular || 'Não informado'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  {editing ? (
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleChange('cargo', e.target.value)}
                      placeholder="Seu cargo na empresa"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">
                      {currentUser.cargo || 'Não informado'}
                    </p>
                  )}
                </div>
                
                {currentUser.creci && (
                  <div>
                    <Label>CRECI</Label>
                    <p className="text-gray-900 font-medium mt-1">
                      {currentUser.creci}
                    </p>
                  </div>
                )}
              </div>

              {editing ? (
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                    placeholder="Informações adicionais..."
                    className="h-24"
                  />
                </div>
              ) : currentUser.observacoes ? (
                <div>
                  <Label>Observações</Label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                    {currentUser.observacoes}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
