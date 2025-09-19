import React, { useState, useEffect, useCallback } from "react";
import { ContratoLocacao, ManutencaoImovel } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, X, Plus, Trash2, Upload, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const initialManutencaoState = {
  contrato_id: "",
  imovel_id: "",
  solicitante: "Inquilino",
  titulo: "",
  descricao: "",
  tipo: "Hidráulica",
  prioridade: "Média",
  data_solicitacao: new Date().toISOString().slice(0, 16),
  data_prazo: "",
  fotos_problema: [],
  orcamentos: [],
  aprovacao_proprietario: {
    aprovado: null,
    data_resposta: "",
    observacoes: "",
    valor_limite: ""
  },
  execucao: {
    data_inicio: "",
    data_conclusao: "",
    fornecedor_escolhido: "",
    valor_final: "",
    fotos_conclusao: [],
    notas_fiscais: []
  },
  status: "Solicitada",
  responsavel_pagamento: "Proprietário"
};

export default function ManutencaoForm({ manutencao, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState(initialManutencaoState);
  const [contratos, setContratos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contratosData = await ContratoLocacao.filter({ status: "Ativo" });
      setContratos(contratosData);

      if (manutencao) {
        setFormData({ ...initialManutencaoState, ...manutencao });
      }

    } catch (e) {
      console.error("Erro ao carregar dados para o formulário de manutenção:", e);
      setError("Não foi possível carregar os contratos ativos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [manutencao]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleContratoChange = (contratoId) => {
    const contrato = contratos.find(c => c.id === contratoId);
    setFormData(prev => ({
      ...prev,
      contrato_id: contratoId,
      imovel_id: contrato ? contrato.imovel_id : ""
    }));
  };

  const addOrcamento = () => {
    setFormData(prev => ({
      ...prev,
      orcamentos: [
        ...(prev.orcamentos || []),
        {
          fornecedor: "",
          valor: "",
          prazo_dias: "",
          descricao_servico: "",
          aprovado: false,
          arquivo_orcamento: ""
        }
      ]
    }));
  };

  const updateOrcamento = (index, field, value) => {
    const newOrcamentos = [...(formData.orcamentos || [])];
    newOrcamentos[index] = { ...newOrcamentos[index], [field]: value };
    setFormData(prev => ({ ...prev, orcamentos: newOrcamentos }));
  };

  const removeOrcamento = (index) => {
    const newOrcamentos = [...(formData.orcamentos || [])];
    newOrcamentos.splice(index, 1);
    setFormData(prev => ({ ...prev, orcamentos: newOrcamentos }));
  };

  const handleFileUpload = async (file, type, index = null) => {
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      if (type === 'foto_problema') {
        setFormData(prev => ({
          ...prev,
          fotos_problema: [...(prev.fotos_problema || []), { url: file_url, descricao: "" }]
        }));
      } else if (type === 'orcamento' && index !== null) {
        updateOrcamento(index, 'arquivo_orcamento', file_url);
      }
      
      toast({ title: "Arquivo enviado", description: "Upload realizado com sucesso." });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: "Erro no Upload", description: "Falha ao enviar o arquivo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.contrato_id || !formData.titulo || !formData.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Contrato, título e descrição são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (manutencao) {
        await ManutencaoImovel.update(manutencao.id, formData);
        toast({ title: "Sucesso!", description: "Manutenção atualizada com sucesso." });
      } else {
        await ManutencaoImovel.create(formData);
        toast({ title: "Sucesso!", description: "Manutenção cadastrada com sucesso." });
      }
      onSaveSuccess();
    } catch (e) {
      console.error("Erro ao salvar manutenção:", e);
      toast({ title: "Erro ao Salvar", description: "Ocorreu um erro ao salvar a manutenção.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro de Carregamento</AlertTitle>
        <AlertDescription>
          {error} <Button variant="link" onClick={loadInitialData}>Tentar novamente</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{manutencao ? "Editar Manutenção" : "Nova Manutenção"}</CardTitle>
            <CardDescription>Registre uma nova solicitação de manutenção do imóvel.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" /> {isSaving ? "Salvando..." : "Salvar Manutenção"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados Básicos */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Contrato *</Label>
            <Select value={formData.contrato_id} onValueChange={handleContratoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contrato" />
              </SelectTrigger>
              <SelectContent>
                {contratos.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    Contrato #{c.numero_contrato}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contratos.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Nenhum contrato ativo encontrado.</p>
            )}
          </div>
          <div>
            <Label>Solicitante</Label>
            <Select value={formData.solicitante} onValueChange={(v) => handleChange('solicitante', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inquilino">Inquilino</SelectItem>
                <SelectItem value="Proprietário">Proprietário</SelectItem>
                <SelectItem value="Imobiliária">Imobiliária</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Título da Solicitação *</Label>
            <Input 
              value={formData.titulo} 
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Vazamento no banheiro"
            />
          </div>
          <div>
            <Label>Tipo de Manutenção</Label>
            <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Elétrica">Elétrica</SelectItem>
                <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                <SelectItem value="Estrutural">Estrutural</SelectItem>
                <SelectItem value="Pintura">Pintura</SelectItem>
                <SelectItem value="Limpeza">Limpeza</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Prioridade</Label>
            <Select value={formData.prioridade} onValueChange={(v) => handleChange('prioridade', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data da Solicitação</Label>
            <Input 
              type="datetime-local" 
              value={formData.data_solicitacao} 
              onChange={(e) => handleChange('data_solicitacao', e.target.value)}
            />
          </div>
          <div>
            <Label>Prazo para Conclusão</Label>
            <Input 
              type="date" 
              value={formData.data_prazo} 
              onChange={(e) => handleChange('data_prazo', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Descrição Detalhada *</Label>
          <Textarea 
            value={formData.descricao} 
            onChange={(e) => handleChange('descricao', e.target.value)}
            placeholder="Descreva detalhadamente o problema encontrado..."
            rows={4}
          />
        </div>

        {/* Fotos do Problema */}
        <Card>
          <CardHeader>
            <CardTitle>Fotos do Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={(e) => {
                  Array.from(e.target.files).forEach(file => {
                    handleFileUpload(file, 'foto_problema');
                  });
                }}
                disabled={uploading}
              />
              {formData.fotos_problema && formData.fotos_problema.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.fotos_problema.map((foto, index) => (
                    <div key={index} className="border rounded-lg p-2">
                      <img src={foto.url} alt="Problema" className="w-full h-20 object-cover rounded" />
                      <Input 
                        placeholder="Descrição da foto"
                        value={foto.descricao}
                        onChange={(e) => {
                          const newFotos = [...formData.fotos_problema];
                          newFotos[index].descricao = e.target.value;
                          setFormData(prev => ({ ...prev, fotos_problema: newFotos }));
                        }}
                        className="mt-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orçamentos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Orçamentos</CardTitle>
              <Button size="sm" onClick={addOrcamento}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Orçamento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(formData.orcamentos || []).map((orcamento, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Orçamento #{index + 1}</h4>
                    <Button variant="destructive" size="sm" onClick={() => removeOrcamento(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Fornecedor</Label>
                      <Input 
                        value={orcamento.fornecedor}
                        onChange={(e) => updateOrcamento(index, 'fornecedor', e.target.value)}
                        placeholder="Nome do fornecedor"
                      />
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={orcamento.valor}
                        onChange={(e) => updateOrcamento(index, 'valor', parseFloat(e.target.value))}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label>Prazo (dias)</Label>
                      <Input 
                        type="number"
                        value={orcamento.prazo_dias}
                        onChange={(e) => updateOrcamento(index, 'prazo_dias', parseInt(e.target.value))}
                        placeholder="Prazo em dias"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Descrição do Serviço</Label>
                    <Textarea 
                      value={orcamento.descricao_servico}
                      onChange={(e) => updateOrcamento(index, 'descricao_servico', e.target.value)}
                      placeholder="Descrição detalhada do que será executado..."
                      rows={2}
                    />
                  </div>
                  <div className="mt-4">
                    <Label>Arquivo do Orçamento</Label>
                    <Input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(e.target.files[0], 'orcamento', index);
                        }
                      }}
                      disabled={uploading}
                    />
                    {orcamento.arquivo_orcamento && (
                      <a href={orcamento.arquivo_orcamento} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 block">
                        Ver arquivo anexado
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configurações Adicionais */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solicitada">Solicitada</SelectItem>
                <SelectItem value="Aguardando Orçamento">Aguardando Orçamento</SelectItem>
                <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                <SelectItem value="Aprovada">Aprovada</SelectItem>
                <SelectItem value="Em Execução">Em Execução</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Responsável pelo Pagamento</Label>
            <Select value={formData.responsavel_pagamento} onValueChange={(v) => handleChange('responsavel_pagamento', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proprietário">Proprietário</SelectItem>
                <SelectItem value="Inquilino">Inquilino</SelectItem>
                <SelectItem value="Imobiliária">Imobiliária</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}