
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, User, Building2, Calendar, Clock, FileText, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/api/entities";
import { Imovel } from "@/api/entities";
import { User as UserEntity } from "@/api/entities"; // Renamed to avoid conflict with Lucide icon
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import ClienteSignaturePad from "../forms/ClienteSignaturePad";


const SearchableSelector = ({ entity, onSelect, placeholder, searchFields, displayField, selectedId }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const data = await entity.list();
            setItems(data);
            if (selectedId) {
                const item = data.find(i => i.id === selectedId);
                setSelectedItem(item);
                if(item) setQuery(item[displayField]);
            }
        };
        loadData();
    }, [entity, selectedId, displayField]);

    useEffect(() => {
        if (query.length > 2 && !selectedItem) {
            const filtered = items.filter(item => 
                searchFields.some(field => 
                    item[field]?.toString().toLowerCase().includes(query.toLowerCase())
                )
            );
            setResults(filtered.slice(0, 5));
        } else {
            setResults([]);
        }
    }, [query, items, searchFields, selectedItem]);

    const handleSelect = (item) => {
        setSelectedItem(item);
        setQuery(item[displayField]);
        onSelect(item);
        setResults([]);
    };

    return (
        <div className="relative">
            <Input 
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if(selectedItem) {
                        setSelectedItem(null);
                        onSelect(null);
                    }
                }}
                placeholder={placeholder}
            />
            {results.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto">
                    {results.map(item => (
                        <li 
                            key={item.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelect(item)}
                        >
                            {item[displayField]} ({item[searchFields[1]]})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default function FichaVisitaForm({ onSave, onCancel, ficha, currentUser }) {
  const [formData, setFormData] = useState(ficha || {
    cliente_id: '',
    imovel_id: '',
    corretor_id: currentUser?.id || '',
    data_visita: new Date().toISOString().split('T')[0],
    horario_visita: new Date().toTimeString().slice(0,5),
    status: 'Pendente',
    observacoes: '',
    avaliacao_interesse: '',
    avaliacao_comentarios: '',
    assinatura_cliente: '',
    anexos: [],
    historico: []
  });

  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedImovel, setSelectedImovel] = useState(null);
  const [corretores, setCorretores] = useState([]);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if(ficha) {
        if(ficha.cliente_id) Cliente.get(ficha.cliente_id).then(setSelectedCliente);
        if(ficha.imovel_id) Imovel.get(ficha.imovel_id).then(setSelectedImovel);
    }
    const loadCorretores = async () => {
        const data = await UserEntity.list();
        setCorretores(data.filter(u => u.tipo_usuario === 'Corretor' || u.tipo_usuario === 'Super Admin' || u.tipo_usuario === 'Gerente'));
    };
    loadCorretores();
  }, [ficha]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro se existir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Cliente é obrigatório';
    }
    
    if (!formData.imovel_id) {
      newErrors.imovel_id = 'Imóvel é obrigatório';
    }
    
    if (!formData.data_visita) {
      newErrors.data_visita = 'Data da visita é obrigatória';
    }
    
    if (!formData.horario_visita) {
      newErrors.horario_visita = 'Horário da visita é obrigatório';
    }

    // Assinatura obrigatória para fichas realizadas
    if (formData.status === 'Realizada' && !formData.assinatura_cliente) {
      newErrors.assinatura_cliente = 'Assinatura do cliente é obrigatória para fichas realizadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(formData);
  };

  const handleDownloadPDF = () => {
    if (!selectedCliente || !selectedImovel) {
      toast({
        title: "Dados Incompletos",
        description: "É necessário selecionar cliente e imóvel para gerar o PDF.",
        variant: "destructive"
      });
      return;
    }

    // Encontrar dados do corretor
    const corretor = corretores.find(c => c.id === formData.corretor_id) || currentUser;

    // Gerar conteúdo HTML para o PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ficha de Visita - ${selectedCliente.nome}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }
            .header p {
              font-size: 10px;
              color: #666;
              margin: 0;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h2 {
              font-size: 14px;
              font-weight: bold;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .field-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .field {
              margin-bottom: 8px;
            }
            .field-label {
              font-weight: bold;
              font-size: 10px;
              color: #666;
              margin-bottom: 2px;
            }
            .field-value {
              font-size: 12px;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 2px;
            }
            .declaration {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: justify;
            }
            .signature-section {
              margin-top: 50px;
              text-align: center;
            }
            .signature-line {
              border-bottom: 1px solid #333;
              width: 300px;
              margin: 30px auto 5px auto;
            }
            .signature-label {
              font-size: 10px;
              color: #666;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            .signature-image {
              border: 1px solid #ccc;
              padding: 10px;
              margin: 10px auto;
              display: block;
              max-width: 300px;
              max-height: 150px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FICHA DE VISITA DE IMÓVEL</h1>
            <p>Documento de controle e compromisso de intermediação</p>
          </div>

          <div class="section">
            <h2>IDENTIFICAÇÃO DO CORRETOR</h2>
            <div class="field-grid">
              <div class="field">
                <div class="field-label">Nome</div>
                <div class="field-value">${corretor?.full_name || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">CRECI</div>
                <div class="field-value">${corretor?.creci || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">Telefone</div>
                <div class="field-value">${corretor?.celular || corretor?.telefone || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">E-mail</div>
                <div class="field-value">${corretor?.email || 'Não informado'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>IDENTIFICAÇÃO DO CLIENTE</h2>
            <div class="field-grid">
              <div class="field">
                <div class="field-label">Nome</div>
                <div class="field-value">${selectedCliente.nome}</div>
              </div>
              <div class="field">
                <div class="field-label">CPF/CNPJ</div>
                <div class="field-value">${selectedCliente.cpf_cnpj || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">Telefone</div>
                <div class="field-value">${selectedCliente.celular || selectedCliente.telefone || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">E-mail</div>
                <div class="field-value">${selectedCliente.email || 'Não informado'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>INFORMAÇÕES DO IMÓVEL VISITADO</h2>
            <div class="field-grid">
              <div class="field">
                <div class="field-label">Código de Referência</div>
                <div class="field-value">#${selectedImovel.codigo}</div>
              </div>
              <div class="field">
                <div class="field-label">Tipo de Imóvel</div>
                <div class="field-value">${selectedImovel.tipo}</div>
              </div>
              <div class="field">
                <div class="field-label">Endereço</div>
                <div class="field-value">${selectedImovel.endereco}, ${selectedImovel.numero || 'S/N'}</div>
              </div>
              <div class="field">
                <div class="field-label">Bairro / Cidade</div>
                <div class="field-value">${selectedImovel.bairro}, ${selectedImovel.cidade}/${selectedImovel.estado}</div>
              </div>
              <div class="field">
                <div class="field-label">Finalidade</div>
                <div class="field-value">${selectedImovel.situacao}</div>
              </div>
              <div class="field">
                <div class="field-label">Valor</div>
                <div class="field-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedImovel.valor || 0)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>DECLARAÇÃO DE VISITA E COMPROMISSO</h2>
            <div class="declaration">
              <p>Declaro para os devidos fins que, nesta data, visitei o imóvel acima descrito, apresentado pelo corretor identificado. Reconheço que a apresentação deste imóvel foi resultado do trabalho de intermediação da imobiliária.</p>
              <p>Comprometo-me a não tratar da compra ou locação deste imóvel diretamente com o proprietário ou por meio de terceiros. Caso a negociação se concretize, a comissão de corretagem será devida à imobiliária, conforme a legislação vigente (Art. 725 do Código Civil) e os costumes locais, mesmo que a transação ocorra após o vencimento de eventual autorização de venda. Esta ficha tem validade legal e serve como prova da intermediação.</p>
            </div>
          </div>

          ${formData.avaliacao_interesse ? `
          <div class="section">
            <h2>AVALIAÇÃO DO CLIENTE</h2>
            <div class="field">
              <div class="field-label">Nível de Interesse</div>
              <div class="field-value">${formData.avaliacao_interesse}</div>
            </div>
            ${formData.avaliacao_comentarios ? `
            <div class="field">
              <div class="field-label">Comentários</div>
              <div class="field-value">${formData.avaliacao_comentarios}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="signature-section">
            ${formData.assinatura_cliente ? `
            <h2>ASSINATURA DIGITAL DO CLIENTE</h2>
            <img src="${formData.assinatura_cliente}" alt="Assinatura Digital do Cliente" class="signature-image"/>
            <div class="signature-label"><strong>${selectedCliente.nome}</strong></div>
            <div class="signature-label">(Assinatura Digital Capturada)</div>
            ` : `
            <div class="signature-line"></div>
            <div class="signature-label"><strong>${selectedCliente.nome}</strong></div>
            <div class="signature-label">(Assinatura do Cliente)</div>
            `}
          </div>

          <div class="footer">
            <p>Data da Visita: ${new Date(formData.data_visita).toLocaleDateString('pt-BR')} às ${formData.horario_visita}</p>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;

    // Criar nova janela com o conteúdo
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Aguardar carregamento e abrir dialog de impressão
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // Fechar a janela após impressão (opcional)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{ficha ? 'Editar Ficha de Visita' : 'Nova Ficha de Visita'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Selections */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label className="flex items-center gap-2 mb-2"><User className="w-4 h-4"/> Cliente *</Label>
                    <SearchableSelector 
                        entity={Cliente} 
                        onSelect={(item) => {
                            handleInputChange('cliente_id', item?.id);
                            setSelectedCliente(item);
                        }} 
                        placeholder="Buscar por nome, CPF ou e-mail..."
                        searchFields={['nome', 'cpf_cnpj', 'email']}
                        displayField="nome"
                        selectedId={formData.cliente_id}
                    />
                    {errors.cliente_id && <p className="text-red-500 text-sm mt-1">{errors.cliente_id}</p>}
                </div>
                <div>
                    <Label className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4"/> Imóvel *</Label>
                    <SearchableSelector 
                        entity={Imovel} 
                        onSelect={(item) => {
                            handleInputChange('imovel_id', item?.id);
                            setSelectedImovel(item);
                        }} 
                        placeholder="Buscar por código, endereço ou bairro..."
                        searchFields={['codigo', 'endereco', 'bairro']}
                        displayField="endereco"
                        selectedId={formData.imovel_id}
                    />
                    {errors.imovel_id && <p className="text-red-500 text-sm mt-1">{errors.imovel_id}</p>}
                </div>
            </div>

            {/* Auto-populated info */}
            <div className="grid md:grid-cols-2 gap-6">
                {selectedCliente && <InfoCard title="Dados do Cliente" data={selectedCliente} />}
                {selectedImovel && <InfoCard title="Dados do Imóvel" data={selectedImovel} />}
            </div>

            {/* Visit Details */}
            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <Label className="flex items-center gap-2 mb-2"><User className="w-4 h-4"/> Corretor Responsável</Label>
                    <Select value={formData.corretor_id} onValueChange={(v) => handleInputChange('corretor_id', v)} disabled={currentUser?.tipo_usuario !== 'Super Admin'}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {corretores.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4"/> Data da Visita *</Label>
                    <Input type="date" value={formData.data_visita} onChange={(e) => handleInputChange('data_visita', e.target.value)} />
                    {errors.data_visita && <p className="text-red-500 text-sm mt-1">{errors.data_visita}</p>}
                </div>
                 <div>
                    <Label className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4"/> Horário da Visita *</Label>
                    <Input type="time" value={formData.horario_visita} onChange={(e) => handleInputChange('horario_visita', e.target.value)} />
                    {errors.horario_visita && <p className="text-red-500 text-sm mt-1">{errors.horario_visita}</p>}
                </div>
            </div>
            
            {/* Status and Observations */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4"/> Status da Visita</Label>
                    <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                         <SelectTrigger><SelectValue/></SelectTrigger>
                         <SelectContent>
                             <SelectItem value="Pendente">Pendente</SelectItem>
                             <SelectItem value="Realizada">Realizada</SelectItem>
                             <SelectItem value="Cancelada">Cancelada</SelectItem>
                         </SelectContent>
                    </Select>
                </div>
                <div className="md:col-span-2">
                    <Label className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4"/> Observações do Corretor</Label>
                    <Textarea value={formData.observacoes} onChange={(e) => handleInputChange('observacoes', e.target.value)} placeholder="Impressões da visita, feedback do cliente, pontos de atenção"/>
                </div>
            </div>

            {/* Client Evaluation */}
            <div className="space-y-4">
                <h3 className="font-semibold">Avaliação do Cliente (Opcional)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label>Nível de Interesse</Label>
                        <Select value={formData.avaliacao_interesse} onValueChange={(v) => handleInputChange('avaliacao_interesse', v)}>
                             <SelectTrigger><SelectValue placeholder="Selecione o interesse"/></SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="Alto">Alto</SelectItem>
                                 <SelectItem value="Médio">Médio</SelectItem>
                                 <SelectItem value="Baixo">Baixo</SelectItem>
                             </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Label>Comentários do Cliente</Label>
                        <Textarea value={formData.avaliacao_comentarios} onChange={(e) => handleInputChange('avaliacao_comentarios', e.target.value)} placeholder="Comentários, dúvidas ou sugestões do cliente."/>
                    </div>
                </div>
            </div>
            
            {/* Assinatura Digital do Cliente */}
            <div className="space-y-4">
              <ClienteSignaturePad
                value={formData.assinatura_cliente}
                onChange={(signature) => handleInputChange('assinatura_cliente', signature)}
                required={formData.status === 'Realizada'}
                error={errors.assinatura_cliente}
              />
              {errors.assinatura_cliente && <p className="text-red-500 text-sm mt-1">{errors.assinatura_cliente}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2"/>
                    Imprimir / Salvar PDF
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2"/>Cancelar</Button>
                <Button type="submit"><Save className="w-4 h-4 mr-2"/>{ficha ? 'Atualizar Ficha' : 'Salvar Ficha'}</Button>
            </div>
        </CardContent>
      </Card>
    </form>
  );
}

const InfoCard = ({ title, data }) => (
    <Card className="bg-gray-50">
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
            {Object.entries(data).slice(0,4).map(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    return <p key={key}><strong>{key.replace('_', ' ')}:</strong> {value}</p>
                }
                return null;
            })}
        </CardContent>
    </Card>
);
