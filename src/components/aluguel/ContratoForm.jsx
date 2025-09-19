
import React, { useState, useEffect, useCallback } from "react";
import { Imovel, Proprietario, Cliente, User, ContratoLocacao, VistoriaImovel } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, X, FileText, DollarSign, Calendar, Settings, Users, Upload, Camera, Bell, Plus, Trash2, Loader2, AlertTriangle, Building, UserCheck, Download, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const initialFormData = {
  codigo_contrato: null,
  numero_contrato: '',
  imovel_id: '',
  locador_id: '',
  locatario_id: '',
  fiador_id: '',
  corretor_id: '',
  data_inicio: '',
  data_fim: '',
  data_assinatura: '',
  valor_aluguel: '',
  valor_condominio: '',
  valor_iptu: '',
  outras_taxas: [],
  dia_vencimento: 10,
  multa_atraso_valor: '',
  multa_atraso_percentual: 2,
  juros_diarios_percentual: 0.033,
  desconto_pontualidade: '',
  forma_pagamento: 'PIX',
  indice_reajuste: 'IGP-M',
  percentual_reajuste: '',
  data_proximo_reajuste: '',
  garantia_locaticia: 'Caução',
  caucao_valor: '',
  seguro_fianca: false,
  seguro_fianca_valor: '',
  vistoria_entrada: { data: '', imagens: [], checklist: [], observacoes: '' },
  vistoria_saida: { data: '', imagens: [], checklist: [], observacoes: '' },
  documentos: [],
  repasse_config: {
    conta_bancaria: '',
    percentual_comissao: 10,
    data_repasse: 'automatica',
    extrato_automatico: true
  },
  notificacoes_config: {
    email_ativo: true,
    whatsapp_ativo: true,
    lembrete_vencimento: true,
    recibo_automatico: true,
    aviso_repasse: true,
    dias_aviso_vencimento: 5
  },
  status: 'Ativo',
  valor_total_mensal: 0,
  observacoes: '',
  renovacao_automatica: false,
  ativo: true
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 500) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const isRateLimit = error.message?.includes('429') || error.message?.includes('Rate limit');
      if (isRateLimit) {
        const delayTime = baseDelay * Math.pow(2, i);
        await delay(delayTime);
      } else {
        throw error;
      }
    }
  }
};

const generateNextContractCode = async () => {
    try {
        const lastContracts = await ContratoLocacao.list('-codigo_contrato', 1);
        if (lastContracts.length > 0 && lastContracts[0].codigo_contrato) {
            return lastContracts[0].codigo_contrato + 1;
        }
    } catch(e) {
        console.error("Could not get last contract, using random code");
    }
    return Math.floor(Math.random() * 900) + 100;
};

