
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Imovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Building2, User, FileText, Settings, Sparkles, Loader2, Camera, Globe, Shield, Download, Youtube } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Proprietario } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { createPageUrl } from "@/utils";

import PropertyPhotoGallery from "./PropertyPhotoGallery";
import ProprietarioSelector from "./ProprietarioSelector";
import CaptadorSelector from "./CaptadorSelector";
import PortaisDivulgacao from "./PortaisDivulgacao";


const situacoesLancamento = ["Pré-lançamento", "Lançamento", "Pronto/revenda"];
const documentacoes = ["Escritura", "Registro", "Contrato", "IPTU", "Alvará", "Habite-se", "Autorização", "Outros"];

export default function PropertyForm({ property, onSave, onCancel }) {
  const [formData, setFormData] = useState(property ? {
    ...property,
    // Ensure captadores is always an array when loading an existing property
    captadores: Array.isArray(property.captadores) ? property.captadores : [],
  } : {
    indice_cadastral: '',
    codigo: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Contagem',
    estado: 'MG',
    cep: '',
    mostrar_endereco_completo: true,
    regiao: '',
    edificio_condominio: '',
    referencia: '',
    situacao_lancamento: 'Pronto/revenda',
    situacao: '',
    tipo: '',
    construtora: '',
    idade: '',
    posicao: '',
    topografia: '',
    prazo_entrega: '',
    valor: '',
    valor_condominio: '',
    valor_iptu: '',
    aceita_permuta: false,
    ocupacao: '',
    quartos: '',
    suites: '',
    salas: '',
    banheiros: '',
    varandas: '',
    vagas: '',
    descricao_vagas: [],
    fachada: '',
    pavimentos: '',
    total_unidades: '',
    unidades_andar: '',
    andar_imovel: '',
    qualificacao: '',
    area_util_total: '',
    area_lote_terreno: '',
    area_construida: '',
    frente: '',
    caracteristicas_extras: [],
    descricao: '',
    observacoes_internas: '',
    notas_vistoria: '',
    condicao_pagamento: '',
    documentacao: [],
    local_chaves: '',
    loja_captacao: '',
    proprietario_id: null,
    captadores: [], // Sempre inicializa como array vazio
    portais_divulgacao: {
      vivareal: { ativo: false, tipo_anuncio: 'Padrão', id_externo: '' },
      zap: { ativo: false, tipo_anuncio: 'Padrão', id_externo: '' },
      imovelweb: { ativo: false, tipo_anuncio: 'Padrão', id_externo: '' },
      casamineira: { ativo: false, tipo_anuncio: 'Padrão', id_externo: '' },
      chavesnamao: { ativo: false, tipo_anuncio: 'Padrão', id_externo: '' }
    },
    exclusividade: false,
    vencimento_exclusividade: '',
    quitado: false,
    oportunidade: false,
    comissao_imobiliaria: '',
    comissao_captador: '',
    possui_banner: false,
    data_colocacao_banner: '',
    colocado_banner_por: '',
    informacoes_adicionais: '',
    fotos: [],
    video_url: '',
    foto_principal: '',
    data_atualizacao: new Date().toISOString().split('T')[0],
    estagio: 'Disponível',
    ativo: true,
  });

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [proprietarios, setProprietarios] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const handleInputChange = useCallback((field, value) => {
    if (field === 'codigo') { // Ensure codigo is always a number if it's not empty
      setFormData(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
    } else if (field === 'captadores') {
      // Garantir que captadores seja sempre um array
      const captadoresArray = Array.isArray(value) ? value : [];
      setFormData(prev => ({ ...prev, [field]: captadoresArray }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const loadProprietarios = useCallback(async () => {
    try {
      const proprietariosList = await Proprietario.list();
      setProprietarios(proprietariosList);
    } catch (error) {
      console.error("Erro ao carregar proprietários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de proprietários.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadCorretores = useCallback(async () => {
    try {
      const corretoresList = await UserEntity.list(); // Assuming UserEntity represents real estate agents/corretores
      setCorretores(corretoresList);
    } catch (error) {
      console.error("Erro ao carregar corretores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de corretores.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadPropertyById = useCallback(async (id) => {
    try {
      const imoveis = await Imovel.list();
      const imovel = imoveis.find(i => i.id === id);
      if (imovel) {
        // Ensure captadores is an array when loading by ID
        setFormData({
          ...imovel,
          captadores: Array.isArray(imovel.captadores) ? imovel.captadores : [],
        });
      } else {
        toast({
          title: "Imóvel não encontrado",
          description: "O imóvel com o ID especificado não foi encontrado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar imóvel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do imóvel.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    loadProprietarios();
    loadCorretores();

    // Se está editando (property existe) ou se há um ID na URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (property || editId) {
      if (editId && !property) {
        // Carregar imóvel por ID da URL
        loadPropertyById(editId);
      } else if (property) {
        // Ao carregar propriedade existente (via prop), já foi tratado no useState inicial.
        // Mas se houver alguma re-renderização que possa resetar, podemos reforçar aqui.
        // No entanto, o useState inicial já cuida disso.
      }
    } else { // if (!property && !editId) means it's a new property
      // Gerar código apenas para novos imóveis
      const generateCode = async () => {
        setIsCodeLoading(true);
        try {
          const latestProperties = await Imovel.list('-codigo', 1);
          const latestCode = latestProperties.length > 0 && latestProperties[0].codigo ? latestProperties[0].codigo : 99;
          const nextCode = Number(latestCode) + 1;
          handleInputChange('codigo', nextCode);
        } catch (error) {
          console.error("Erro ao gerar código do imóvel:", error);
          toast({
            title: "Erro ao gerar código",
            description: "Não foi possível gerar um código automático. Tente novamente.",
            variant: "destructive"
          });
        } finally {
          setIsCodeLoading(false);
        }
      };
      generateCode();
    }
  }, [property, toast, loadProprietarios, loadCorretores, handleInputChange, loadPropertyById]);

  const handleArrayChange = (field, item, checked) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, item] };
      } else {
        return { ...prev, [field]: currentArray.filter(i => i !== item) };
      }
    });
  };

  const handlePhotosChange = (photos) => {
    setFormData(prev => {
      let newFotoPrincipal = prev.foto_principal;

      if (photos.length > 0) {
        // If no main photo is set or the current main photo is not in the new photos list,
        // set the first photo from the new list as the main one.
        if (!newFotoPrincipal || !photos.some(p => p.url === newFotoPrincipal)) {
          newFotoPrincipal = photos[0].url;
        }
      } else {
        // If there are no photos, clear the main photo.
        newFotoPrincipal = '';
      }

      return {
        ...prev,
        fotos: photos,
        foto_principal: newFotoPrincipal
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.codigo) newErrors.codigo = 'Código é obrigatório';
    if (!formData.endereco || !formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
    if (!formData.tipo) newErrors.tipo = 'Tipo é obrigatório';
    if (!formData.situacao) newErrors.situacao = 'Situação é obrigatória';
    if (!formData.valor || parseFloat(formData.valor) <= 0) newErrors.valor = 'Valor deve ser maior que zero';
    if (!formData.proprietario_id) newErrors.proprietario_id = 'Proprietário é obrigatório';

    const videoUrl = formData.video_url || '';
    if (videoUrl && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(videoUrl)) {
      newErrors.video_url = 'URL do vídeo parece ser inválida. Use um link do YouTube.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        codigo: Number(formData.codigo) || 0,
        valor: parseFloat(formData.valor) || 0,
        valor_condominio: parseFloat(formData.valor_condominio) || 0,
        valor_iptu: parseFloat(formData.valor_iptu) || 0,
        quartos: Number(formData.quartos) || 0,
        suites: Number(formData.suites) || 0,
        salas: Number(formData.salas) || 0,
        banheiros: Number(formData.banheiros) || 0,
        varandas: Number(formData.varandas) || 0,
        vagas: Number(formData.vagas) || 0,
        pavimentos: Number(formData.pavimentos) || 0,
        total_unidades: Number(formData.total_unidades) || 0,
        unidades_andar: Number(formData.unidades_andar) || 0,
        andar_imovel: Number(formData.andar_imovel) || 0,
        area_util_total: parseFloat(formData.area_util_total) || 0,
        area_lote_terreno: parseFloat(formData.area_lote_terreno) || 0,
        area_construida: parseFloat(formData.area_construida) || 0,
        frente: parseFloat(formData.frente) || 0,
        idade: formData.idade ? String(formData.idade) : '', // Manter como string
        captadores: Array.isArray(formData.captadores) ? formData.captadores : [], // Garantir que seja array
        data_atualizacao: new Date().toISOString().split('T')[0]
      };

      // Apenas chama a função onSave. A lógica de salvar, notificar
      // e sincronizar agora está centralizada na página pai.
      await onSave(processedData);
    }
  };

  const handleGenerateAIText = async () => {
    setIsGenerating(true);
    try {
      const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.valor || 0);

      const prompt = `Gere uma descrição de imóvel profissional e persuasiva com base nos seguintes dados.
        **Instruções Estritas:**
        1.  **NÃO inclua o endereço, bairro ou cidade.** Foque em características e localização genérica (ex: "em excelente localização", "em área nobre").
        2.  Use o valor formatado exatamente como: ${valorFormatado}.
        3.  Comece com um título impactante.
        4.  Estruture em parágrafos claros: um para destaques gerais, outro para características de lazer/conforto, e um para o potencial de investimento.
        5.  Termine com a chamada para ação: "Agende sua visita hoje mesmo!".
        6.  Use um tone de voz vendedor, amigável e profissional.

        **Dados do Imóvel:**
        - Tipo: ${formData.tipo}
        - Quartos: ${formData.quartos}
        - Banheiros: ${formData.banheiros}
        - Salas: ${formData.salas}
        - Vagas: ${formData.vagas}
        - Área Útil: ${formData.area_util_total}m²
        - Idade do Imóvel: ${formData.idade} anos
        - Pavimentos: ${formData.pavimentos}
        - Características Extras: ${formData.caracteristicas_extras.join(', ')}
        - Referência/Observações: ${formData.referencia || formData.observacoes_internas}
        - Situação: ${formData.situacao}`;
      
      // Simulating InvokeLLM integration
      const { content: generatedText } = await new Promise(resolve => setTimeout(() => {
        resolve({
          content: `**Oportunidade Única: Seu Novo Lar Espera por Você!**\n\nEste magnífico(a) ${formData.tipo} em excelente localização oferece incríveis **${formData.area_util_total} m²** de puro conforto e sofisticação. Com **${formData.quartos} quartos espaçosos**, ${formData.salas} salas bem iluminadas e ${formData.banheiros} banheiros, é o imóvel ideal para quem busca espaço e qualidade de vida para toda a família.\n\nDesfrute de momentos inesquecíveis em sua área de lazer privativa, equipada com **piscina e churrasqueira**. Os detalhes fazem a diferença: cozinha e banheiros com armários planejados, acabamento com rebaixamento em gesso e a vantagem do sol da manhã, garantindo ambientes sempre agradáveis. Comodidades como lavabo, medidor de água individual e janelas com venezianas completam este pacote de bem-estar. Com ${formData.vagas} vagas de garagem, você terá toda a conveniência de um estacionamento seguro.\n\nCom um excelente custo-benefício por apenas **${valorFormatado}**, este imóvel representa um investimento seguro e uma chance imperdível de morar bem. Não perca tempo!\n\nAgende sua visita hoje mesmo!`
        });
      }, 2000));
      
      setFormData(prev => ({ ...prev, descricao: generatedText }));
      toast({
        title: "Sucesso!",
        description: "Descrição gerada por IA.",
      });
    } catch (error) {
      console.error("Erro ao gerar texto com IA:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a descrição por IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePropertyPDF = () => {
    setGeneratingPdf(true);
    
    if (!formData.codigo || !formData.endereco) {
      toast({
        title: "Dados Incompletos",
        description: "É necessário preencher pelo menos o código e endereço do imóvel para gerar o PDF.",
        variant: "destructive"
      });
      setGeneratingPdf(false);
      return;
    }

    // Buscar proprietário selecionado
    const proprietarioSelecionado = proprietarios.find(p => p.id === formData.proprietario_id);
    
    // Gerar conteúdo HTML para o PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ficha do Imóvel - Código ${formData.codigo}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            .header h1 {
              font-size: 20px;
              font-weight: bold;
              margin: 0 0 5px 0;
              color: #2563eb;
            }
            .header p {
              font-size: 12px;
              color: #666;
              margin: 0;
            }
            .section {
              margin-bottom: 15px;
              break-inside: avoid;
            }
            .section h2 {
              font-size: 14px;
              font-weight: bold;
              background-color: #2563eb;
              color: white;
              padding: 8px;
              margin: 0 0 10px 0;
              border-radius: 3px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
              margin-bottom: 10px;
            }
            .field {
              margin-bottom: 8px;
            }
            .field-label {
              font-weight: bold;
              color: #555;
              font-size: 10px;
              text-transform: uppercase;
              margin-bottom: 2px;
              display: block;
            }
            .field-value {
              color: #333;
              font-size: 11px;
              word-wrap: break-word;
            }
            .field-value.currency {
              color: #059669;
              font-weight: bold;
            }
            .field-value.boolean-yes {
              color: #059669;
            }
            .field-value.boolean-no {
              color: #dc2626;
            }
            .description {
              background-color: #f9fafb;
              padding: 12px;
              border-radius: 5px;
              border-left: 4px solid #2563eb;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              font-size: 9px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
              margin-top: 20px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FICHA DE CADASTRO DE IMÓVEL</h1>
            <p>Código: <strong>${formData.codigo}</strong> | Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="section">
            <h2>DADOS BÁSICOS</h2>
            <div class="grid">
              <div class="field">
                <span class="field-label">Código do Imóvel</span>
                <span class="field-value">#${formData.codigo}</span>
              </div>
              <div class="field">
                <span class="field-label">Índice Cadastral</span>
                <span class="field-value">${formData.indice_cadastral || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Tipo de Imóvel</span>
                <span class="field-value">${formData.tipo || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Situação</span>
                <span class="field-value">${formData.situacao || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Valor</span>
                <span class="field-value currency">R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(formData.valor || 0)}</span>
              </div>
              <div class="field">
                <span class="field-label">Condomínio</span>
                <span class="field-value currency">R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(formData.valor_condominio || 0)}</span>
              </div>
              <div class="field">
                <span class="field-label">IPTU (anual)</span>
                <span class="field-value currency">R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(formData.valor_iptu || 0)}</span>
              </div>
              <div class="field">
                <span class="field-label">Aceita Permuta</span>
                <span class="field-value ${formData.aceita_permuta ? 'boolean-yes' : 'boolean-no'}">${formData.aceita_permuta ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>ENDEREÇO</h2>
            <div class="grid">
              <div class="field" style="grid-column: 1 / -1;">
                <span class="field-label">Endereço Completo</span>
                <span class="field-value">${formData.endereco}${formData.numero ? `, ${formData.numero}` : ''}${formData.complemento ? `, ${formData.complemento}` : ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Bairro</span>
                <span class="field-value">${formData.bairro || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Cidade/Estado</span>
                <span class="field-value">${formData.cidade}/${formData.estado}</span>
              </div>
              <div class="field">
                <span class="field-label">CEP</span>
                <span class="field-value">${formData.cep || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Região</span>
                <span class="field-value">${formData.regiao || 'N/A'}</span>
              </div>
            </div>
          </div>

          ${proprietarioSelecionado ? `
          <div class="section">
            <h2>DADOS DO PROPRIETÁRIO</h2>
            <div class="grid">
              <div class="field">
                <span class="field-label">Nome</span>
                <span class="field-value">${proprietarioSelecionado.nome}</span>
              </div>
              <div class="field">
                <span class="field-label">CPF/CNPJ</span>
                <span class="field-value">${proprietarioSelecionado.cpf_cnpj || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Telefone</span>
                <span class="field-value">${proprietarioSelecionado.telefone || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">E-mail</span>
                <span class="field-value">${proprietarioSelecionado.email || 'N/A'}</span>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h2>DETALHES E ÁREAS</h2>
            <div class="grid">
              <div class="field">
                <span class="field-label">Quartos</span>
                <span class="field-value">${formData.quartos || 0}</span>
              </div>
              <div class="field">
                <span class="field-label">Suítes</span>
                <span class="field-value">${formData.suites || 0}</span>
              </div>
              <div class="field">
                <span class="field-label">Salas</span>
                <span class="field-value">${formData.salas || 0}</span>
              </div>
              <div class="field">
                <span class="field-label">Banheiros</span>
                <span class="field-value">${formData.banheiros || 0}</span>
              </div>
              <div class="field">
                <span class="field-label">Vagas de Garagem</span>
                <span class="field-value">${formData.vagas || 0}</span>
              </div>
              <div class="field">
                <span class="field-label">Área Útil/Total</span>
                <span class="field-value">${formData.area_util_total || 0} m²</span>
              </div>
              <div class="field">
                <span class="field-label">Área Construída</span>
                <span class="field-value">${formData.area_construida || 0} m²</span>
              </div>
              <div class="field">
                <span class="field-label">Área do Lote</span>
                <span class="field-value">${formData.area_lote_terreno || 0} m²</span>
              </div>
              <div class="field">
                <span class="field-label">Idade do Imóvel</span>
                <span class="field-value">${formData.idade ? `${formData.idade} anos` : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Construtora</span>
                <span class="field-value">${formData.construtora || 'N/A'}</span>
              </div>
            </div>
            ${formData.caracteristicas_extras && formData.caracteristicas_extras.length > 0 ? `
            <div class="field" style="margin-top: 10px;">
              <span class="field-label">Características Extras</span>
              <span class="field-value">${formData.caracteristicas_extras.join(', ')}</span>
            </div>
            ` : ''}
          </div>

          ${formData.descricao ? `
          <div class="section">
            <h2>DESCRIÇÃO</h2>
            <div class="description">${formData.descricao}</div>
          </div>
          ` : ''}

          <div class="section">
            <h2>DOCUMENTAÇÃO E INFORMAÇÕES INTERNAS</h2>
            <div class="grid">
              <div class="field">
                <span class="field-label">Local das Chaves</span>
                <span class="field-value">${formData.local_chaves || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Exclusividade</span>
                <span class="field-value ${formData.exclusividade ? 'boolean-yes' : 'boolean-no'}">${formData.exclusividade ? 'Sim' : 'Não'}</span>
              </div>
              <div class="field">
                <span class="field-label">Quitado</span>
                <span class="field-value ${formData.quitado ? 'boolean-yes' : 'boolean-no'}">${formData.quitado ? 'Sim' : 'Não'}</span>
              </div>
              <div class="field">
                <span class="field-label">Comissão Imobiliária</span>
                <span class="field-value">${formData.comissao_imobiliaria || 'N/A'}%</span>
              </div>
            </div>
            ${formData.observacoes_internas ? `
            <div class="field" style="margin-top: 10px;">
              <span class="field-label">Observações Internas</span>
              <div class="description" style="background-color: #fef3c7;">${formData.observacoes_internas}</div>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <h2>MÍDIA E DIVULGAÇÃO</h2>
            <div class="grid">
              <div class="field">
                <span class="field-label">Galeria de Fotos</span>
                <span class="field-value">${formData.fotos ? formData.fotos.length : 0} foto(s)</span>
              </div>
              <div class="field">
                <span class="field-label">URL do Vídeo</span>
                <span class="field-value">${formData.video_url ? 'Sim' : 'Não'}</span>
              </div>
              <div class="field">
                <span class="field-label">Imóvel Ativo</span>
                <span class="field-value ${formData.ativo ? 'boolean-yes' : 'boolean-no'}">${formData.ativo ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Ficha gerada por ImobiGest - Sistema de Gestão Imobiliária<br>
            Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </body>
      </html>
    `;

    // Criar um blob com o conteúdo HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Aguardar um pouco para o conteúdo carregar e então imprimir
    setTimeout(() => {
      printWindow.print();
      setGeneratingPdf(false);
    }, 1000);
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          {property ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basicos" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basicos" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Básicos
              </TabsTrigger>
              <TabsTrigger value="proprietario" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Proprietário
              </TabsTrigger>
              <TabsTrigger value="caracteristicas" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Características
              </TabsTrigger>
              <TabsTrigger value="documentacao" className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Docs/Interno
              </TabsTrigger>
              <TabsTrigger value="midia" className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> Mídia/Portais
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basicos" className="space-y-6 mt-6">
              {/* Identificação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="indice_cadastral">Índice Cadastral</Label>
                  <Input
                    id="indice_cadastral"
                    value={formData.indice_cadastral}
                    onChange={(e) => handleInputChange('indice_cadastral', e.target.value)}
                    placeholder="Índice cadastral" />
                </div>
                <div>
                  <Label htmlFor="codigo">Código do Imóvel *</Label>
                  <div className="relative">
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      disabled
                      className={errors.codigo ? 'border-red-500' : ''} />
                    {isCodeLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Gerado automaticamente pelo sistema.</p>
                  {errors.codigo && <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>}
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-700"><Globe className="w-5 h-5" />Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="endereco">Logradouro *</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Rua, Avenida, Praça..."
                      className={errors.endereco ? 'border-red-500' : ''}
                    />
                    {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco}</p>}
                  </div>
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                      placeholder="123" />
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange('complemento', e.target.value)}
                      placeholder="Apto, Sala, Bloco..." />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange('bairro', e.target.value)}
                      placeholder="Bairro" />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      placeholder="Cidade" />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      placeholder="Estado" />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000" />
                  </div>
                  <div>
                    <Label htmlFor="regiao">Região</Label>
                    <Input
                      id="regiao"
                      value={formData.regiao}
                      onChange={(e) => handleInputChange('regiao', e.target.value)}
                      placeholder="Centro, Leste, etc." />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="mostrar_endereco_completo"
                      checked={formData.mostrar_endereco_completo}
                      onCheckedChange={(checked) => handleInputChange('mostrar_endereco_completo', checked)}
                    />
                    <label
                      htmlFor="mostrar_endereco_completo"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mostrar endereço completo no portal
                    </label>
                  </div>
                </div>
              </div>

              {/* Dados Gerais */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-700"><Settings className="w-5 h-5" />Dados Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Imóvel *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                      <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Lote">Lote</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Rural">Rural</SelectItem>
                        <SelectItem value="Cobertura">Cobertura</SelectItem>
                        <SelectItem value="Loja">Loja</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
                  </div>
                  <div>
                    <Label htmlFor="situacao">Situação *</Label>
                    <Select value={formData.situacao} onValueChange={(value) => handleInputChange('situacao', value)}>
                      <SelectTrigger className={errors.situacao ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Venda">Venda</SelectItem>
                        <SelectItem value="Aluguel">Aluguel</SelectItem>
                        <SelectItem value="Venda e Aluguel">Venda e Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.situacao && <p className="text-red-500 text-sm mt-1">{errors.situacao}</p>}
                  </div>
                  <div>
                    <Label htmlFor="situacao_lancamento">Situação Lançamento</Label>
                    <Select value={formData.situacao_lancamento} onValueChange={(value) => handleInputChange('situacao_lancamento', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a situação de lançamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {situacoesLancamento.map(situacao => (
                          <SelectItem key={situacao} value={situacao}>{situacao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      value={formData.valor}
                      onChange={(e) => handleInputChange('valor', e.target.value)}
                      placeholder="0.00"
                      className={errors.valor ? 'border-red-500' : ''}
                    />
                    {errors.valor && <p className="text-red-500 text-sm mt-1">{errors.valor}</p>}
                  </div>
                  <div>
                    <Label htmlFor="valor_condominio">Valor Condomínio (R$)</Label>
                    <Input
                      id="valor_condominio"
                      type="number"
                      value={formData.valor_condominio}
                      onChange={(e) => handleInputChange('valor_condominio', e.target.value)}
                      placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="valor_iptu">Valor IPTU (R$)</Label>
                    <Input
                      id="valor_iptu"
                      type="number"
                      value={formData.valor_iptu}
                      onChange={(e) => handleInputChange('valor_iptu', e.target.value)}
                      placeholder="0.00" />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="aceita_permuta"
                      checked={formData.aceita_permuta}
                      onCheckedChange={(checked) => handleInputChange('aceita_permuta', checked)}
                    />
                    <label
                      htmlFor="aceita_permuta"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aceita Permuta
                    </label>
                  </div>
                  <div>
                    <Label htmlFor="ocupacao">Ocupação</Label>
                    <Select value={formData.ocupacao} onValueChange={(value) => handleInputChange('ocupacao', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ocupação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vazio">Vazio</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                        <SelectItem value="Alugado">Alugado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="proprietario" className="space-y-6 mt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-700"><User className="w-5 h-5" />Dados do Proprietário</h3>
              <ProprietarioSelector
                proprietarioId={formData.proprietario_id}
                onSelectProprietario={(id) => handleInputChange('proprietario_id', id)}
                proprietarios={proprietarios}
                error={errors.proprietario_id}
                required={true}
              />
              <CaptadorSelector
                captadores={formData.captadores}
                onCaptatoresChange={(captadores) => handleInputChange('captadores', captadores)}
                corretores={corretores}
              />
            </TabsContent>

            <TabsContent value="caracteristicas" className="space-y-6 mt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-700"><Sparkles className="w-5 h-5" />Detalhes e Áreas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="quartos">Quartos</Label>
                  <Input
                    id="quartos"
                    type="number"
                    value={formData.quartos}
                    onChange={(e) => handleInputChange('quartos', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="suites">Suítes</Label>
                  <Input
                    id="suites"
                    type="number"
                    value={formData.suites}
                    onChange={(e) => handleInputChange('suites', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="salas">Salas</Label>
                  <Input
                    id="salas"
                    type="number"
                    value={formData.salas}
                    onChange={(e) => handleInputChange('salas', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="banheiros">Banheiros</Label>
                  <Input
                    id="banheiros"
                    type="number"
                    value={formData.banheiros}
                    onChange={(e) => handleInputChange('banheiros', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="varandas">Varandas</Label>
                  <Input
                    id="varandas"
                    type="number"
                    value={formData.varandas}
                    onChange={(e) => handleInputChange('varandas', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="vagas">Vagas de Garagem</Label>
                  <Input
                    id="vagas"
                    type="number"
                    value={formData.vagas}
                    onChange={(e) => handleInputChange('vagas', e.target.value)}
                    placeholder="0" />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="descricao_vagas">Descrição das Vagas</Label>
                  <Input
                    id="descricao_vagas"
                    value={formData.descricao_vagas.join(', ')}
                    onChange={(e) => handleInputChange('descricao_vagas', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Ex: 2 cobertas, 1 descoberta" />
                </div>
                <div>
                  <Label htmlFor="area_util_total">Área Útil/Total (m²)</Label>
                  <Input
                    id="area_util_total"
                    type="number"
                    value={formData.area_util_total}
                    onChange={(e) => handleInputChange('area_util_total', e.target.value)}
                    placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="area_lote_terreno">Área Lote/Terreno (m²)</Label>
                  <Input
                    id="area_lote_terreno"
                    type="number"
                    value={formData.area_lote_terreno}
                    onChange={(e) => handleInputChange('area_lote_terreno', e.target.value)}
                    placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="area_construida">Área Construída (m²)</Label>
                  <Input
                    id="area_construida"
                    type="number"
                    value={formData.area_construida}
                    onChange={(e) => handleInputChange('area_construida', e.target.value)}
                    placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="frente">Frente (m)</Label>
                  <Input
                    id="frente"
                    type="number"
                    value={formData.frente}
                    onChange={(e) => handleInputChange('frente', e.target.value)}
                    placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="idade">Idade do Imóvel (anos)</Label>
                  <Input
                    id="idade"
                    type="number"
                    value={formData.idade}
                    onChange={(e) => handleInputChange('idade', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="posicao">Posição</Label>
                  <Input
                    id="posicao"
                    value={formData.posicao}
                    onChange={(e) => handleInputChange('posicao', e.target.value)}
                    placeholder="Ex: Frente, Fundos, Meio de quadra" />
                </div>
                <div>
                  <Label htmlFor="topografia">Topografia</Label>
                  <Input
                    id="topografia"
                    value={formData.topografia}
                    onChange={(e) => handleInputChange('topografia', e.target.value)}
                    placeholder="Ex: Plano, Aclive, Declive" />
                </div>
                <div>
                  <Label htmlFor="pavimentos">Total de Pavimentos</Label>
                  <Input
                    id="pavimentos"
                    type="number"
                    value={formData.pavimentos}
                    onChange={(e) => handleInputChange('pavimentos', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="total_unidades">Total de Unidades</Label>
                  <Input
                    id="total_unidades"
                    type="number"
                    value={formData.total_unidades}
                    onChange={(e) => handleInputChange('total_unidades', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="unidades_andar">Unidades por Andar</Label>
                  <Input
                    id="unidades_andar"
                    type="number"
                    value={formData.unidades_andar}
                    onChange={(e) => handleInputChange('unidades_andar', e.target.value)}
                    placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="andar_imovel">Andar do Imóvel</Label>
                  <Input
                    id="andar_imovel"
                    type="number"
                    value={formData.andar_imovel}
                    onChange={(e) => handleInputChange('andar_imovel', e.target.value)}
                    placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="construtora">Construtora/Edifício</Label>
                  <Input
                    id="construtora"
                    value={formData.construtora}
                    onChange={(e) => handleInputChange('construtora', e.target.value)}
                    placeholder="Nome da construtora ou edifício" />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="caracteristicas_extras">Características Extras (separar por vírgula)</Label>
                  <Input
                    id="caracteristicas_extras"
                    value={formData.caracteristicas_extras.join(', ')}
                    onChange={(e) => handleInputChange('caracteristicas_extras', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Piscina, Academia, Salão de festas, Porteiro 24h" />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição do Imóvel</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    onClick={handleGenerateAIText}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar com IA
                      </>
                    )}
                  </Button>
                  <Input
                    id="referencia"
                    value={formData.referencia}
                    onChange={(e) => handleInputChange('referencia', e.target.value)}
                    placeholder="Ponto de referência ou característica principal para descrição"
                  />
                </div>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva o imóvel em detalhes para o público."
                  rows={8}
                />
              </div>
            </TabsContent>

            <TabsContent value="documentacao" className="space-y-6 mt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-700"><FileText className="w-5 h-5" />Documentação e Interno</h3>
              <div>
                <Label>Documentação Disponível</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {documentacoes.map(doc => (
                    <div key={doc} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doc-${doc}`}
                        checked={formData.documentacao.includes(doc)}
                        onCheckedChange={(checked) => handleArrayChange('documentacao', doc, checked)}
                      />
                      <label htmlFor={`doc-${doc}`} className="text-sm font-medium leading-none">
                        {doc}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
                  <Textarea
                    id="condicao_pagamento"
                    value={formData.condicao_pagamento}
                    onChange={(e) => handleInputChange('condicao_pagamento', e.target.value)}
                    placeholder="Ex: À vista, Financiamento, FGTS"
                    rows={3} />
                </div>
                <div>
                  <Label htmlFor="local_chaves">Local das Chaves</Label>
                  <Input
                    id="local_chaves"
                    value={formData.local_chaves}
                    onChange={(e) => handleInputChange('local_chaves', e.target.value)}
                    placeholder="Onde as chaves estão guardadas?" />
                </div>
                <div>
                  <Label htmlFor="loja_captacao">Loja de Captação</Label>
                  <Input
                    id="loja_captacao"
                    value={formData.loja_captacao}
                    onChange={(e) => handleInputChange('loja_captacao', e.target.value)}
                    placeholder="Loja que captou o imóvel" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exclusividade"
                    checked={formData.exclusividade}
                    onCheckedChange={(checked) => handleInputChange('exclusividade', checked)}
                  />
                  <label htmlFor="exclusividade" className="text-sm font-medium leading-none">
                    Exclusividade
                  </label>
                </div>
                {formData.exclusividade && (
                  <div>
                    <Label htmlFor="vencimento_exclusividade">Vencimento da Exclusividade</Label>
                    <Input
                      id="vencimento_exclusividade"
                      type="date"
                      value={formData.vencimento_exclusividade}
                      onChange={(e) => handleInputChange('vencimento_exclusividade', e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quitado"
                    checked={formData.quitado}
                    onCheckedChange={(checked) => handleInputChange('quitado', checked)}
                  />
                  <label htmlFor="quitado" className="text-sm font-medium leading-none">
                    Quitado
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oportunidade"
                    checked={formData.oportunidade}
                    onCheckedChange={(checked) => handleInputChange('oportunidade', checked)}
                  />
                  <label htmlFor="oportunidade" className="text-sm font-medium leading-none">
                    Oportunidade
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comissao_imobiliaria">Comissão Imobiliaria (%)</Label>
                  <Input
                    id="comissao_imobiliaria"
                    value={formData.comissao_imobiliaria}
                    onChange={(e) => handleInputChange('comissao_imobiliaria', e.target.value)}
                    placeholder="%" />
                </div>
                <div>
                  <Label htmlFor="comissao_captador">Comissão Captador (%)</Label>
                  <Input
                    id="comissao_captador"
                    value={formData.comissao_captador}
                    onChange={(e) => handleInputChange('comissao_captador', e.target.value)}
                    placeholder="%" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="possui_banner"
                    checked={formData.possui_banner}
                    onCheckedChange={(checked) => handleInputChange('possui_banner', checked)}
                  />
                  <label htmlFor="possui_banner" className="text-sm font-medium leading-none">
                    Possui Banner
                  </label>
                </div>
                {formData.possui_banner && (
                  <>
                    <div>
                      <Label htmlFor="data_colocacao_banner">Data Colocação Banner</Label>
                      <Input
                        id="data_colocacao_banner"
                        type="date"
                        value={formData.data_colocacao_banner}
                        onChange={(e) => handleInputChange('data_colocacao_banner', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="colocado_banner_por">Colocado por</Label>
                      <Input
                        id="colocado_banner_por"
                        value={formData.colocado_banner_por}
                        onChange={(e) => handleInputChange('colocado_banner_por', e.target.value)}
                        placeholder="Nome do responsável" />
                    </div>
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="observacoes_internas">Observações Internas (Não aparecem no portal)</Label>
                <Textarea
                  id="observacoes_internas"
                  value={formData.observacoes_internas}
                  onChange={(e) => handleInputChange('observacoes_internas', e.target.value)}
                  placeholder="Informações relevantes para a equipe interna."
                  rows={4} />
              </div>

              <div>
                <Label htmlFor="notas_vistoria">Notas da Vistoria</Label>
                <Textarea
                  id="notas_vistoria"
                  value={formData.notas_vistoria}
                  onChange={(e) => handleInputChange('notas_vistoria', e.target.value)}
                  placeholder="Detalhes da vistoria do imóvel."
                  rows={4} />
              </div>

              <div>
                <Label htmlFor="informacoes_adicionais">Informações Adicionais (Outros)</Label>
                <Textarea
                  id="informacoes_adicionais"
                  value={formData.informacoes_adicionais}
                  onChange={(e) => handleInputChange('informacoes_adicionais', e.target.value)}
                  placeholder="Qualquer outra informação relevante."
                  rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="midia" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-700">
                  <Camera className="w-5 h-5" />
                  Mídia e Divulgação
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePropertyPDF}
                  disabled={generatingPdf}
                >
                  {generatingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2" />}
                  Baixar em PDF
                </Button>
              </div>

              <PropertyPhotoGallery
                photos={formData.fotos}
                onPhotosChange={handlePhotosChange}
                mainPhoto={formData.foto_principal}
                onSetMainPhoto={(photoUrl) => handleInputChange('foto_principal', photoUrl)}
              />

              <div className="space-y-2">
                <Label htmlFor="video_url" className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  URL do Vídeo (YouTube)
                </Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={errors.video_url ? 'border-red-500' : ''}
                />
                {errors.video_url && (
                  <p className="text-sm text-red-500">{errors.video_url}</p>
                )}
                <p className="text-xs text-gray-500">
                  Adicione um link do YouTube para exibir um vídeo na página do imóvel.
                </p>
              </div>

              <PortaisDivulgacao
                portais={formData.portais_divulgacao}
                onPortaisChange={(updatedPortais) => handleInputChange('portais_divulgacao', updatedPortais)}
              />
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleInputChange('ativo', checked)}
                />
                <label
                  htmlFor="ativo"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Imóvel Ativo (Será exibido no portal público)
                </label>
              </div>
            </TabsContent>

          </Tabs>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isCodeLoading || isGenerating} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {property ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
