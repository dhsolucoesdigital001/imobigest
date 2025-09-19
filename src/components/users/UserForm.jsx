import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, User, Shield, Clock, Settings } from "lucide-react";

const tiposUsuario = ["Super Admin", "Gerente", "Corretor", "Assistente"];
const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

// Definição completa de permissões organizadas por módulo
const permissoesDisponiveis = {
  dashboard: ["dashboard.view"],
  imoveis: ["imoveis.view", "imoveis.edit", "imoveis.delete"],
  proprietarios: ["proprietarios.view", "proprietarios.edit", "proprietarios.delete"],
  clientes: ["clientes.view", "clientes.edit", "clientes.delete"],
  corretores: ["corretores.view", "corretores.edit", "corretores.delete"],
  visitas: ["visitas.view", "visitas.edit", "visitas.delete"],
  gestao_aluguel: ["gestao_aluguel.view", "gestao_aluguel.edit", "gestao_aluguel.financeiro"],
  relatorios: ["relatorios.view", "relatorios.export"],
  usuarios: ["usuarios.view", "usuarios.edit", "usuarios.delete"],
  configuracoes: ["configuracoes.view", "configuracoes.edit"],
  portal_publico: ["portal_publico.view", "portal_publico.edit"],
  marketing: ["marketing.view", "marketing.edit"],
  integracoes: ["integracoes.view", "integracoes.edit"]
};

// Labels amigáveis para as permissões
const permissoesLabels = {
  "dashboard.view": "Ver Dashboard",
  "imoveis.view": "Ver Imóveis", "imoveis.edit": "Editar Imóveis", "imoveis.delete": "Excluir Imóveis",
  "proprietarios.view": "Ver Proprietários", "proprietarios.edit": "Editar Proprietários", "proprietarios.delete": "Excluir Proprietários",
  "clientes.view": "Ver Clientes", "clientes.edit": "Editar Clientes", "clientes.delete": "Excluir Clientes",
  "corretores.view": "Ver Corretores", "corretores.edit": "Editar Corretores", "corretores.delete": "Excluir Corretores",
  "visitas.view": "Ver Visitas", "visitas.edit": "Editar Visitas", "visitas.delete": "Excluir Visitas",
  "gestao_aluguel.view": "Ver Gestão de Aluguel", "gestao_aluguel.edit": "Editar Contratos", "gestao_aluguel.financeiro": "Gestão Financeira",
  "relatorios.view": "Ver Relatórios", "relatorios.export": "Exportar Relatórios",
  "usuarios.view": "Ver Usuários", "usuarios.edit": "Editar Usuários", "usuarios.delete": "Excluir Usuários",
  "configuracoes.view": "Ver Configurações", "configuracoes.edit": "Editar Configurações",
  "portal_publico.view": "Ver Portal Público", "portal_publico.edit": "Editar Portal Público",
  "marketing.view": "Ver Marketing", "marketing.edit": "Editar Marketing",
  "integracoes.view": "Ver Integrações", "integracoes.edit": "Editar Integrações"
};

// Regras automáticas de permissões baseadas no tipo de usuário
const getPermissoesPorTipo = (tipo) => {
  const todasPermissoes = Object.values(permissoesDisponiveis).flat();
  
  switch (tipo) {
    case 'Super Admin':
      return todasPermissoes; // Todas as permissões
    case 'Gerente':
      return todasPermissoes.filter(p => !p.includes('usuarios.delete') || !p.includes('Super Admin')); // Quase todas, exceto deletar usuários
    case 'Corretor':
      return [
        'dashboard.view',
        'imoveis.view', 'imoveis.edit', 'imoveis.delete',
        'proprietarios.view', 'proprietarios.edit',
        'clientes.view', 'clientes.edit', 'clientes.delete',
        'visitas.view', 'visitas.edit', 'visitas.delete',
        'gestao_aluguel.view', 'gestao_aluguel.edit',
        'relatorios.view'
      ];
    case 'Assistente':
      return [
        'dashboard.view',
        'imoveis.view',
        'proprietarios.view',
        'clientes.view', 'clientes.edit', 'clientes.delete',
        'visitas.view', 'visitas.edit', 'visitas.delete',
        'relatorios.view'
      ];
    default:
      return ['dashboard.view'];
  }
};