export default function ContratoForm({ contrato, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState(initialFormData);
  const [imoveis, setImoveis] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [vistorias, setVistorias] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Estados para modais
  const [showVistoriaModal, setShowVistoriaModal] = useState(false);
  const [showDocumentoModal, setShowDocumentoModal] = useState(false);
  const [editingVistoria, setEditingVistoria] = useState(null);
  const [editingDocumento, setEditingDocumento] = useState(null);

  const { toast } = useToast();

  const loadContractData = useCallback(async (contratoId) => {
    try {
      // Carregar vistorias do contrato
      const vistoriasData = await VistoriaImovel.filter({ contrato_id: contratoId });
      setVistorias(vistoriasData);
      
      // Documentos já vêm no campo documentos do contrato
      setDocumentos(contrato?.documentos || []);
    } catch (error) {
      console.error("Erro ao carregar dados do contrato:", error);
    }
  }, [contrato]);

  const loadFormData = useCallback(async () => {
    setIsDataLoading(true);
    setLoadError(null);
    try {
      setLoadingStatus('Carregando corretores...');
      const corretoresData = await retryWithBackoff(() => User.filter({ tipo_usuario: "Corretor" }));
      setCorretores(corretoresData);
      await delay(200);

      setLoadingStatus('Carregando clientes...');
      const clientesData = await retryWithBackoff(() => Cliente.list());
      setClientes(clientesData);
      await delay(200);

      setLoadingStatus('Carregando proprietários...');
      const proprietariosData = await retryWithBackoff(() => Proprietario.list());
      setProprietarios(proprietariosData);
      await delay(200);

      setLoadingStatus('Carregando imóveis...');
      const imoveisData = await retryWithBackoff(() => Imovel.filter({ situacao: "Aluguel" }));
      setImoveis(imoveisData);

      if (contrato) {
        const mergedData = {
          ...initialFormData,
          ...contrato,
          repasse_config: {
            ...initialFormData.repasse_config,
            ...(contrato.repasse_config || {})
          },
          notificacoes_config: {
            ...initialFormData.notificacoes_config,
            ...(contrato.notificacoes_config || {})
          },
          documentos: contrato.documentos || []
        };
        setFormData(mergedData);
        await loadContractData(contrato.id);
      } else {
        setLoadingStatus('Gerando código do contrato...');
        const nextCode = await generateNextContractCode();
        setFormData(prev => ({
          ...prev,
          codigo_contrato: nextCode,
          numero_contrato: `LOC-${nextCode}`
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do formulário:", error);
      setLoadError("Falha ao carregar dados essenciais. Tente recarregar a página.");
      toast({
        title: "Erro Crítico",
        description: "Não foi possível carregar os dados necessários para o formulário.",
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
      setLoadingStatus('');
    }
  }, [contrato, loadContractData, toast]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.imovel_id) newErrors.imovel_id = "Selecione um imóvel.";
    if (!formData.locador_id) newErrors.locador_id = "Selecione um proprietário.";
    if (!formData.locatario_id) newErrors.locatario_id = "Selecione um locatário.";
    if (!formData.data_inicio) newErrors.data_inicio = "Data de início é obrigatória.";
    if (!formData.data_fim) newErrors.data_fim = "Data de término é obrigatória.";
    if (!formData.valor_aluguel || formData.valor_aluguel <= 0) newErrors.valor_aluguel = "Valor do aluguel deve ser maior que zero.";
    if (!formData.dia_vencimento) newErrors.dia_vencimento = "Dia de vencimento é obrigatório.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Campos Inválidos",
        description: "Por favor, corrija os campos marcados em vermelho.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const dataToSave = { 
        ...formData, 
        documentos: documentos 
      };
      
      let savedContrato;
      if (contrato) {
        savedContrato = await ContratoLocacao.update(contrato.id, dataToSave);
        toast({ title: "Sucesso!", description: "Contrato atualizado com sucesso." });
      } else {
        savedContrato = await ContratoLocacao.create(dataToSave);
        toast({ title: "Sucesso!", description: "Novo contrato criado com sucesso." });
      }
      
      // Salvar vistorias separadamente
      for (const vistoria of vistorias) {
        if (!vistoria.id || vistoria.id.toString().startsWith("temp-")) { // Check if it's a new temporary ID
          await VistoriaImovel.create({
            ...vistoria,
            contrato_id: savedContrato.id || contrato.id,
            imovel_id: formData.imovel_id
          });
        }
      }
      
      onSaveSuccess();
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar o contrato.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, key, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const handleImovelChange = (imovelId) => {
    const selected = imoveis.find(i => i.id === imovelId);
    if(selected) {
        handleChange('imovel_id', imovelId);
        handleChange('locador_id', selected.proprietario_id || '');
    }
  };

  // Funções para Vistorias
  const handleNovaVistoria = () => {
    setEditingVistoria(null);
    setShowVistoriaModal(true);
  };

  const handleEditVistoria = (vistoria) => {
    setEditingVistoria(vistoria);
    setShowVistoriaModal(true);
  };

  const handleSaveVistoria = (vistoriaData) => {
    if (editingVistoria) {
      setVistorias(prev => prev.map(v => v.id === editingVistoria.id ? { ...v, ...vistoriaData } : v));
    } else {
      setVistorias(prev => [...prev, { ...vistoriaData, id: `temp-${Date.now()}` }]); // Assign temporary ID
    }
    setShowVistoriaModal(false);
    setEditingVistoria(null);
  };

  const handleDeleteVistoria = (vistoriaId) => {
    setVistorias(prev => prev.filter(v => v.id !== vistoriaId));
  };

  // Funções para Documentos
  const handleNovoDocumento = () => {
    setEditingDocumento(null);
    setShowDocumentoModal(true);
  };

  const handleEditDocumento = (documento) => {
    setEditingDocumento(documento);
    setShowDocumentoModal(true);
  };

  const handleSaveDocumento = (documentoData) => {
    if (editingDocumento) {
      setDocumentos(prev => prev.map(d => d.id === editingDocumento.id ? { ...d, ...documentoData } : d));
    } else {
      setDocumentos(prev => [...prev, { ...documentoData, id: `temp-${Date.now()}` }]); // Assign temporary ID
    }
    setShowDocumentoModal(false);
    setEditingDocumento(null);
  };

  const handleDeleteDocumento = (documentoId) => {
    setDocumentos(prev => prev.filter(d => d.id !== documentoId));
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Carregando Formulário...</h3>
          <p className="text-gray-500">{loadingStatus}</p>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-12">
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao Carregar</AlertTitle>
            <AlertDescription>
              {loadError}
              <Button onClick={loadFormData} variant="link" className="p-0 h-auto ml-2">Tentar Novamente</Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{contrato ? "Editar Contrato" : "Novo Contrato de Locação"}</CardTitle>
              <CardDescription>
                {contrato ? `Editando contrato #${contrato.numero_contrato}` : "Preencha os dados para criar um novo contrato."}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? 'Salvando...' : 'Salvar Contrato'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="principal">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="principal">Principal</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="vistorias">Vistorias</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="principal" className="pt-6 space-y-6">
              <Card>
                  <CardHeader><CardTitle className="text-lg">Partes Envolvidas</CardTitle></CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4">
                      <div>
                          <Label htmlFor="imovel_id">Imóvel</Label>
                          <Select value={formData.imovel_id} onValueChange={handleImovelChange}>
                              <SelectTrigger className={errors.imovel_id ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Selecione um imóvel" />
                              </SelectTrigger>
                              <SelectContent>
                                  {imoveis.map(i => <SelectItem key={i.id} value={i.id}>{i.codigo} - {i.endereco}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          {errors.imovel_id && <p className="text-red-500 text-xs mt-1">{errors.imovel_id}</p>}
                      </div>
                      <div>
                          <Label htmlFor="locador_id">Proprietário (Locador)</Label>
                          <Select value={formData.locador_id} onValueChange={(v) => handleChange('locador_id', v)} disabled>
                              <SelectTrigger className={errors.locador_id ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Selecione um proprietário" />
                              </SelectTrigger>
                              <SelectContent>
                                  {proprietarios.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                              </SelectContent>
                          </Select>
                           {errors.locador_id && <p className="text-red-500 text-xs mt-1">{errors.locador_id}</p>}
                      </div>
                      <div>
                          <Label htmlFor="locatario_id">Cliente (Locatário)</Label>
                          <Select value={formData.locatario_id} onValueChange={(v) => handleChange('locatario_id', v)}>
                              <SelectTrigger className={errors.locatario_id ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Selecione um cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          {errors.locatario_id && <p className="text-red-500 text-xs mt-1">{errors.locatario_id}</p>}
                      </div>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader><CardTitle className="text-lg">Detalhes do Contrato</CardTitle></CardHeader>
                  <CardContent className="grid md:grid-cols-4 gap-4">
                       <div>
                          <Label>Nº Contrato</Label>
                          <Input value={formData.numero_contrato} disabled />
                      </div>
                      <div>
                          <Label htmlFor="data_inicio">Data de Início</Label>
                          <Input type="date" id="data_inicio" value={formData.data_inicio} onChange={(e) => handleChange('data_inicio', e.target.value)} className={errors.data_inicio ? 'border-red-500' : ''} />
                           {errors.data_inicio && <p className="text-red-500 text-xs mt-1">{errors.data_inicio}</p>}
                      </div>
                      <div>
                          <Label htmlFor="data_fim">Data de Término</Label>
                          <Input type="date" id="data_fim" value={formData.data_fim} onChange={(e) => handleChange('data_fim', e.target.value)} className={errors.data_fim ? 'border-red-500' : ''}/>
                           {errors.data_fim && <p className="text-red-500 text-xs mt-1">{errors.data_fim}</p>}
                      </div>
                      <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Ativo">Ativo</SelectItem>
                                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                                  <SelectItem value="Em renovação">Em Renovação</SelectItem>
                                  <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardContent>
               </Card>
            </TabsContent>
            
            <TabsContent value="financeiro" className="pt-6 space-y-6">
               <Card>
                  <CardHeader><CardTitle className="text-lg">Valores e Pagamento</CardTitle></CardHeader>
                  <CardContent className="grid md:grid-cols-4 gap-4">
                      <div>
                          <Label htmlFor="valor_aluguel">Valor do Aluguel (R$)</Label>
                          <Input type="number" id="valor_aluguel" value={formData.valor_aluguel} onChange={(e) => handleChange('valor_aluguel', e.target.value)} className={errors.valor_aluguel ? 'border-red-500' : ''}/>
                          {errors.valor_aluguel && <p className="text-red-500 text-xs mt-1">{errors.valor_aluguel}</p>}
                      </div>
                      <div>
                          <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
                          <Input type="number" id="dia_vencimento" value={formData.dia_vencimento} onChange={(e) => handleChange('dia_vencimento', e.target.value)} className={errors.dia_vencimento ? 'border-red-500' : ''}/>
                           {errors.dia_vencimento && <p className="text-red-500 text-xs mt-1">{errors.dia_vencimento}</p>}
                      </div>
                      <div>
                          <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                          <Select value={formData.forma_pagamento} onValueChange={(v) => handleChange('forma_pagamento', v)}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Boleto">Boleto</SelectItem>
                                  <SelectItem value="PIX">PIX</SelectItem>
                                  <SelectItem value="Transferência">Transferência</SelectItem>
                                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader><CardTitle className="text-lg">Garantia e Reajuste</CardTitle></CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4">
                      <div>
                          <Label htmlFor="garantia_locaticia">Garantia Locatícia</Label>
                           <Select value={formData.garantia_locaticia} onValueChange={(v) => handleChange('garantia_locaticia', v)}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="Caução">Caução</SelectItem>
                                 <SelectItem value="Seguro Fiança">Seguro Fiança</SelectItem>
                                 <SelectItem value="Fiador">Fiador</SelectItem>
                                 <SelectItem value="Título de Capitalização">Título de Capitalização</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                       <div>
                          <Label htmlFor="indice_reajuste">Índice de Reajuste</Label>
                           <Select value={formData.indice_reajuste} onValueChange={(v) => handleChange('indice_reajuste', v)}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="IGP-M">IGP-M</SelectItem>
                                 <SelectItem value="IPCA">IPCA</SelectItem>
                                 <SelectItem value="INPC">INPC</SelectItem>
                                 <SelectItem value="Percentual fixo">Percentual Fixo</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vistorias" className="pt-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Vistorias do Contrato</h3>
                  <p className="text-sm text-gray-600">Registre vistorias de entrada e saída</p>
                </div>
                <Button onClick={handleNovaVistoria} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Vistoria
                </Button>
              </div>

              {vistorias.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma vistoria cadastrada</h3>
                    <p className="text-gray-500 mb-6">
                      Registre as vistorias de entrada e saída do imóvel.
                    </p>
                    <Button onClick={handleNovaVistoria} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeira Vistoria
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {vistorias.map((vistoria, index) => (
                    <Card key={vistoria.id || index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">Vistoria de {vistoria.tipo}</h4>
                              <Badge variant="outline">{new Date(vistoria.data_vistoria).toLocaleDateString('pt-BR')}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Responsável: {vistoria.responsavel_vistoria} | Status: {vistoria.status}
                            </p>
                            {vistoria.observacoes_gerais && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Observações:</strong> {vistoria.observacoes_gerais}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditVistoria(vistoria)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver/Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteVistoria(vistoria.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documentos" className="pt-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Documentos do Contrato</h3>
                  <p className="text-sm text-gray-600">Gerencie todos os documentos relacionados ao contrato</p>
                </div>
                <Button onClick={handleNovoDocumento} className="bg-green-600 hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </div>

              {documentos.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum documento cadastrado</h3>
                    <p className="text-gray-500 mb-6">
                      Faça upload de documentos relacionados ao contrato como RG, CPF, comprovante de renda, etc.
                    </p>
                    <Button onClick={handleNovoDocumento} className="bg-green-600 hover:bg-green-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Primeiro Documento
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {documentos.map((documento, index) => (
                    <Card key={documento.id || index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{documento.nome}</h4>
                              <p className="text-sm text-gray-600">Tipo: {documento.tipo}</p>
                              <p className="text-sm text-gray-500">
                                Enviado em: {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                              </p>
                              {documento.descricao && (
                                <p className="text-sm text-gray-600 mt-2">{documento.descricao}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {documento.url && (
                              <Button variant="outline" size="sm" onClick={() => window.open(documento.url, '_blank')}>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleEditDocumento(documento)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver/Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDocumento(documento.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="configuracoes" className="pt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Configurações de Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_ativo"
                          checked={formData.notificacoes_config.email_ativo}
                          onCheckedChange={(checked) => handleNestedChange('notificacoes_config', 'email_ativo', checked)}
                        />
                        <Label htmlFor="email_ativo">Notificações por E-mail</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="whatsapp_ativo"
                          checked={formData.notificacoes_config.whatsapp_ativo}
                          onCheckedChange={(checked) => handleNestedChange('notificacoes_config', 'whatsapp_ativo', checked)}
                        />
                        <Label htmlFor="whatsapp_ativo">Notificações por WhatsApp</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lembrete_vencimento"
                          checked={formData.notificacoes_config.lembrete_vencimento}
                          onCheckedChange={(checked) => handleNestedChange('notificacoes_config', 'lembrete_vencimento', checked)}
                        />
                        <Label htmlFor="lembrete_vencimento">Lembrete de Vencimento</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recibo_automatico"
                          checked={formData.notificacoes_config.recibo_automatico}
                          onCheckedChange={(checked) => handleNestedChange('notificacoes_config', 'recibo_automatico', checked)}
                        />
                        <Label htmlFor="recibo_automatico">Recibo Automático</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="dias_aviso_vencimento">Dias de Antecedência para Aviso</Label>
                        <Input
                          id="dias_aviso_vencimento"
                          type="number"
                          min="1"
                          max="30"
                          value={formData.notificacoes_config.dias_aviso_vencimento}
                          onChange={(e) => handleNestedChange('notificacoes_config', 'dias_aviso_vencimento', parseInt(e.target.value))}
                          className="w-24"
                        />
                        <p className="text-xs text-gray-500 mt-1">Quantos dias antes do vencimento enviar o lembrete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Configurações de Repasse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="conta_bancaria">Conta Bancária do Proprietário</Label>
                      <Textarea
                        id="conta_bancaria"
                        placeholder="Banco, Agência, Conta, PIX..."
                        value={formData.repasse_config.conta_bancaria}
                        onChange={(e) => handleNestedChange('repasse_config', 'conta_bancaria', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="percentual_comissao">Taxa de Administração (%)</Label>
                        <Input
                          id="percentual_comissao"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.repasse_config.percentual_comissao}
                          onChange={(e) => handleNestedChange('repasse_config', 'percentual_comissao', parseFloat(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="data_repasse">Tipo de Repasse</Label>
                        <Select
                          value={formData.repasse_config.data_repasse}
                          onValueChange={(value) => handleNestedChange('repasse_config', 'data_repasse', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatica">Automático (após confirmação de pagamento)</SelectItem>
                            <SelectItem value="manual">Manual (requer aprovação)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="extrato_automatico"
                          checked={formData.repasse_config.extrato_automatico}
                          onCheckedChange={(checked) => handleNestedChange('repasse_config', 'extrato_automatico', checked)}
                        />
                        <Label htmlFor="extrato_automatico">Enviar extrato automático para o proprietário</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Vistoria */}
      <VistoriaModal
        isOpen={showVistoriaModal}
        onClose={() => setShowVistoriaModal(false)}
        vistoria={editingVistoria}
        onSave={handleSaveVistoria}
        contratoId={contrato?.id}
        imovelId={formData.imovel_id}
      />

      {/* Modal de Documento */}
      <DocumentoModal
        isOpen={showDocumentoModal}
        onClose={() => setShowDocumentoModal(false)}
        documento={editingDocumento}
        onSave={handleSaveDocumento}
        contratoId={contrato?.id}
      />
    </>
  );
}

// Componente Modal de Vistoria
const VistoriaModal = ({ isOpen, onClose, vistoria, onSave, contratoId, imovelId }) => {
  const [formData, setFormData] = useState({
    tipo: 'Entrada',
    data_vistoria: new Date().toISOString().split('T')[0],
    responsavel_vistoria: '',
    observacoes_gerais: '',
    status: 'Rascunho'
  });

  useEffect(() => {
    if (vistoria) {
      setFormData(vistoria);
    } else {
      setFormData({
        tipo: 'Entrada',
        data_vistoria: new Date().toISOString().split('T')[0],
        responsavel_vistoria: '',
        observacoes_gerais: '',
        status: 'Rascunho'
      });
    }
  }, [vistoria, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{vistoria ? 'Editar Vistoria' : 'Nova Vistoria'}</DialogTitle>
          <DialogDescription>
            Registre os detalhes da vistoria do imóvel
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Vistoria</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({...prev, tipo: value}))}>
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
              <Input
                type="date"
                value={formData.data_vistoria}
                onChange={(e) => setFormData(prev => ({...prev, data_vistoria: e.target.value}))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Responsável pela Vistoria</Label>
            <Input
              value={formData.responsavel_vistoria}
              onChange={(e) => setFormData(prev => ({...prev, responsavel_vistoria: e.target.value}))}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div>
            <Label>Observações Gerais</Label>
            <Textarea
              value={formData.observacoes_gerais}
              onChange={(e) => setFormData(prev => ({...prev, observacoes_gerais: e.target.value}))}
              placeholder="Observações sobre a vistoria..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Vistoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente Modal de Documento
const DocumentoModal = ({ isOpen, onClose, documento, onSave, contratoId }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Contrato',
    descricao: '',
    url: '',
    data_upload: new Date().toISOString().split('T')[0]
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (documento) {
      setFormData(documento);
    } else {
      setFormData({
        nome: '',
        tipo: 'Contrato',
        descricao: '',
        url: '',
        data_upload: new Date().toISOString().split('T')[0]
      });
    }
  }, [documento, isOpen]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        url: file_url,
        nome: prev.nome || file.name
      }));
      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso"
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const tiposDocumento = [
    'Contrato',
    'RG Locatário',
    'CPF Locatário',
    'Comprovante Renda',
    'Comprovante Residência',
    'RG Fiador',
    'CPF Fiador',
    'Procuração',
    'Outros'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{documento ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
          <DialogDescription>
            Faça upload e gerencie os documentos do contrato
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Documento</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                placeholder="Ex: Contrato de Locação Assinado"
                required
              />
            </div>

            <div>
              <Label>Tipo de Documento</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({...prev, tipo: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposDocumento.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Arquivo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.url ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-green-600" />
                  <p className="text-sm text-green-600">Arquivo enviado com sucesso!</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.url, '_blank')}
                  >
                    Ver Arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={uploading}
                    />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        Clique para selecionar um arquivo
                      </>
                    )}
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG (máx. 10MB)</p>
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
              placeholder="Descrição adicional do documento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!formData.nome}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Documento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
