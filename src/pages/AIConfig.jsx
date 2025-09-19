
import React, { useState, useEffect } from "react";
import { AIConfig as AIConfigEntity } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Brain, Save, Sparkles, Shield, AlertTriangle, CheckCircle, Settings, Loader2, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "../components/services/aiService";
import { geminiService } from "../components/services/geminiService";

export default function AIConfig() {
  const [config, setConfig] = useState({
    provider: 'both',
    gemini_api_key: '',
    gemini_enabled: true,
    fallback_to_base44: true,
    daily_request_limit: 1000,
    auto_diagnostics_enabled: true,
    diagnostics_frequency: 'semanal',
    agent_execution_mode: 'gemini_first'
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [aiStats, setAiStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [user, stats] = await Promise.all([
        User.me(),
        aiService.getProviderStats()
      ]);
      
      setCurrentUser(user);
      setAiStats(stats);
      
      // Update config state if stats.config exists, this ensures the form reflects current settings
      if (stats.config) {
        setConfig(prevConfig => ({ ...prevConfig, ...stats.config }));
      }
      
      // Load AIConfigEntity, which might override or add to stats.config
      const configs = await AIConfigEntity.list();
      if (configs.length > 0) {
        setConfig(prevConfig => ({ ...prevConfig, ...configs[0] }));
        // Configurar a chave no geminiService se existir
        if (configs[0].gemini_api_key) {
          geminiService.setApiKey(configs[0].gemini_api_key);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Configurar a nova chave no geminiService antes de salvar
      if (config.gemini_api_key) {
        geminiService.setApiKey(config.gemini_api_key);
      }
      
      await aiService.updateConfig(config);
      await loadData(); // Recarregar stats para refletir as mudanças
      
      toast({
        title: "✅ Configurações Salvas",
        description: "Configurações de IA atualizadas com Google Gemini."
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testGeminiConnection = async () => {
    setTesting(true);
    try {
      // Configurar a chave temporariamente para teste
      if (config.gemini_api_key) {
        geminiService.setApiKey(config.gemini_api_key);
      }

      // Teste mais simples com Gemini
      const testResult = await aiService.executeWithFallback(
        async () => {
          const testPrompt = "Responda apenas com: 'OK'";
          return await geminiService.generateContent(testPrompt, { maxTokens: 10 });
        },
        async () => {
          return "Base44 funcionando como fallback!";
        }
      );

      toast({
        title: "✅ Teste Realizado",
        description: `Resultado: ${testResult.substring(0, 100)}...`
      });
    } catch (error) {
      toast({
        title: "⚠️ Fallback Ativado", 
        description: `Gemini: ${error.message.substring(0, 50)}... Base44 será usado.`,
        variant: "default" // Não mais "destructive" pois é esperado
      });
    } finally {
      setTesting(false);
    }
  };

  const resetGeminiQuota = async () => {
    await aiService.resetGeminiQuota();
    loadData();
    toast({
      title: "Quota Resetada",
      description: "Status da quota do Gemini foi resetado para testes"
    });
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("AIzaSyDVufc4bTv5WzVekMcuH4iQ9kkHJSnYENg");
    toast({
      title: "Chave Copiada",
      description: "API Key do Gemini copiada para a área de transferência"
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (currentUser?.tipo_usuario !== "Super Admin") {
    return (
      <div className="p-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h3>
            <p className="text-gray-500 mb-6">
              Apenas Super Administradores podem configurar integrações de IA.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuração de IA</h1>
            <p className="text-gray-600 mt-1">
              Google Gemini 1.5 Flash com fallback inteligente para Base44
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={resetGeminiQuota} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Quota
          </Button>
          <Button onClick={testGeminiConnection} disabled={testing} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            {testing ? "Testando..." : "Testar Sistema"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {aiStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Google Gemini 1.5 Flash</p>
                  <div className="flex items-center gap-2 mt-1">
                    {aiStats.available_providers.gemini && !aiStats.gemini.isQuotaExceeded ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-medium">
                      {aiStats.available_providers.gemini && !aiStats.gemini.isQuotaExceeded ? 
                        'Disponível' : 
                        aiStats.gemini.isQuotaExceeded ? 'Quota Excedida' : 'Indisponível'
                      }
                    </span>
                  </div>
                </div>
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Base44 AI (Fallback)</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Sempre Disponível</span>
                  </div>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Requisições Hoje</p>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {aiStats.gemini.requestCount} / {aiStats.gemini.dailyLimit}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  aiStats.gemini.quotaPercentage > 80 ? 'bg-red-100' : 
                  aiStats.gemini.quotaPercentage > 60 ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <span className={`text-sm font-bold ${
                    aiStats.gemini.quotaPercentage > 80 ? 'text-red-600' : 
                    aiStats.gemini.quotaPercentage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {aiStats.gemini.quotaPercentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuração Gemini */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Google Gemini 1.5 Pro
            </CardTitle>
            <CardDescription>
              Configure a integração com o modelo mais avançado da Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span><strong>API Key fornecida:</strong> AIzaSyDVufc4bTv5WzVekMcuH4iQ9kkHJSnYENg</span>
                  <Button variant="ghost" size="sm" onClick={copyApiKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="gemini_api_key">API Key do Gemini</Label>
              <Input
                id="gemini_api_key"
                type="password"
                value={config.gemini_api_key}
                onChange={(e) => setConfig({ ...config, gemini_api_key: e.target.value })}
                placeholder="Cole a API Key aqui..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenha sua chave em: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="gemini_enabled"
                checked={config.gemini_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, gemini_enabled: checked })}
              />
              <Label htmlFor="gemini_enabled">Habilitar Google Gemini 1.5 Pro</Label>
            </div>

            <div>
              <Label htmlFor="daily_limit">Limite Diário de Requisições</Label>
              <Input
                id="daily_limit"
                type="number"
                value={config.daily_request_limit}
                onChange={(e) => setConfig({ ...config, daily_request_limit: parseInt(e.target.value) })}
                min="100"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Controle o uso da API para evitar exceder quotas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Execução */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Configuração de Execução</CardTitle>
            <CardDescription>
              Define como os agentes executam tarefas com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="execution_mode">Modo de Execução dos Agentes</Label>
              <Select 
                value={config.agent_execution_mode} 
                onValueChange={(value) => setConfig({ ...config, agent_execution_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini_first">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Gemini Primeiro (recomendado)
                    </div>
                  </SelectItem>
                  <SelectItem value="base44_first">Base44 Primeiro</SelectItem>
                  <SelectItem value="gemini_only">Apenas Gemini</SelectItem>
                  <SelectItem value="base44_only">Apenas Base44</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fallback_enabled"
                checked={config.fallback_to_base44}
                onCheckedChange={(checked) => setConfig({ ...config, fallback_to_base44: checked })}
              />
              <Label htmlFor="fallback_enabled">Usar Base44 como fallback</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto_diagnostics"
                checked={config.auto_diagnostics_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, auto_diagnostics_enabled: checked })}
              />
              <Label htmlFor="auto_diagnostics">Diagnósticos Automáticos com IA</Label>
            </div>

            <div>
              <Label htmlFor="diagnostics_frequency">Frequência dos Diagnósticos</Label>
              <Select 
                value={config.diagnostics_frequency} 
                onValueChange={(value) => setConfig({ ...config, diagnostics_frequency: value })}
                disabled={!config.auto_diagnostics_enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações e Alertas */}
      <div className="space-y-4">
        {aiStats?.gemini.isQuotaExceeded && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <strong>Quota do Google Gemini Excedida:</strong> O sistema está usando Base44 como alternativa.
              {aiStats.gemini.quotaResetTime && (
                <span> Quota será resetada automaticamente em: {new Date(aiStats.gemini.quotaResetTime).toLocaleTimeString()}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Sistema Híbrido Ativo:</strong> Gemini 1.5 Flash otimizado para economia + Base44 como fallback garantem 
            que seus agentes sempre funcionem, mesmo com limites de quota.
          </AlertDescription>
        </Alert>

        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Fallback Inteligente Configurado:</strong> Se o Gemini atingir limites, o sistema automaticamente 
            usa Base44 para manter todos os serviços funcionando sem interrupção.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
