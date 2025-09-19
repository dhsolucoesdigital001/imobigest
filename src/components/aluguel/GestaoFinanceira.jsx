
import React, { useState, useEffect, useCallback } from "react";
import { ContratoLocacao, PagamentoAluguel, ReciboAluguel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus, AlertTriangle, CheckCircle, Clock, Download, Receipt, FileText, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function GestaoFinanceira({ onUpdateStats }) {
  const [recibos, setRecibos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showGerarRecibo, setShowGerarRecibo] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const [novoRecibo, setNovoRecibo] = useState({
    contrato_id: '',
    valor: '',
    referencia_mes: '',
    data_vencimento: '',
    forma_pagamento: 'PIX',
    status: 'Pendente',
    observacoes: '',
    chave_pix: '',
    codigo_boleto: ''
  });

  const loadData = useCallback(async () => {
    try {
      const [recibosData, contratosData] = await Promise.all([
        ReciboAluguel.list("-created_date"),
        ContratoLocacao.list()
      ]);

      // Atualizar status de recibos vencidos
      const recibosAtualizados = recibosData.map(recibo => {
        if (recibo.status === 'Pendente' && new Date(recibo.data_vencimento) < new Date()) {
          return { ...recibo, status: 'Atrasado' };
        }
        return recibo;
      });

      setRecibos(recibosAtualizados);
      setContratos(contratosData.filter(c => c.status === 'Ativo'));
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]); // Dependency corrected here

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `REC-${timestamp}`;
  };

  const calcularValorLiquido = (contrato, valorBase) => {
    const valor = parseFloat(valorBase) || 0;
    let valorLiquido = valor;
    let multa = 0;
    let juros = 0;

    // Se estiver atrasado, calcular multa e juros
    if (new Date(novoRecibo.data_vencimento) < new Date()) {
      const diasAtraso = Math.ceil((new Date() - new Date(novoRecibo.data_vencimento)) / (1000 * 60 * 60 * 24));
      multa = valor * (contrato.multa_atraso_percentual || 2) / 100;
      juros = valor * (contrato.juros_diarios_percentual || 0.033) / 100 * diasAtraso;
      valorLiquido = valor + multa + juros;
    }

    return {
      valor_liquido: valorLiquido,
      valor_multa: multa,
      valor_juros: juros
    };
  };

  const handleGerarRecibo = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const contrato = contratos.find(c => c.id === novoRecibo.contrato_id);
      if (!contrato) {
        throw new Error("Contrato não encontrado");
      }

      const { valor_liquido, valor_multa, valor_juros } = calcularValorLiquido(contrato, novoRecibo.valor);

      const reciboData = {
        numero_recibo: generateReceiptNumber(),
        contrato_id: novoRecibo.contrato_id,
        valor: parseFloat(novoRecibo.valor),
        referencia_mes: novoRecibo.referencia_mes,
        data_vencimento: novoRecibo.data_vencimento,
        forma_pagamento: novoRecibo.forma_pagamento,
        status: novoRecibo.status,
        observacoes: novoRecibo.observacoes,
        chave_pix: novoRecibo.chave_pix,
        codigo_boleto: novoRecibo.codigo_boleto,
        valor_multa,
        valor_juros,
        valor_liquido
      };

      await ReciboAluguel.create(reciboData);
      
      toast({
        title: "Sucesso!",
        description: "Recibo gerado com sucesso."
      });

      setShowGerarRecibo(false);
      setNovoRecibo({
        contrato_id: '',
        valor: '',
        referencia_mes: '',
        data_vencimento: '',
        forma_pagamento: 'PIX',
        status: 'Pendente',
        observacoes: '',
        chave_pix: '',
        codigo_boleto: ''
      });

      loadData();
      if (onUpdateStats) onUpdateStats();

    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o recibo.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const confirmarPagamento = async (reciboId) => {
    try {
      await ReciboAluguel.update(reciboId, {
        status: 'Pago',
        data_pagamento: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Pagamento Confirmado",
        description: "O pagamento foi confirmado com sucesso."
      });
      
      loadData();
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const gerarPDF = async (recibo) => {
    try {
      const contrato = contratos.find(c => c.id === recibo.contrato_id);
      
      // Simular geração de PDF (em produção, usar biblioteca como jsPDF ou chamada para backend)
      const pdfContent = `
        RECIBO DE PAGAMENTO - ${recibo.numero_recibo}
        
        Data: ${new Date().toLocaleDateString('pt-BR')}
        Contrato: ${contrato?.numero_contrato || 'N/A'}
        Referência: ${new Date(recibo.referencia_mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        
        Valor: ${formatCurrency(recibo.valor)}
        ${recibo.valor_multa > 0 ? `Multa: ${formatCurrency(recibo.valor_multa)}` : ''}
        ${recibo.valor_juros > 0 ? `Juros: ${formatCurrency(recibo.valor_juros)}` : ''}
        Valor Líquido: ${formatCurrency(recibo.valor_liquido)}
        
        Método: ${recibo.forma_pagamento}
        Vencimento: ${new Date(recibo.data_vencimento).toLocaleDateString('pt-BR')}
        Status: ${recibo.status}
        
        ${recibo.observacoes ? `Observações: ${recibo.observacoes}` : ''}
      `;
      
      // Criar blob e fazer download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${recibo.numero_recibo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Gerado",
        description: "O recibo foi gerado e está sendo baixado."
      });
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF do recibo.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Atrasado': return 'bg-red-100 text-red-800';
      case 'Cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const filteredRecibos = recibos.filter(recibo => {
    if (filtroStatus === "todos") return true;
    if (filtroStatus === "pagos") return recibo.status === 'Pago';
    if (filtroStatus === "pendentes") return recibo.status === 'Pendente';
    if (filtroStatus === "atrasados") return recibo.status === 'Atrasado';
    return true;
  });

  const handleContratoChange = (contratoId) => {
    const contrato = contratos.find(c => c.id === contratoId);
    if (contrato) {
      const proximoVencimento = new Date();
      proximoVencimento.setDate(contrato.dia_vencimento || 10);
      if (proximoVencimento <= new Date()) {
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      }

      setNovoRecibo(prev => ({
        ...prev,
        contrato_id: contratoId,
        valor: contrato.valor_total_mensal || contrato.valor_aluguel || '',
        data_vencimento: proximoVencimento.toISOString().split('T')[0],
        referencia_mes: new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
      }));
    }
  };

  if (loading) {
    return <div className="p-6">Carregando dados financeiros...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Gestão Financeira
          </h2>
          <p className="text-gray-600">Controle de pagamentos e repasses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showGerarRecibo} onOpenChange={setShowGerarRecibo}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Gerar Recibos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-green-600" />
                  Gerar Novo Recibo
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados para gerar um novo recibo de aluguel
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleGerarRecibo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contrato_id">Contrato *</Label>
                    <Select value={novoRecibo.contrato_id} onValueChange={handleContratoChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        {contratos.map(contrato => (
                          <SelectItem key={contrato.id} value={contrato.id}>
                            {contrato.numero_contrato} - {formatCurrency(contrato.valor_aluguel)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                    <Select value={novoRecibo.forma_pagamento} onValueChange={(value) => setNovoRecibo(prev => ({...prev, forma_pagamento: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                        <SelectItem value="TED">TED/Transferência</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={novoRecibo.valor}
                      onChange={(e) => setNovoRecibo(prev => ({...prev, valor: e.target.value}))}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="referencia_mes">Mês de Referência *</Label>
                    <Input
                      id="referencia_mes"
                      type="month"
                      value={novoRecibo.referencia_mes.slice(0, 7)}
                      onChange={(e) => setNovoRecibo(prev => ({...prev, referencia_mes: e.target.value + '-01'}))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={novoRecibo.data_vencimento}
                      onChange={(e) => setNovoRecibo(prev => ({...prev, data_vencimento: e.target.value}))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={novoRecibo.status} onValueChange={(value) => setNovoRecibo(prev => ({...prev, status: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {novoRecibo.forma_pagamento === 'PIX' && (
                    <div>
                      <Label htmlFor="chave_pix">Chave PIX</Label>
                      <Input
                        id="chave_pix"
                        value={novoRecibo.chave_pix}
                        onChange={(e) => setNovoRecibo(prev => ({...prev, chave_pix: e.target.value}))}
                        placeholder="Chave PIX para pagamento"
                      />
                    </div>
                  )}

                  {novoRecibo.forma_pagamento === 'Boleto' && (
                    <div>
                      <Label htmlFor="codigo_boleto">Código do Boleto</Label>
                      <Input
                        id="codigo_boleto"
                        value={novoRecibo.codigo_boleto}
                        onChange={(e) => setNovoRecibo(prev => ({...prev, codigo_boleto: e.target.value}))}
                        placeholder="Código de barras do boleto"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={novoRecibo.observacoes}
                    onChange={(e) => setNovoRecibo(prev => ({...prev, observacoes: e.target.value}))}
                    placeholder="Observações adicionais sobre o recibo..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowGerarRecibo(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={generating} className="bg-green-600 hover:bg-green-700">
                    <Receipt className="w-4 h-4 mr-2" />
                    {generating ? 'Gerando...' : 'Gerar Recibo'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filtroStatus === "todos" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFiltroStatus("todos")}
            >
              Todos
            </Button>
            <Button 
              variant={filtroStatus === "pendentes" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFiltroStatus("pendentes")}
            >
              Pendentes
            </Button>
            <Button 
              variant={filtroStatus === "atrasados" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFiltroStatus("atrasados")}
            >
              Atrasados
            </Button>
            <Button 
              variant={filtroStatus === "pagos" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFiltroStatus("pagos")}
            >
              Pagos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      {filteredRecibos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filtroStatus === "todos" ? "Nenhum recibo encontrado" : `Nenhum recibo ${filtroStatus.toLowerCase()}`}
            </h3>
            <p className="text-gray-500">
              Os recibos aparecerão aqui conforme forem gerados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecibos.map((recibo) => {
            const contrato = contratos.find(c => c.id === recibo.contrato_id);
            return (
              <Card key={recibo.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Recibo {recibo.numero_recibo}
                        </h3>
                        <Badge className={getStatusColor(recibo.status)}>
                          {recibo.status}
                        </Badge>
                        {contrato && (
                          <Badge variant="outline">
                            Contrato: {contrato.numero_contrato}
                          </Badge>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">Referência</p>
                          <p>{new Date(recibo.referencia_mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Vencimento</p>
                          <p>{new Date(recibo.data_vencimento).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Valor</p>
                          <p className="text-blue-600 font-semibold">{formatCurrency(recibo.valor)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Forma de Pagamento</p>
                          <p>{recibo.forma_pagamento}</p>
                        </div>
                      </div>

                      {(recibo.valor_multa > 0 || recibo.valor_juros > 0) && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 text-red-700 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Valores adicionais por atraso</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-red-600">
                            <div>Multa: {formatCurrency(recibo.valor_multa)}</div>
                            <div>Juros: {formatCurrency(recibo.valor_juros)}</div>
                            <div className="font-semibold">Total: {formatCurrency(recibo.valor_liquido)}</div>
                          </div>
                        </div>
                      )}

                      {recibo.observacoes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Observações: </span>
                          {recibo.observacoes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {recibo.status === 'Pendente' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => confirmarPagamento(recibo.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirmar Pagamento
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => gerarPDF(recibo)}>
                        <FileText className="w-4 h-4 mr-1" />
                        Gerar PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
