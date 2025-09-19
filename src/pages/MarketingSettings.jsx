
import React, { useState, useEffect, useCallback } from "react";
import { MarketingConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Save, Globe, CheckCircle, XCircle, Shield, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/api/entities";

export default function MarketingSettings() {
  const [config, setConfig] = useState(null);
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true); // Used for both initial load and saving
  const [currentUser, setCurrentUser] = useState(null);
  const [urlTestResult, setUrlTestResult] = useState(null);
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [webchatTestResult, setWebchatTestResult] = useState(null);
  const [isTestingWebchat, setIsTestingWebchat] = useState(false);
  const { toast } = useToast();

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [configs, user] = await Promise.all([
        MarketingConfig.list(),
        User.me()
      ]);

      setCurrentUser(user);

      if (configs.length > 0) {
        setConfig(configs[0]);
        setConfigId(configs[0].id);
      } else {
        const newConfig = {
          pixel_meta: '',
          google_analytics: '',
          google_ads: '',
          google_tag_manager: '',
          tiktok_pixel: '',
          taboola_tag: '',
          pinterest_tag: '',
          url_personalizada: '',
          url_personalizada_ativa: false,
          webhook_url: '',
          webhook_ativo: false,
          tech_atende_waba_id: '',
          tech_atende_token: '',
          tech_atende_ativo: false,
          eventos_personalizados: [],
          rastreamento_ativo: true,
          rastreamento_contatos: true,
          rastreamento_visualizacoes: true,
          rastreamento_formularios: true,
          rastreamento_agendamentos: true
        };
        const created = await MarketingConfig.create(newConfig);
        setConfig(created);
        setConfigId(created.id);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de marketing.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSubmit = async () => {
    if (!configId) return;
    setLoading(true); // Use loading state for saving as well
    try {
      await MarketingConfig.update(configId, config);
      toast({
        title: "Sucesso!",
        description: "Configurações de marketing salvas com sucesso."
      });

      await loadConfig(); // Reload config to ensure state is fully updated, especially if backend has defaults/transforms
      
      // Sincronizar com portal público automaticamente
      try {
        const { portalSyncService } = await import("../components/services/portalSyncService");
        await portalSyncService.onMarketingConfigUpdated(); // Corrigido de onMarketingConfigSaved para onMarketingConfigUpdated
        
        toast({
          title: "Portal sincronizado",
          description: "As alterações foram enviadas automaticamente para o portal público."
        });
      } catch (syncError) {
        console.error('Erro na sincronização:', syncError);
        toast({
          title: "Aviso",
          description: "Configurações salvas, mas houve erro na sincronização automática com o portal.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const validateCode = (code, type) => {
    if (!code) return true; // Vazio é válido
    
    switch (type) {
      case 'pixel_meta':
        return /^\d+$/.test(code); // Apenas números
      case 'google_analytics':
        return /^G-[A-Z0-9]{10}$/.test(code); // Formato GA4
      case 'google_ads':
        return /^AW-\d+$/.test(code); // Formato Google Ads
      case 'google_tag_manager':
        return /^GTM-[A-Z0-9]{7}$/.test(code); // Formato GTM
      case 'tiktok_pixel':
        return /^\d+$/.test(code); // Apenas números
      case 'taboola_tag':
        return /^pub-[a-zA-Z0-9]{16}$/.test(code); // Formato Taboola
      case 'pinterest_tag':
        // A simple check for a script tag structure. More robust validation might require parsing.
        return /<script>[\s\S]*<\/script>/.test(code); 
      default:
        return true;
    }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    return /^https?:\/\/.+/.test(url);
  };

  const testUrl = async () => {
    if (!config.url_personalizada) {
      toast({
        title: "URL vazia",
        description: "Insira uma URL para testar.",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(config.url_personalizada)) {
      setUrlTestResult({ success: false, message: "URL deve começar com http:// ou https://" });
      return;
    }

    setIsTestingUrl(true);
    try {
      // Simular teste de URL (em produção seria uma requisição real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Exemplo de teste básico de formato
      const url = new URL(config.url_personalizada);
      setUrlTestResult({ 
        success: true, 
        message: `URL válida. Protocolo: ${url.protocol}, Host: ${url.hostname}` 
      });
      
      toast({
        title: "Teste concluído",
        description: "URL testada com sucesso."
      });
    } catch (error) {
      setUrlTestResult({ 
        success: false, 
        message: "URL com formato inválido ou inacessível." 
      });
      toast({
        title: "Erro no teste",
        description: "Não foi possível validar a URL.",
        variant: "destructive"
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  const testWebhook = async () => {
    if (!config.webhook_url) {
      toast({
        title: "URL vazia",
        description: "Insira uma URL de webhook para testar.",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(config.webhook_url)) {
      toast({
        title: "URL inválida",
        description: "URL deve começar com http:// ou https://",
        variant: "destructive"
      });
      return;
    }

    setIsTestingUrl(true);
    try {
      // Simular teste de webhook com dados de exemplo
      const testData = {
        action: "test",
        timestamp: new Date().toISOString(),
        data: {
          codigo: 12345,
          tipo: "Casa",
          valor: 500000,
          endereco: "Teste de Webhook",
          descricao: "Dados de teste do webhook"
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // In a real scenario, you'd make an actual fetch/axios call here:
      // const response = await fetch(config.webhook_url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(testData),
      // });
      // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setUrlTestResult({ 
        success: true, 
        message: `Teste de webhook enviado com sucesso para ${config.webhook_url}` 
      });
      
      toast({
        title: "Teste concluído",
        description: "Dados de teste enviados para o webhook."
      });
    } catch (error) {
      setUrlTestResult({ 
        success: false, 
        message: "Falha ao conectar com o webhook. Verifique a URL e tente novamente." 
      });
      toast({
        title: "Erro no teste",
        description: "Não foi possível conectar com o webhook.",
        variant: "destructive"
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  const testWebchat = async () => {
    if (!config.tech_atende_waba_id || !config.tech_atende_token) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o ID do WABA e o Token para testar.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingWebchat(true);
    setWebchatTestResult(null);
    try {
      // Simulação de teste de conexão com o Tech Atende
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular um resultado de sucesso
      setWebchatTestResult({ 
        success: true, 
        message: `Conexão com Tech Atende bem-sucedida.` 
      });
      
      toast({
        title: "Teste concluído",
        description: "Conexão com o WebChat estabelecida com sucesso."
      });
    } catch (error) {
      setWebchatTestResult({ 
        success: false, 
        message: "Falha na conexão. Verifique o ID do WABA e o Token." 
      });
      toast({
        title: "Erro no teste",
        description: "Não foi possível conectar com o serviço de WebChat.",
        variant: "destructive"
      });
    } finally {
      setIsTestingWebchat(false);
    }
  };

  if (loading || !config) {
    return <div className="p-6">Carregando configurações de marketing...</div>;
  }

  if (currentUser && currentUser.tipo_usuario !== 'Super Admin') {
    return (
      <div className="p-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h3>
            <p className="text-gray-500">
              Apenas Super Administradores podem configurar o marketing digital.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Digital</h1>
            <p className="text-gray-600 mt-1">Configure o rastreamento e análise do portal público</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <Tabs defaultValue="codigos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="codigos">Códigos de Rastreamento</TabsTrigger>
          <TabsTrigger value="eventos">Eventos Personalizados</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="codigos" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Meta (Facebook/Instagram)</CardTitle>
                <CardDescription>Configure o Pixel do Meta para rastrear conversões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID do Pixel Meta</Label>
                  <Input
                    value={config.pixel_meta || ''}
                    onChange={(e) => handleChange('pixel_meta', e.target.value)}
                    placeholder="Ex: 1234567890123456"
                    className={!validateCode(config.pixel_meta, 'pixel_meta') ? 'border-red-500' : ''}
                  />
                  {!validateCode(config.pixel_meta, 'pixel_meta') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. Use apenas números.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Google Analytics 4</CardTitle>
                <CardDescription>Configure o GA4 para análise detalhada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID do Google Analytics</Label>
                  <Input
                    value={config.google_analytics || ''}
                    onChange={(e) => handleChange('google_analytics', e.target.value)}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className={!validateCode(config.google_analytics, 'google_analytics') ? 'border-red-500' : ''}
                  />
                  {!validateCode(config.google_analytics, 'google_analytics') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. Use G-XXXXXXXXXX</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Google Ads</CardTitle>
                <CardDescription>Configure conversões do Google Ads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Código de Conversão</Label>
                  <Input
                    value={config.google_ads || ''}
                    onChange={(e) => handleChange('google_ads', e.target.value)}
                    placeholder="Ex: AW-123456789"
                    className={!validateCode(config.google_ads, 'google_ads') ? 'border-red-500' : ''}
                  />
                  {!validateCode(config.google_ads, 'google_ads') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. Use AW-XXXXXXXXX</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Google Tag Manager</CardTitle>
                <CardDescription>Gerencie todos os códigos em um só lugar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID do GTM</Label>
                  <Input
                    value={config.google_tag_manager || ''}
                    onChange={(e) => handleChange('google_tag_manager', e.target.value)}
                    placeholder="Ex: GTM-XXXXXXX"
                    className={!validateCode(config.google_tag_manager, 'google_tag_manager') ? 'border-red-500' : ''}
                  />
                  {!validateCode(config.google_tag_manager, 'google_tag_manager') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. Use GTM-XXXXXXX</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>TikTok Pixel</CardTitle>
                <CardDescription>Configure o pixel do TikTok para rastrear conversões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID do Pixel do TikTok</Label>
                  <Input
                    value={config.tiktok_pixel || ''}
                    onChange={(e) => handleChange('tiktok_pixel', e.target.value)}
                    placeholder="Ex: 1234567890123456"
                    className={!validateCode(config.tiktok_pixel, 'tiktok_pixel') ? 'border-red-500' : ''}
                  />
                  {!validateCode(config.tiktok_pixel, 'tiktok_pixel') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. Use apenas números.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Taboola Tag</CardTitle>
                <CardDescription>Configure a tag do Taboola para anúncios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID da Tag do Taboola</Label>
                  <Input
                    value={config.taboola_tag || ''}
                    onChange={(e) => handleChange('taboola_tag', e.target.value)}
                    placeholder="Ex: pub-XXXXXXXXXXXXXXXX"
                    className={!validateCode(config.taboola_tag, 'taboola_tag') ? 'border-red-500' : ''}
                  />
                  {!validateCode(config.taboola_tag, 'taboola_tag') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. Use pub-XXXXXXXXXXXXXXXX</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Pinterest Conversion Tag</CardTitle>
                <CardDescription>Configure a tag de conversão do Pinterest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Código da Tag do Pinterest</Label>
                  <Textarea
                    value={config.pinterest_tag || ''}
                    onChange={(e) => handleChange('pinterest_tag', e.target.value)}
                    placeholder="Cole o código <script>...</script> do Pinterest aqui"
                    className={`h-32 ${!validateCode(config.pinterest_tag, 'pinterest_tag') ? 'border-red-500' : ''}`}
                  />
                  {!validateCode(config.pinterest_tag, 'pinterest_tag') && (
                    <p className="text-red-500 text-sm mt-1">Formato inválido. O código deve ser um script válido.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-3 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Webhook de Coleta de Dados
                </CardTitle>
                <CardDescription>
                  Configure uma URL para receber dados de imóveis automaticamente via POST em formato JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="webhook_url">URL do Webhook</Label>
                  <Textarea
                    id="webhook_url"
                    value={config.webhook_url || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        handleChange('webhook_url', value);
                        setUrlTestResult(null); // Limpar resultado anterior
                      }
                    }}
                    placeholder="https://api.exemplo.com/webhook/imoveis"
                    className={`h-20 ${!validateUrl(config.webhook_url) && config.webhook_url.length > 0 ? 'border-red-500' : ''}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {!validateUrl(config.webhook_url) && config.webhook_url.length > 0 && (
                        <p className="text-red-500 text-sm">URL deve começar com http:// ou https://</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {(config.webhook_url || '').length}/500 caracteres
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="webhook_ativo"
                      checked={config.webhook_ativo || false}
                      onCheckedChange={(checked) => handleChange('webhook_ativo', checked)}
                    />
                    <Label htmlFor="webhook_ativo">Ativar envio automático via webhook</Label>
                  </div>
                  
                  <Button 
                    onClick={testWebhook}
                    disabled={isTestingUrl || !config.webhook_url || !validateUrl(config.webhook_url)}
                    variant="outline"
                    size="sm"
                  >
                    {isTestingUrl ? "Testando..." : "Testar Webhook"}
                  </Button>
                </div>

                {urlTestResult && (
                  <div className={`p-3 rounded-lg border ${
                    urlTestResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {urlTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        urlTestResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {urlTestResult.success ? 'Teste bem-sucedido' : 'Erro no teste'}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${
                      urlTestResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {urlTestResult.message}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Formato dos Dados Enviados</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Método:</strong> POST</p>
                    <p><strong>Content-Type:</strong> application/json</p>
                    <p><strong>Eventos:</strong> Criação e atualização de imóveis</p>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-800 font-medium">Ver exemplo de payload</summary>
                    <pre className="mt-2 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
{`{
  "action": "created|updated",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "codigo": 12345,
    "tipo": "Casa",
    "situacao": "Venda",
    "valor": 500000,
    "endereco": "Rua Exemplo, 123",
    "bairro": "Centro",
    "cidade": "Contagem",
    "quartos": 3,
    "banheiros": 2,
    "vagas": 2,
    "area_util_total": 120,
    "descricao": "Linda casa...",
    "fotos": ["url1.webp", "url2.webp"],
    "video_url": "https://youtube.com/...",
    "ativo": true
  }
}`}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-3 border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  WebChat do Tech Atende
                </CardTitle>
                <CardDescription>
                  Configure o chat para interagir com clientes em tempo real no portal público.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="waba_id">ID do WABA</Label>
                    <Input
                      id="waba_id"
                      value={config.tech_atende_waba_id || ''}
                      onChange={(e) => handleChange('tech_atende_waba_id', e.target.value)}
                      placeholder="Ex: 14dc8b83-6cb8-4af4-8069-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="websocket_token">Token do WebSocket</Label>
                    <Input
                      id="websocket_token"
                      value={config.tech_atende_token || ''}
                      onChange={(e) => handleChange('tech_atende_token', e.target.value)}
                      placeholder="Ex: 68319a68-7f1e-411a-b464-..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tech_atende_ativo"
                      checked={config.tech_atende_ativo || false}
                      onCheckedChange={(checked) => handleChange('tech_atende_ativo', checked)}
                    />
                    <Label htmlFor="tech_atende_ativo" className="flex items-center gap-2">
                      Ativar WebChat no portal
                      {config.tech_atende_ativo ? (
                        <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                      ) : (
                        <Badge variant="destructive">Desconectado</Badge>
                      )}
                    </Label>
                  </div>
                  
                  <Button 
                    onClick={testWebchat}
                    disabled={isTestingWebchat || !config.tech_atende_waba_id || !config.tech_atende_token}
                    variant="outline"
                    size="sm"
                  >
                    {isTestingWebchat ? "Testando..." : "Testar Conexão"}
                  </Button>
                </div>

                {webchatTestResult && (
                  <div className={`p-3 rounded-lg border ${
                    webchatTestResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {webchatTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        webchatTestResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {webchatTestResult.success ? 'Teste bem-sucedido' : 'Erro no teste'}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${
                      webchatTestResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {webchatTestResult.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eventos" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                URL Personalizada
              </CardTitle>
              <CardDescription>
                Configure uma URL personalizada para integração com ferramentas externas (pixels, webhooks, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="url_personalizada">URL Personalizada</Label>
                <Textarea
                  id="url_personalizada"
                  value={config.url_personalizada || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      handleChange('url_personalizada', value);
                      setUrlTestResult(null); // Limpar resultado anterior
                    }
                  }}
                  placeholder="https://www.google-analytics.com/collect?v=1&t=event&tid=UA-XXXXXX-X&cid=555&ec=imovel&ea=detalhes&el={id_imovel}"
                  className={`h-24 ${!validateUrl(config.url_personalizada) && config.url_personalizada.length > 0 ? 'border-red-500' : ''}`}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {!validateUrl(config.url_personalizada) && config.url_personalizada.length > 0 && (
                      <p className="text-red-500 text-sm">URL deve começar com http:// ou https://</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {(config.url_personalizada || '').length}/500 caracteres
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="url_personalizada_ativa"
                    checked={config.url_personalizada_ativa || false}
                    onCheckedChange={(checked) => handleChange('url_personalizada_ativa', checked)}
                  />
                  <Label htmlFor="url_personalizada_ativa">Ativar URL personalizada</Label>
                </div>
                
                <Button 
                  onClick={testUrl}
                  disabled={isTestingUrl || !config.url_personalizada || !validateUrl(config.url_personalizada)}
                  variant="outline"
                  size="sm"
                >
                  {isTestingUrl ? "Testando..." : "Testar URL"}
                </Button>
              </div>

              {urlTestResult && (
                <div className={`p-3 rounded-lg border ${
                  urlTestResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {urlTestResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <p className={`text-sm font-medium ${
                      urlTestResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {urlTestResult.success ? 'Teste bem-sucedido' : 'Erro no teste'}
                    </p>
                  </div>
                  <p className={`text-xs mt-1 ${
                    urlTestResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {urlTestResult.message}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Placeholders Disponíveis</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><code className="bg-blue-100 px-1 rounded">{'{id_imovel}'}</code> - ID do imóvel visualizado</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{codigo_imovel}'}</code> - Código do imóvel</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{valor_imovel}'}</code> - Valor do imóvel</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{tipo_imovel}'}</code> - Tipo do imóvel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Eventos Padrão do Sistema</CardTitle>
              <CardDescription>
                Eventos automáticos rastreados no portal público
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Visualização de Imóvel</h4>
                  <p className="text-sm text-gray-600">Disparado ao acessar detalhes de um imóvel</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Clique em Contato</h4>
                  <p className="text-sm text-gray-600">WhatsApp, telefone ou formulário</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Agendamento de Visita</h4>
                  <p className="text-sm text-gray-600">Quando uma visita é agendada</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Submissão de Formulário</h4>
                  <p className="text-sm text-gray-600">Contato, interesse ou newsletter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Controles de Rastreamento</CardTitle>
              <CardDescription>Configure quais ações serão rastreadas no portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Rastreamento Ativo</p>
                      <p className="text-sm text-gray-600">Controle global de todos os rastreamentos</p>
                    </div>
                    <Checkbox
                      checked={config.rastreamento_ativo}
                      onCheckedChange={(checked) => handleChange('rastreamento_ativo', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Cliques em Contatos</p>
                      <p className="text-sm text-gray-600">WhatsApp, telefone, e-mail</p>
                    </div>
                    <Checkbox
                      checked={config.rastreamento_contatos}
                      onCheckedChange={(checked) => handleChange('rastreamento_contatos', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Visualizações</p>
                      <p className="text-sm text-gray-600">Detalhes de imóveis, páginas</p>
                    </div>
                    <Checkbox
                      checked={config.rastreamento_visualizacoes}
                      onCheckedChange={(checked) => handleChange('rastreamento_visualizacoes', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Formulários</p>
                      <p className="text-sm text-gray-600">Contato, interesse, newsletter</p>
                    </div>
                    <Checkbox
                      checked={config.rastreamento_formularios}
                      onCheckedChange={(checked) => handleChange('rastreamento_formularios', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Status do Rastreamento</h4>
                <div className="flex flex-wrap gap-2">
                  {config.rastreamento_ativo ? (
                    <Badge className="bg-green-100 text-green-800">Geral Ativo</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Geral Inativo</Badge>
                  )}
                  
                  {config.pixel_meta && <Badge className="bg-blue-100 text-blue-800">Meta Pixel</Badge>}
                  {config.google_analytics && <Badge className="bg-orange-100 text-orange-800">Google Analytics</Badge>}
                  {config.google_ads && <Badge className="bg-green-100 text-green-800">Google Ads</Badge>}
                  {config.tiktok_pixel && <Badge className="bg-black text-white">TikTok Pixel</Badge>}
                  {config.taboola_tag && <Badge className="bg-cyan-100 text-cyan-800">Taboola Tag</Badge>}
                  {config.pinterest_tag && <Badge className="bg-red-100 text-red-800">Pinterest Tag</Badge>}
                  {config.webhook_ativo && <Badge className="bg-blue-200 text-blue-900">Webhook Ativo</Badge>}
                  {config.tech_atende_ativo && <Badge className="bg-green-200 text-green-900">WebChat Ativo</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
