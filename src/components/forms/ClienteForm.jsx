import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, UserCheck } from "lucide-react";

const interesseOptions = ["Venda", "Locação", "Ambos"];
const statusOptions = ["Ativo", "Frio", "Proposta", "Finalizado"];
const origemOptions = ["Site", "Indicação", "Facebook", "Instagram", "WhatsApp", "Telefone", "Outros"];

export default function ClienteForm({ cliente, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    telefone: cliente?.telefone || '',
    celular: cliente?.celular || '',
    email: cliente?.email || '',
    interesse: cliente?.interesse || '',
    faixa_preco_min: cliente?.faixa_preco_min || '',
    faixa_preco_max: cliente?.faixa_preco_max || '',
    tipo_imovel: cliente?.tipo_imovel || [],
    bairros_interesse: cliente?.bairros_interesse || [],
    status: cliente?.status || 'Ativo',
    origem: cliente?.origem || '',
    observacoes: cliente?.observacoes || '',
    data_ultimo_contato: cliente?.data_ultimo_contato || ''
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.interesse) newErrors.interesse = 'Interesse é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        faixa_preco_min: parseFloat(formData.faixa_preco_min) || 0,
        faixa_preco_max: parseFloat(formData.faixa_preco_max) || 0
      };
      onSave(processedData);
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          {cliente ? 'Editar Cliente' : 'Novo Cliente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Dados do Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo do cliente"
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
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
                <Label htmlFor="origem">Origem do Contato</Label>
                <Select value={formData.origem} onValueChange={(value) => handleInputChange('origem', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {origemOptions.map(origem => (
                      <SelectItem key={origem} value={origem}>{origem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Interesse */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Interesse e Perfil</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interesse">Tipo de Interesse *</Label>
                <Select value={formData.interesse} onValueChange={(value) => handleInputChange('interesse', value)}>
                  <SelectTrigger className={errors.interesse ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {interesseOptions.map(interesse => (
                      <SelectItem key={interesse} value={interesse}>{interesse}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.interesse && <p className="text-red-500 text-sm mt-1">{errors.interesse}</p>}
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="faixa_preco_min">Faixa de Preço Mínima (R$)</Label>
                <Input
                  id="faixa_preco_min"
                  type="number"
                  min="0"
                  value={formData.faixa_preco_min}
                  onChange={(e) => handleInputChange('faixa_preco_min', e.target.value)}
                  placeholder="100000"
                />
              </div>
              
              <div>
                <Label htmlFor="faixa_preco_max">Faixa de Preço Máxima (R$)</Label>
                <Input
                  id="faixa_preco_max"
                  type="number"
                  min="0"
                  value={formData.faixa_preco_max}
                  onChange={(e) => handleInputChange('faixa_preco_max', e.target.value)}
                  placeholder="500000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="data_ultimo_contato">Data do Último Contato</Label>
              <Input
                id="data_ultimo_contato"
                type="date"
                value={formData.data_ultimo_contato}
                onChange={(e) => handleInputChange('data_ultimo_contato', e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações sobre o cliente, preferências, histórico de atendimento..."
              className="h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {cliente ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}