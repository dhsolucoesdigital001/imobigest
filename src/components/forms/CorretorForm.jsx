import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, User } from "lucide-react";

export default function CorretorForm({ corretor, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: corretor?.nome || '',
    creci: corretor?.creci || '',
    telefone: corretor?.telefone || '',
    celular: corretor?.celular || '',
    email: corretor?.email || '',
    cpf: corretor?.cpf || '',
    endereco: corretor?.endereco || '',
    percentual_comissao: corretor?.percentual_comissao || '',
    meta_mensal: corretor?.meta_mensal || '',
    data_admissao: corretor?.data_admissao || '',
    observacoes: corretor?.observacoes || '',
    ativo: corretor?.ativo !== false
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
    if (!formData.creci.trim()) newErrors.creci = 'CRECI é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        percentual_comissao: parseFloat(formData.percentual_comissao) || 0,
        meta_mensal: parseFloat(formData.meta_mensal) || 0
      };
      onSave(processedData);
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          {corretor ? 'Editar Corretor' : 'Novo Corretor'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Dados Profissionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo do corretor"
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>
              
              <div>
                <Label htmlFor="creci">CRECI *</Label>
                <Input
                  id="creci"
                  value={formData.creci}
                  onChange={(e) => handleInputChange('creci', e.target.value)}
                  placeholder="Ex: 12345"
                  className={errors.creci ? 'border-red-500' : ''}
                />
                {errors.creci && <p className="text-red-500 text-sm mt-1">{errors.creci}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <Label htmlFor="data_admissao">Data de Admissão</Label>
                <Input
                  id="data_admissao"
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => handleInputChange('data_admissao', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Contato</h3>
            
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
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
          </div>

          {/* Informações Comerciais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Comerciais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="percentual_comissao">Percentual de Comissão (%)</Label>
                <Input
                  id="percentual_comissao"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentual_comissao}
                  onChange={(e) => handleInputChange('percentual_comissao', e.target.value)}
                  placeholder="6.0"
                />
              </div>
              
              <div>
                <Label htmlFor="meta_mensal">Meta Mensal (R$)</Label>
                <Input
                  id="meta_mensal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.meta_mensal}
                  onChange={(e) => handleInputChange('meta_mensal', e.target.value)}
                  placeholder="50000"
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
              placeholder="Observações sobre o corretor, especialidades, histórico..."
              className="h-24"
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => handleInputChange('ativo', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="ativo">Corretor Ativo</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {corretor ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}