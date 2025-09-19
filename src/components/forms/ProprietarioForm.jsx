import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Save, X, User, Download, FileText, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SignaturePad from "./SignaturePad";

export default function ProprietarioForm({ proprietario, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: proprietario?.nome || '',
    cpf_cnpj: proprietario?.cpf_cnpj || '',
    telefone: proprietario?.telefone || '',
    celular: proprietario?.celular || '',
    email: proprietario?.email || '',
    endereco: proprietario?.endereco || '',
    cidade: proprietario?.cidade || '',
    data_nascimento: proprietario?.data_nascimento || '',
    profissao: proprietario?.profissao || '',
    observacoes: proprietario?.observacoes || '',
    exclusividade: proprietario?.exclusividade || false,
    vencimento_exclusividade: proprietario?.vencimento_exclusividade || '',
    comissao_autorizada: proprietario?.comissao_autorizada || 6.0,
    data_autorizacao: proprietario?.data_autorizacao || new Date().toISOString().split('T')[0],
    termo_assinado: proprietario?.termo_assinado || false,
    assinatura_digital: proprietario?.assinatura_digital || '',
    ativo: proprietario?.ativo !== false
  });

  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (formData.comissao_autorizada < 0 || formData.comissao_autorizada > 100) {
      newErrors.comissao_autorizada = 'Comissão deve estar entre 0 e 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const generateAuthorizationPDF = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Dados Incompletos",
        description: "É necessário preencher pelo menos o nome do proprietário para gerar o termo.",
        variant: "destructive"
      });
      return;
    }

    // Gerar conteúdo HTML para o PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Termo de Autorização - ${formData.nome}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.6;
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
            .company-info {
              background-color: #f0f8ff;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              text-align: center;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h2 {
              font-size: 14px;
              font-weight: bold;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 15px;
              color: #2563eb;
            }
            .field-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .field {
              margin-bottom: 10px;
            }
            .field-label {
              font-weight: bold;
              font-size: 10px;
              color: #666;
              margin-bottom: 3px;
            }
            .field-value {
              font-size: 12px;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 3px;
            }
            .authorization-text {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: justify;
            }
            .legal-text {
              background-color: #fffacd;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 11px;
              text-align: justify;
            }
            .signature-section {
              margin-top: 40px;
              text-align: center;
            }
            .signature-line {
              border-bottom: 2px solid #333;
              width: 400px;
              margin: 40px auto 10px auto;
            }
            .signature-label {
              font-size: 11px;
              color: #666;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 15px;
            }
            .highlight {
              background-color: #e3f2fd;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TERMO DE AUTORIZAÇÃO DE VENDA IMOBILIÁRIA</h1>
            <p>Documento Legal de Intermediação</p>
          </div>

          <div class="company-info">
            <p><strong>ImobiGest - Sistema de Gestão Imobiliária</strong></p>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>Endereço: Av. Principal, 123 - Cabral, Contagem/MG</p>
          </div>

          <div class="authorization-text">
            <p>Eu, <strong>${formData.nome}</strong>, doravante denominado(a) <strong>PROPRIETÁRIO(A)</strong>, AUTORIZO 
            <strong>ImobiGest - Sistema de Gestão Imobiliária</strong> inscrita no CNPJ <strong>00.000.000/0001-00</strong>, 
            estabelecida com sua Matriz em <strong>Av. Principal, 123 - Cabral, Contagem/MG</strong>, 
            doravante denominada <strong>IMOBILIÁRIA</strong>, a comercializar o(s) imóvel(is) de minha propriedade.</p>
          </div>

          <div class="section">
            <h2>TIPO DE AUTORIZAÇÃO</h2>
            <div class="highlight">
              <p><strong>Tipo:</strong> ${formData.exclusividade ? 'AUTORIZAÇÃO COM EXCLUSIVIDADE' : 'AUTORIZAÇÃO SEM EXCLUSIVIDADE'}</p>
              ${formData.exclusividade && formData.vencimento_exclusividade ? 
                `<p><strong>Vencimento da Exclusividade:</strong> ${new Date(formData.vencimento_exclusividade).toLocaleDateString('pt-BR')}</p>` : ''}
              <p><strong>Comissão Autorizada:</strong> ${formData.comissao_autorizada}% calculado sobre o preço efetivo da transação</p>
              <p><strong>Data da Autorização:</strong> ${new Date(formData.data_autorizacao).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div class="section">
            <p><strong>DECLARO</strong> estar ciente que, no caso de venda do referido imóvel com a intermediação da 
            <strong>ImobiGest - Sistema de Gestão Imobiliária</strong>, pagarei o percentual de <strong>${formData.comissao_autorizada}%</strong> 
            calculado sobre o preço efetivo da transação, que deverá ser pago no ato da assinatura do 
            Instrumento Particular de Compra e Venda ou Cessão.</p>

            <p><strong>DECLARO</strong> ainda ter ciência que caso eu venda o imóvel a algum interessado que tenha visitado 
            através da <strong>ImobiGest - Sistema de Gestão Imobiliária</strong>, pagarei à mesma os honorários pactuados, 
            bastando para tal comprovação através da Ficha de Visita / Termo de Compromisso.</p>
          </div>

          <div class="section">
            <h2>DADOS DO PROPRIETÁRIO</h2>
            <div class="field-grid">
              <div class="field">
                <div class="field-label">Nome Completo</div>
                <div class="field-value">${formData.nome}</div>
              </div>
              <div class="field">
                <div class="field-label">CPF/CNPJ</div>
                <div class="field-value">${formData.cpf_cnpj || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">Telefone</div>
                <div class="field-value">${formData.telefone}</div>
              </div>
              <div class="field">
                <div class="field-label">Celular/WhatsApp</div>
                <div class="field-value">${formData.celular || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">E-mail</div>
                <div class="field-value">${formData.email || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">Data de Nascimento</div>
                <div class="field-value">${formData.data_nascimento ? new Date(formData.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">Profissão</div>
                <div class="field-value">${formData.profissao || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="field-label">Cidade</div>
                <div class="field-value">${formData.cidade || 'Não informado'}</div>
              </div>
            </div>
            <div class="field">
              <div class="field-label">Endereço Completo</div>
              <div class="field-value">${formData.endereco || 'Não informado'}</div>
            </div>
            ${formData.observacoes ? `
            <div class="field">
              <div class="field-label">Observações</div>
              <div class="field-value">${formData.observacoes}</div>
            </div>
            ` : ''}
          </div>

          <div class="legal-text">
            <h3 style="margin-top: 0;">FUNDAMENTAÇÃO LEGAL - CONSELHO FEDERAL DE CORRETORES DE IMÓVEIS - COFECI</h3>
            <p>No uso das atribuições que lhe confere o Artigo 15, inciso XVII, da Lei nº 6.530, de 2 de maio de 1978:</p>
            <p><strong>Art. 1º:</strong> Somente poderá anunciar publicamente o corretor de imóveis, pessoa física ou jurídica que tiver contrato escrito por intermediação imobiliária.</p>
            <p><strong>Art. 6º, V:</strong> É vetado ao Corretor de Imóveis receber comissões em desacordo com a tabela aprovada.</p>
            <p><strong>Art. 8º:</strong> Comete grave transgressão ética o Corretor de Imóveis que desatender os preceitos acima citados.</p>
          </div>

          <div class="signature-section">
            ${formData.assinatura_digital ? `
              <div style="margin-bottom: 20px;">
                <p><strong>ASSINATURA DIGITAL CAPTURADA</strong></p>
                <div style="border: 1px solid #ccc; padding: 20px; margin: 10px auto; width: 300px; height: 150px; background-color: #f9f9f9;">
                  <img src="${formData.assinatura_digital}" alt="Assinatura Digital" style="max-width: 100%; max-height: 100%; margin: auto; display: block;"/>
                </div>
              </div>
            ` : ''}
            
            <div class="signature-line"></div>
            <div class="signature-label">
              <strong>${formData.nome}</strong><br/>
              CPF/CNPJ: ${formData.cpf_cnpj || '____________________'}<br/>
              Telefone: ${formData.telefone}<br/>
              E-mail: ${formData.email || '____________________'}
            </div>
            
            ${!formData.assinatura_digital ? `
            <p style="margin-top: 30px; font-size: 10px; color: #999;">
              (Assinatura do Proprietário)
            </p>
            ` : ''}
          </div>

          <div class="footer">
            <p><strong>Data da Autorização:</strong> ${new Date(formData.data_autorizacao).toLocaleDateString('pt-BR')}</p>
            <p><strong>Local e Data:</strong> Contagem/MG, ${new Date().toLocaleDateString('pt-BR')}</p>
            <p>Documento gerado pelo sistema ImobiGest em ${new Date().toLocaleString('pt-BR')}</p>
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

    toast({
      title: "PDF Gerado!",
      description: "Termo de autorização pronto para impressão/download."
    });
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          {proprietario ? 'Editar Proprietário' : 'Novo Proprietário'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Autorização de Venda */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Autorização de Venda
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={generateAuthorizationPDF}
                disabled={!formData.nome}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Termo em PDF
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">DECLARAÇÃO DE AUTORIZAÇÃO DE VENDA</p>
                  <p>
                    "AUTORIZO <strong>ImobiGest - Sistema de Gestão Imobiliária</strong> inscrita no CNPJ <strong>00.000.000/0001-00</strong>, 
                    estabelecida com sua Matriz em <strong>Av. Principal, 123 - Cabral, Contagem/MG</strong>, 
                    a comercializar o(s) imóvel(is) de minha propriedade."
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exclusividade"
                  checked={formData.exclusividade}
                  onCheckedChange={(checked) => handleInputChange('exclusividade', checked)}
                />
                <Label htmlFor="exclusividade" className="font-medium">
                  Autorização com Exclusividade
                </Label>
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

              <div>
                <Label htmlFor="comissao_autorizada">
                  Comissão Autorizada (%) *
                </Label>
                <Input
                  id="comissao_autorizada"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.comissao_autorizada}
                  onChange={(e) => handleInputChange('comissao_autorizada', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 6.0"
                  className={errors.comissao_autorizada ? 'border-red-500' : ''}
                />
                {errors.comissao_autorizada && (
                  <p className="text-red-500 text-sm mt-1">{errors.comissao_autorizada}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_autorizacao">Data da Autorização</Label>
                <Input
                  id="data_autorizacao"
                  type="date"
                  value={formData.data_autorizacao}
                  onChange={(e) => handleInputChange('data_autorizacao', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termo_assinado"
                  checked={formData.termo_assinado}
                  onCheckedChange={(checked) => handleInputChange('termo_assinado', checked)}
                />
                <Label htmlFor="termo_assinado" className="font-medium">
                  Termo de Autorização Assinado
                </Label>
              </div>
            </div>

            {/* Assinatura Digital */}
            <SignaturePad
              value={formData.assinatura_digital}
              onChange={(signature) => handleInputChange('assinatura_digital', signature)}
              required={formData.termo_assinado}
              error={errors.assinatura_digital}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Textarea
                readOnly
                className="bg-transparent border-none resize-none text-xs text-gray-700 h-32"
                value={`FUNDAMENTO LEGAL - CONSELHO FEDERAL DE CORRETORES DE IMÓVEIS - COFECI, no uso das atribuições que lhe confere o Artigo 15, inciso XVII, da Lei nº 6.530, de 2 de maio de 1978:

Art. 1º: Somente poderá anunciar publicamente o corretor de imóveis, pessoa física ou jurídica que tiver contrato escrito por intermediação imobiliária.
Art. 6º, V: É vetado ao Corretor de Imóveis receber comissões em desacordo com a tabela aprovada.
Art. 8º: Comete grave transgressão ética o Corretor de Imóveis que desatender os preceitos acima citados.`}
              />
            </div>
          </div>

          <Separator />

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo do proprietário"
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>
              
              <div>
                <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(31) 3333-3333"
                  className={errors.telefone ? 'border-red-500' : ''}
                />
                {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
              </div>
              
              <div>
                <Label htmlFor="celular">Celular / WhatsApp</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  placeholder="(31) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  value={formData.profissao}
                  onChange={(e) => handleInputChange('profissao', e.target.value)}
                  placeholder="Ex: Engenheiro"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>
              
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Contagem"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações gerais sobre o proprietário"
              className="h-24"
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Proprietário Ativo</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {proprietario ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}