import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Bot, Settings, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AgentForm({ agent, onSave, onCancel }) {
  const [formData, setFormData] = useState(agent || {
    nome: "",
    role: "",
    descricao: "",
    tarefas: [],
    configuracao: {
      execucao_automatica: false,
      frequencia: "Manual",
      horario_execucao: "09:00",
      notificar_admin: true,
      integracoes_ativas: []
    },
    prompt_sistema: "",
    status: true
  });
  
  const [novaTarefa, setNovaTarefa] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const roles = [
    "Assistente Financeiro",
    "Gestor de Contratos", 
    "Atendimento ao Cliente",
    "Gestor de Imóveis",
    "Analista de Vendas",
    "Personalizado"
  ];

  const integracoes = [
    "contratos", "pagamentos", "relatorios", "portal", 
    "whatsapp", "clientes", "visitas", "imoveis", "documentos", "vistorias"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.role || !formData.descricao) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha nome, função e descrição do agente.",
        variant: "destructive"
      });
      return;
    }

    if (formData.tarefas.length === 0) {
      toast({
        title: "Tarefas Obrigatórias",
        description: "Adicione pelo menos uma tarefa para o agente.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      toast({
        title: "Agente Salvo",
        description: `Agente ${formData.nome} foi salvo com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o agente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const adicionarTarefa = () => {
    if (novaTarefa.trim()) {
      setFormData({
        ...formData,
        tarefas: [...formData.tarefas, novaTarefa.trim()]
      });
      setNovaTarefa("");
    }
  };

  const removerTarefa = (index) => {
    setFormData({
      ...formData,
      tarefas: formData.tarefas.filter((_, i) => i !== index)
    });
  };

  const toggleIntegracao = (integracao) => {
    const integracoes = formData.configuracao.integracoes_ativas || [];
    const novasIntegracoes = integracoes.includes(integracao)
      ? integracoes.filter(i => i !== integracao)
      : [...integracoes, integracao];
    
    setFormData({
      ...formData,
      configuracao: {
        ...formData.configuracao,
        integracoes_ativas: novasIntegracoes
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Bot className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {agent ? "Editar Agente" : "Novo Agente"}
          </h2>
          <p className="text-gray-600">
            Configure um agente inteligente para automatizar tarefas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Agente *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Assistente Financeiro"
                />
              </div>

              <div>
                <Label htmlFor="role">Função/Papel *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o que este agente faz..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
                />
                <Label htmlFor="status">Agente ativo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="execucao_automatica"
                  checked={formData.configuracao.execucao_automatica}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    configuracao: { ...formData.configuracao, execucao_automatica: checked }
                  })}
                />
                <Label htmlFor="execucao_automatica">Execução automática</Label>
              </div>

              <div>
                <Label>Frequência</Label>
                <Select 
                  value={formData.configuracao.frequencia} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    configuracao: { ...formData.configuracao, frequencia: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Diária">Diária</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.configuracao.execucao_automatica && (
                <div>
                  <Label>Horário de Execução</Label>
                  <Input
                    type="time"
                    value={formData.configuracao.horario_execucao}
                    onChange={(e) => setFormData({
                      ...formData,
                      configuracao: { ...formData.configuracao, horario_execucao: e.target.value }
                    })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notificar_admin"
                  checked={formData.configuracao.notificar_admin}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    configuracao: { ...formData.configuracao, notificar_admin: checked }
                  })}
                />
                <Label htmlFor="notificar_admin">Notificar administrador</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas do Agente *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                placeholder="Digite uma tarefa..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTarefa())}
              />
              <Button type="button" onClick={adicionarTarefa}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tarefas.length > 0 && (
              <div className="space-y-2">
                {formData.tarefas.map((tarefa, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{tarefa}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerTarefa(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card>
          <CardHeader>
            <CardTitle>Integrações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {integracoes.map(integracao => (
                <div key={integracao} className="flex items-center space-x-2">
                  <Checkbox
                    id={integracao}
                    checked={formData.configuracao.integracoes_ativas?.includes(integracao)}
                    onCheckedChange={() => toggleIntegracao(integracao)}
                  />
                  <Label htmlFor={integracao} className="text-sm capitalize">
                    {integracao}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompt do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt do Sistema (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.prompt_sistema}
              onChange={(e) => setFormData({ ...formData, prompt_sistema: e.target.value })}
              placeholder="Instruções específicas para o agente IA..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Agente"}
          </Button>
        </div>
      </form>
    </div>
  );
}