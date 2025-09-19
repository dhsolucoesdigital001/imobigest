import React, { useState, useEffect, useCallback } from "react";
import { ContratoLocacao, User, VistoriaImovel } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, X, Plus, Trash2, Camera, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const initialVistoriaState = {
  contrato_id: "",
  imovel_id: "",
  tipo: "Entrada",
  data_vistoria: new Date().toISOString().split("T")[0],
  responsavel_vistoria: "",
  itens_checklist: [],
  fotos_gerais: [],
  observacoes_gerais: "",
  status: "Rascunho",
};

export default function VistoriaForm({ vistoria, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState(initialVistoriaState);
  const [contratos, setContratos] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [contratosData, corretoresData] = await Promise.all([
        ContratoLocacao.filter({ status: "Ativo" }),
        User.filter({ tipo_usuario: "Corretor" })
      ]);
      
      setContratos(contratosData);
      setCorretores(corretoresData);

      if (vistoria) {
        setFormData({ ...initialVistoriaState, ...vistoria });
      }

    } catch (e) {
      console.error("Erro ao carregar dados para o formulário de vistoria:", e);
      setError("Não foi possível carregar os contratos e corretores. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [vistoria]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContratoChange = (contratoId) => {
    const contrato = contratos.find(c => c.id === contratoId);
    setFormData(prev => ({
      ...prev,
      contrato_id: contratoId,
      imovel_id: contrato ? contrato.imovel_id : ""
    }));
  };

  const handleChecklistItemChange = (ambienteIndex, itemIndex, field, value) => {
    const newChecklist = [...formData.itens_checklist];
    newChecklist[ambienteIndex].itens[itemIndex][field] = value;
    setFormData(prev => ({ ...prev, itens_checklist: newChecklist }));
  };
  
  const addAmbiente = () => {
    setFormData(prev => ({
      ...prev,
      itens_checklist: [...(prev.itens_checklist || []), { ambiente: "Novo Ambiente", itens: [] }]
    }));
  };

  const addItemToChecklist = (ambienteIndex) => {
    const newChecklist = [...formData.itens_checklist];
    newChecklist[ambienteIndex].itens.push({ item: "", estado: "Bom", observacoes: "" });
    setFormData(prev => ({ ...prev, itens_checklist: newChecklist }));
  };

  const handleSave = async () => {
    if (!formData.contrato_id || !formData.data_vistoria || !formData.responsavel_vistoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Contrato, data e responsável são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (vistoria) {
        await VistoriaImovel.update(vistoria.id, formData);
        toast({ title: "Sucesso!", description: "Vistoria atualizada com sucesso." });
      } else {
        await VistoriaImovel.create(formData);
        toast({ title: "Sucesso!", description: "Vistoria cadastrada com sucesso." });
      }
      onSaveSuccess();
    } catch (e) {
      console.error("Erro ao salvar vistoria:", e);
      toast({ title: "Erro ao Salvar", description: "Ocorreu um erro ao salvar a vistoria.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
            <CardTitle>{vistoria ? "Editar Vistoria" : "Nova Vistoria"}</CardTitle>
            <CardDescription>Preencha os detalhes da vistoria do imóvel.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" /> {isSaving ? "Salvando..." : "Salvar Vistoria"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Contrato</Label>
            <Select value={formData.contrato_id} onValueChange={handleContratoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contrato" />
              </SelectTrigger>
              <SelectContent>
                {contratos.map(c => <SelectItem key={c.id} value={c.id}>Contrato #{c.numero_contrato}</SelectItem>)}
              </SelectContent>
            </Select>
            {contratos.length === 0 && <p className="text-sm text-red-500 mt-1">Nenhum contrato ativo encontrado.</p>}
          </div>
          <div>
            <Label>Tipo de Vistoria</Label>
            <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saída">Saída</SelectItem>
                <SelectItem value="Periódica">Periódica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data da Vistoria</Label>
            <Input type="date" value={formData.data_vistoria} onChange={(e) => handleChange('data_vistoria', e.target.value)} />
          </div>
          <div>
            <Label>Responsável</Label>
             <Select value={formData.responsavel_vistoria} onValueChange={(v) => handleChange('responsavel_vistoria', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {corretores.map(c => <SelectItem key={c.id} value={c.full_name}>{c.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Checklist de Itens</CardTitle>
            <Button size="sm" onClick={addAmbiente}><Plus className="w-4 h-4 mr-2" /> Adicionar Ambiente</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.itens_checklist || []).map((ambiente, aIndex) => (
              <div key={aIndex} className="p-4 border rounded-lg">
                <Input className="font-bold mb-2" value={ambiente.ambiente} onChange={(e) => {
                  const newChecklist = [...formData.itens_checklist];
                  newChecklist[aIndex].ambiente = e.target.value;
                  setFormData(prev => ({...prev, itens_checklist: newChecklist}));
                }}/>
                {(ambiente.itens || []).map((item, iIndex) => (
                  <div key={iIndex} className="grid grid-cols-3 gap-2 mb-2 items-center">
                    <Input placeholder="Item (ex: Parede)" value={item.item} onChange={(e) => handleChecklistItemChange(aIndex, iIndex, 'item', e.target.value)} />
                    <Select value={item.estado} onValueChange={(v) => handleChecklistItemChange(aIndex, iIndex, 'estado', v)}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="Ótimo">Ótimo</SelectItem>
                          <SelectItem value="Bom">Bom</SelectItem>
                          <SelectItem value="Regular">Regular</SelectItem>
                          <SelectItem value="Ruim">Ruim</SelectItem>
                       </SelectContent>
                    </Select>
                    <Input placeholder="Observações" value={item.observacoes} onChange={(e) => handleChecklistItemChange(aIndex, iIndex, 'observacoes', e.target.value)} />
                  </div>
                ))}
                <Button size="xs" variant="outline" onClick={() => addItemToChecklist(aIndex)}>+ Item</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div>
          <Label>Observações Gerais</Label>
          <Textarea value={formData.observacoes_gerais} onChange={(e) => handleChange('observacoes_gerais', e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}