import React, { useState, useEffect, useCallback } from "react";
import { ThemeConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Palette, Save, Sun, Moon, Monitor } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ThemeSettings() {
  const [config, setConfig] = useState({ 
    tema_padrao: 'Automático', 
    permitir_alternancia: true 
  });
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState(null);
  const { toast } = useToast();

  const loadConfig = useCallback(async () => {
    try {
      const configs = await ThemeConfig.list();
      if (configs.length > 0) {
        setConfig(configs[0]);
        setConfigId(configs[0].id);
      } else {
        // Criar configuração padrão
        const newConfig = await ThemeConfig.create({
          tema_padrao: 'Automático',
          permitir_alternancia: true
        });
        setConfig(newConfig);
        setConfigId(newConfig.id);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração de tema:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de tema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    if (!configId) {
      toast({
        title: "Erro",
        description: "ID de configuração não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await ThemeConfig.update(configId, config);
      toast({
        title: "Sucesso!",
        description: "Configurações de tema salvas com sucesso. Recarregue a página para aplicar as alterações.",
      });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Ocorreu um erro ao tentar salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading && !configId) {
    return <div className="p-6">Carregando configurações...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Palette className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações de Tema</h1>
          <p className="text-gray-600 mt-1">
            Gerencie a aparência do sistema para todos os usuários.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configurações */}
        <Card className="card-custom border shadow-sm">
          <CardHeader>
            <CardTitle>Configurações de Tema</CardTitle>
            <CardDescription>
              Defina como o tema será aplicado no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tema-padrao" className="text-base font-semibold">Tema Padrão do Sistema</Label>
              <Select value={config.tema_padrao} onValueChange={(value) => handleChange('tema_padrao', value)}>
                <SelectTrigger id="tema-padrao">
                  <SelectValue placeholder="Selecione o tema padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Claro">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span>Sempre Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Escuro">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span>Sempre Escuro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Automático">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>Automático (segue o sistema)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {config.tema_padrao === 'Automático' 
                  ? 'O tema seguirá a preferência do sistema operacional do usuário.'
                  : `O sistema sempre será exibido no modo ${config.tema_padrao.toLowerCase()}.`
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="permitir-alternancia" className="text-base font-semibold">Permitir Alternância Manual</Label>
                  <p className="text-sm text-gray-500">
                    Usuários poderão trocar entre modo claro e escuro manualmente.
                  </p>
                </div>
                <Switch
                  id="permitir-alternancia"
                  checked={config.permitir_alternancia}
                  onCheckedChange={(checked) => handleChange('permitir_alternancia', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="card-custom border shadow-sm">
          <CardHeader>
            <CardTitle>Visualização dos Temas</CardTitle>
            <CardDescription>
              Veja como ficará a aparência do sistema nos diferentes modos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Modo Claro</Label>
              <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                  <div>
                    <div className="h-3 bg-gray-900 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-gray-500 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-300 rounded w-full"></div>
                  <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Modo Escuro</Label>
              <div className="p-4 rounded-lg bg-gray-900 border border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                  <div>
                    <div className="h-3 bg-gray-100 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-gray-400 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-600 rounded w-full"></div>
                  <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Dica:</strong> As alterações serão aplicadas após recarregar a página. 
                Os usuários verão o botão de alternância apenas se permitido.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}