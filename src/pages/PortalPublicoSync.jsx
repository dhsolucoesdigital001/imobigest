import React, { useState, useEffect, useCallback } from "react";
import { PortalSyncConfig, PortalSyncLog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Save, TestTube2, AlertTriangle, List, CheckCircle, XCircle } from "lucide-react";
import { portalSyncService } from "../components/services/portalSyncService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PortalPublicoSync() {
  const [config, setConfig] = useState({
    portal_url: '',
    api_key: '',
    url_de_teste: false,
    sync_automatico: true,
    webhook_ativo: false,
    webhook_url: '',
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [configs, syncLogs] = await Promise.all([
        PortalSyncConfig.list(),
        PortalSyncLog.list('-timestamp', 10)
      ]);
      if (configs.length > 0) {
        setConfig(configs[0]);
      }
      setLogs(syncLogs);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config.id) {
        await PortalSyncConfig.update(config.id, config);
      } else {
        await PortalSyncConfig.create(config);
      }
      toast({ title: "Configurações salvas!", description: "As configurações de sincronização foram atualizadas." });
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSync = async () => {
    setTesting(true);
    try {
      const { success, responseTime } = await portalSyncService.syncWithPortal('Teste Manual');
      if (success) {
        toast({
          title: "Teste bem-sucedido!",
          description: `Sincronização de teste concluída em ${responseTime}ms.`
        });
      }
      await loadData(); // Recarrega os logs
    } catch (error) {
      console.error("Erro no teste de sincronização:", error);
      toast({
        title: "Falha no Teste",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <RefreshCw className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sincronização com Portal Público</h1>
          <p className="text-gray-600 mt-1">Configure e monitore a integração em tempo real com seu site.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>Defina o endpoint do seu portal e a chave de API para a comunicação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="portal_url">URL do Portal Público</Label>
                <Input
                  id="portal_url"
                  value={config.portal_url || ''}
                  onChange={(e) => handleChange('portal_url', e.target.value)}
                  placeholder="https://seuportalimobiliario.com"
                />
              </div>
              <div>
                <Label htmlFor="api_key">Chave de API (API Key)</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={config.api_key || ''}
                  onChange={(e) => handleChange('api_key', e.target.value)}
                  placeholder="Cole aqui a chave de API fornecida pelo seu portal"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="url_de_teste"
                  checked={config.url_de_teste || false}
                  onCheckedChange={(checked) => handleChange('url_de_teste', checked)}
                />
                <Label htmlFor="url_de_teste" className="font-normal">
                  Marcar como URL de teste (para desenvolvimento/homologação)
                </Label>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="sync_automatico" className="font-medium">Sincronização Automática</Label>
                  <p className="text-sm text-gray-500">
                    {config.sync_automatico ? "Ativada" : "Desativada"}: envia dados ao salvar no sistema.
                  </p>
                </div>
                <Switch
                  id="sync_automatico"
                  checked={config.sync_automatico}
                  onCheckedChange={(checked) => handleChange('sync_automatico', checked)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button onClick={handleTestSync} variant="outline" disabled={testing || saving}>
                  {testing ? <TestTube2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube2 className="w-4 h-4 mr-2" />}
                  Testar Sincronização
                </Button>
                <Button onClick={handleSave} disabled={saving || testing}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Últimos Logs de Sincronização</CardTitle>
              <CardDescription>Acompanhe as últimas 10 tentativas de sincronização.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Carregando logs...</p>
              ) : logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum log de sincronização encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className={`mt-1 p-1.5 rounded-full ${log.status === 'Sucesso' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {log.status === 'Sucesso' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-gray-800">
                            {log.evento} - <span className={`font-bold ${log.status === 'Sucesso' ? 'text-green-700' : 'text-red-700'}`}>{log.status}</span>
                          </p>
                          <p className="text-xs text-gray-500">{format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">Destino: {log.url_destino}</p>
                        {log.status === 'Falha' && <p className="text-sm text-red-600 mt-1 truncate">Erro: {log.mensagem_erro}</p>}
                        {log.status === 'Sucesso' && <p className="text-sm text-gray-500">Tempo: {log.tempo_resposta}ms</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5 text-blue-700" />
                Webhook (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-800">Configure um webhook para receber atualizações do portal (ex: novos leads).</p>
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook_ativo">Ativar Webhook</Label>
                <Switch
                  id="webhook_ativo"
                  checked={config.webhook_ativo}
                  onCheckedChange={(checked) => handleChange('webhook_ativo', checked)}
                />
              </div>
              {config.webhook_ativo && (
                <div>
                  <Label htmlFor="webhook_url">URL do Webhook</Label>
                  <Input
                    id="webhook_url"
                    value={config.webhook_url || ''}
                    onChange={(e) => handleChange('webhook_url', e.target.value)}
                    placeholder="URL que receberá os dados do portal"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                Instruções
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-2">
              <p>
                <strong>1. URL do Portal:</strong> Insira a URL principal do seu site externo.
              </p>
              <p>
                <strong>2. Chave de API:</strong> Use a chave fornecida pelo portal para autenticar as requisições.
              </p>
              <p>
                <strong>3. URL de Teste:</strong> Marque esta opção se a URL for de um ambiente de desenvolvimento. Isso evitará requisições `POST` reais e simulará o sucesso da sincronização para testes seguros.
              </p>
              <p>
                <strong>4. Sincronização Automática:</strong> Se ativada, qualquer alteração em "Editor do Portal" ou "Marketing" será enviada ao portal instantaneamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}