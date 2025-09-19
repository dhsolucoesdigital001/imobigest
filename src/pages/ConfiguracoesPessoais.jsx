
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Clock, 
  Shield, 
  Bell, 
  Save,
  User as UserIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const diasSemana = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
];

const horariosDisponiveis = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

export default function ConfiguracoesPessoais() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    horario_inicio: '',
    horario_fim: '',
    dias_acesso: [],
    comissao_padrao: 0,
    meta_mensal: 0
  });
  const { toast } = useToast();

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setFormData({
        horario_inicio: user.horario_inicio || '',
        horario_fim: user.horario_fim || '',
        dias_acesso: user.dias_acesso || [],
        comissao_padrao: user.comissao_padrao || 0,
        meta_mensal: user.meta_mensal || 0
      });
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // `toast` is a stable object provided by `useToast`, but it's good practice to include it if used inside a useCallback.

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]); // `loadCurrentUser` is now wrapped in useCallback, so it's a stable dependency.

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData(formData);
      // Reload current user data to reflect potential backend updates
      await loadCurrentUser(); 
      toast({
        title: "Sucesso!",
        description: "Suas configurações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      dias_acesso: prev.dias_acesso.includes(day)
        ? prev.dias_acesso.filter(d => d !== day)
        : [...prev.dias_acesso, day]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const canEditSchedule = currentUser && ['Corretor', 'Assistente'].includes(currentUser.tipo_usuario);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações Pessoais</h1>
          <p className="text-gray-600 mt-1">
            Personalize suas preferências e horários de trabalho
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Horários de Acesso */}
        {canEditSchedule && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Horários de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horário de Início</Label>
                  <Select 
                    value={formData.horario_inicio} 
                    onValueChange={(value) => setFormData(prev => ({...prev, horario_inicio: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horariosDisponiveis.map(horario => (
                        <SelectItem key={horario} value={horario}>{horario}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Horário de Término</Label>
                  <Select 
                    value={formData.horario_fim} 
                    onValueChange={(value) => setFormData(prev => ({...prev, horario_fim: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horariosDisponiveis.map(horario => (
                        <SelectItem key={horario} value={horario}>{horario}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold">Dias de Trabalho</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Selecione os dias da semana em que você trabalha
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {diasSemana.map(dia => (
                    <div key={dia} className="flex items-center space-x-2">
                      <Checkbox
                        id={dia}
                        checked={formData.dias_acesso.includes(dia)}
                        onCheckedChange={() => handleDayToggle(dia)}
                      />
                      <Label htmlFor={dia} className="cursor-pointer">{dia}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configurações Profissionais */}
        {currentUser && ['Corretor'].includes(currentUser.tipo_usuario) && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-green-600" />
                Configurações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Comissão Padrão (%)</Label>
                <Select 
                  value={formData.comissao_padrao?.toString() || ''} 
                  onValueChange={(value) => setFormData(prev => ({...prev, comissao_padrao: parseFloat(value)}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a comissão" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(percentage => (
                      <SelectItem key={percentage} value={percentage.toString()}>{percentage}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Meta Mensal (Vendas)</Label>
                <Select 
                  value={formData.meta_mensal?.toString() || ''} 
                  onValueChange={(value) => setFormData(prev => ({...prev, meta_mensal: parseInt(value)}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua meta" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 10, 15, 20].map(meta => (
                      <SelectItem key={meta} value={meta.toString()}>{meta} vendas/mês</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações da Conta */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo de Usuário:</span>
                <span className="font-medium">{currentUser?.tipo_usuario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="font-medium text-green-600">
                  {currentUser?.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cadastrado em:</span>
                <span className="font-medium">
                  {currentUser?.created_date ? new Date(currentUser.created_date).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Algumas configurações podem ser restritas pelo seu tipo de usuário. 
                Entre em contato com o administrador para mais informações.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