export default function UserForm({ user, onSave, onCancel }) {
  const isNewUser = !user;
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    tipo_usuario: user?.tipo_usuario || 'Assistente',
    creci: user?.creci || '',
    telefone: user?.telefone || '',
    celular: user?.celular || '',
    cargo: user?.cargo || '',
    meta_mensal: user?.meta_mensal || '',
    comissao_padrao: user?.comissao_padrao || '',
    horario_inicio: user?.horario_inicio || '08:00',
    horario_fim: user?.horario_fim || '18:00',
    dias_acesso: user?.dias_acesso || ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    permissoes: user?.permissoes || getPermissoesPorTipo('Assistente'),
    observacoes: user?.observacoes || '',
    ativo: user?.ativo !== false,
    restringir_acesso_horario: user?.restringir_acesso_horario || false
  });

  const [errors, setErrors] = useState({});

  // Atualizar permissões automaticamente quando o tipo de usuário muda
  useEffect(() => {
    const novasPermissoes = getPermissoesPorTipo(formData.tipo_usuario);
    setFormData(prev => ({ ...prev, permissoes: novasPermissoes }));
  }, [formData.tipo_usuario]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayChange = (field, item, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], item]
        : prev[field].filter(i => i !== item)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    if (!formData.cargo.trim()) newErrors.cargo = 'Cargo é obrigatório';

    if (formData.restringir_acesso_horario && formData.dias_acesso.length === 0) {
      newErrors.dias_acesso = 'Selecione pelo menos um dia da semana';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        meta_mensal: parseFloat(formData.meta_mensal) || 0,
        comissao_padrao: parseFloat(formData.comissao_padrao) || 0
      };
      onSave(processedData);
    }
  };

  const handleSelectAllPermissions = (categoria) => {
    const categoryPermissions = permissoesDisponiveis[categoria] || [];
    const allSelected = categoryPermissions.every(p => formData.permissoes.includes(p));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissoes: prev.permissoes.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissoes: [...new Set([...prev.permissoes, ...categoryPermissions])]
      }));
    }
  };

  const isPermissoesDisabled = formData.tipo_usuario === 'Super Admin';

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          {isNewUser ? 'Convidar Novo Usuário' : `Editar Usuário: ${user.full_name}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isNewUser && (
          <div className="p-4 mb-6 text-center bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800">Como convidar um novo usuário?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Para adicionar um novo usuário, primeiro o convide através do painel de administração da plataforma Base44. Após o usuário aceitar o convite e se registrar, ele aparecerá na lista e você poderá editar suas permissões, horários e outras informações aqui.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados" className="flex items-center gap-2"><User className="w-4 h-4" /> Dados Pessoais</TabsTrigger>
              <TabsTrigger value="tipo" className="flex items-center gap-2"><Shield className="w-4 h-4" /> Tipo e Permissões</TabsTrigger>
              <TabsTrigger value="acesso" className="flex items-center gap-2"><Clock className="w-4 h-4" /> Horários</TabsTrigger>
              <TabsTrigger value="comercial" className="flex items-center gap-2"><Settings className="w-4 h-4" /> Comercial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name} 
                    onChange={(e) => handleInputChange('full_name', e.target.value)} 
                    placeholder="Nome completo do usuário" 
                    disabled={!isNewUser} 
                    className={errors.full_name ? 'border-red-500' : ''} 
                  />
                  {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                    placeholder="email@dominio.com" 
                    disabled={!isNewUser} 
                    className={errors.email ? 'border-red-500' : ''} 
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo/Função *</Label>
                  <Input 
                    id="cargo" 
                    value={formData.cargo} 
                    onChange={(e) => handleInputChange('cargo', e.target.value)} 
                    placeholder="Ex: Corretor Sênior" 
                    className={errors.cargo ? 'border-red-500' : ''} 
                  />
                  {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>}
                </div>
                <div>
                  <Label htmlFor="creci">CRECI</Label>
                  <Input 
                    id="creci" 
                    value={formData.creci} 
                    onChange={(e) => handleInputChange('creci', e.target.value)} 
                    placeholder="000000-F" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    value={formData.telefone} 
                    onChange={(e) => handleInputChange('telefone', e.target.value)} 
                    placeholder="(31) 3333-4444" 
                  />
                </div>
                <div>
                  <Label htmlFor="celular">Celular/WhatsApp</Label>
                  <Input 
                    id="celular" 
                    value={formData.celular} 
                    onChange={(e) => handleInputChange('celular', e.target.value)} 
                    placeholder="(31) 99999-8888" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tipo" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_usuario">Tipo de Usuário *</Label>
                  <Select value={formData.tipo_usuario} onValueChange={(value) => handleInputChange('tipo_usuario', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposUsuario.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    As permissões são definidas automaticamente baseadas no tipo selecionado
                  </p>
                </div>
              </div>

              {isPermissoesDisabled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Super Admin</h4>
                  <p className="text-sm text-yellow-700">
                    Super Administradores possuem acesso total ao sistema automaticamente. Não é necessário configurar permissões específicas.
                  </p>
                </div>
              )}

              {!isPermissoesDisabled && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Permissões do Sistema</Label>
                    <p className="text-sm text-gray-600">
                      As permissões foram definidas automaticamente com base no tipo de usuário. Você pode ajustá-las conforme necessário.
                    </p>
                  </div>
                  
                  {Object.entries(permissoesDisponiveis).map(([categoria, permissoes]) => (
                    <div key={categoria} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {categoria.replace('_', ' ')}
                        </h4>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectAllPermissions(categoria)}
                        >
                          {permissoes.every(p => formData.permissoes.includes(p)) ? 'Desmarcar Todas' : 'Marcar Todas'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissoes.map(permissao => (
                          <div key={permissao} className="flex items-center space-x-2">
                            <Checkbox 
                              id={permissao} 
                              checked={formData.permissoes.includes(permissao)} 
                              onCheckedChange={(checked) => handleArrayChange('permissoes', permissao, checked)} 
                            />
                            <Label htmlFor={permissao} className="text-sm">
                              {permissoesLabels[permissao]}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="acesso" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="restringir_acesso_horario" 
                  checked={formData.restringir_acesso_horario} 
                  onCheckedChange={(checked) => handleInputChange('restringir_acesso_horario', checked)} 
                />
                <Label htmlFor="restringir_acesso_horario" className="text-base font-medium">
                  Definir Horários e Dias de Acesso
                </Label>
              </div>

              {formData.restringir_acesso_horario && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horario_inicio">Horário de Início</Label>
                      <Input 
                        id="horario_inicio" 
                        type="time" 
                        value={formData.horario_inicio} 
                        onChange={(e) => handleInputChange('horario_inicio', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="horario_fim">Horário Final</Label>
                      <Input 
                        id="horario_fim" 
                        type="time" 
                        value={formData.horario_fim} 
                        onChange={(e) => handleInputChange('horario_fim', e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Dias da Semana Permitidos *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {diasSemana.map(dia => (
                        <div key={dia} className="flex items-center space-x-2">
                          <Checkbox 
                            id={dia} 
                            checked={formData.dias_acesso.includes(dia)} 
                            onCheckedChange={(checked) => handleArrayChange('dias_acesso', dia, checked)} 
                          />
                          <Label htmlFor={dia} className="text-sm">{dia}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.dias_acesso && <p className="text-red-500 text-sm mt-1">{errors.dias_acesso}</p>}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="comercial" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_mensal">Meta Mensal (R$)</Label>
                  <Input 
                    id="meta_mensal" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.meta_mensal} 
                    onChange={(e) => handleInputChange('meta_mensal', e.target.value)} 
                    placeholder="50000.00" 
                  />
                </div>
                <div>
                  <Label htmlFor="comissao_padrao">Comissão Padrão (%)</Label>
                  <Input 
                    id="comissao_padrao" 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.1" 
                    value={formData.comissao_padrao} 
                    onChange={(e) => handleInputChange('comissao_padrao', e.target.value)} 
                    placeholder="3.0" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  value={formData.observacoes} 
                  onChange={(e) => handleInputChange('observacoes', e.target.value)} 
                  placeholder="Observações sobre o usuário..." 
                  className="h-24" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ativo" 
                  checked={formData.ativo} 
                  onCheckedChange={(checked) => handleInputChange('ativo', checked)} 
                />
                <Label htmlFor="ativo">Usuário Ativo</Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            {!isNewUser && (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}