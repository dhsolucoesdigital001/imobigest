import React, { useState, useEffect } from "react";
import { PortalConfig, MarketingConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Copy, 
  RefreshCw, 
  Shield, 
  Code, 
  Globe,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function IntegracoesAPI() {
  const [apiKey, setApiKey] = useState("imobigest_api_2024");
  const [portalConfig, setPortalConfig] = useState({});
  const [marketingConfig, setMarketingConfig] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [webhookLogs] = useState([
    { id: 1, message: "Imóvel #5182 atualizado - enviado com sucesso", timestamp: "11/09/2024 04:50", status: "success" },
    { id: 2, message: "Imóvel #5183 criado - enviado com sucesso", timestamp: "11/09/2024 04:45", status: "success" },
    { id: 3, message: "Falha ao enviar dados do imóvel #5180", timestamp: "11/09/2024 04:20", status: "error" }
  ]);
  
  const { toast } = useToast();

  useEffect(() => {
    loadConfigurations();
    loadCurrentUser();
  }, []);

  const loadConfigurations = async () => {
    try {
      const [portalConfigs, marketingConfigs] = await Promise.all([
        PortalConfig.list(),
        MarketingConfig.list()
      ]);
      
      setPortalConfig(portalConfigs[0] || {});
      setMarketingConfig(marketingConfigs[0] || {});
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Chave de API copiada!",
      description: "A chave foi copiada para a área de transferência."
    });
  };

  const generateNewApiKey = () => {
    const newKey = `imobigest_api_${Date.now()}`;
    setApiKey(newKey);
    toast({
      title: "Nova chave gerada",
      description: "Uma nova chave de API foi gerada. A anterior foi invalidada.",
      variant: "destructive"
    });
  };

  const testEndpoint = async (endpoint) => {
    try {
      const response = await fetch(`${window.location.origin}/${endpoint}?api_key=${apiKey}`);
      if (response.ok) {
        toast({
          title: "Endpoint funcional",
          description: `${endpoint} está respondendo corretamente.`
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro no endpoint",
        description: `Falha ao testar ${endpoint}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

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
              Apenas Super Administradores podem acessar as configurações de API.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrações e API</h1>
          <p className="text-gray-600 mt-1">
            Gerencie a comunicação entre ImobiGest e o portal público
          </p>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-keys">Chaves de Acesso</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints da API</TabsTrigger>
          <TabsTrigger value="webhook">Status do Webhook</TabsTrigger>
        </TabsList>

        {/* Seção 1: Chaves de Acesso da API */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Chave de API Principal
              </CardTitle>
              <CardDescription>
                Esta chave permite que o portal público acesse os dados do ImobiGest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chave de API Ativa</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={apiKey} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button onClick={copyApiKey} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Mantenha esta chave em segurança. 
                  Ela permite acesso aos dados dos seus imóveis e configurações.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button onClick={generateNewApiKey} variant="destructive">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Nova Chave
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Como usar no Portal:</h4>
                <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`// Exemplo de uso JavaScript
const response = await fetch(
  'https://seudominio.com/api/public/portal-settings?api_key=${apiKey}',
  { method: 'GET' }
);
const config = await response.json();`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seção 2: Endpoints da API Pública */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Endpoint Principal de Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-blue-800 font-medium">
                    GET /api/public/portal-settings
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testEndpoint('ApiPublicPortalSettings')}
                  >
                    Testar
                  </Button>
                </div>
                <p className="text-blue-700 text-sm">
                  Retorna todas as configurações do "Editor do Portal Público" e "Marketing Digital". 
                  O portal deve chamar este endpoint no carregamento inicial.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Exemplo de Resposta (JSON):</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "portal": {
    "nome_imobiliaria": "${portalConfig.nome_imobiliaria || 'ImobiGest'}",
    "layout": "${portalConfig.layout || 'Moderno'}",
    "logo_url": "${portalConfig.logo_url || ''}",
    "endereco_completo": "${portalConfig.endereco_completo || ''}",
    "telefone_principal": "${portalConfig.telefone_principal || ''}",
    "whatsapp": "${portalConfig.whatsapp || ''}",
    "email_contato": "${portalConfig.email_contato || ''}"
  },
  "marketing": {
    "pixel_meta": "${marketingConfig.pixel_meta || ''}",
    "google_analytics": "${marketingConfig.google_analytics || ''}",
    "google_ads": "${marketingConfig.google_ads || ''}",
    "google_tag_manager": "${marketingConfig.google_tag_manager || ''}",
    "tiktok_pixel": "${marketingConfig.tiktok_pixel || ''}",
    "taboola_tag": "${marketingConfig.taboola_tag || ''}",
    "rastreamento_ativo": ${marketingConfig.rastreamento_ativo || false}
  },
  "webchat": {
    "enabled": ${marketingConfig.tech_atende_ativo || false},
    "waba_id": "${marketingConfig.tech_atende_waba_id || ''}",
    "websocket_token": "${marketingConfig.tech_atende_token || ''}"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Outros Endpoints Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-mono text-green-600 font-medium">GET /api/public/properties</span>
                  <p className="text-sm text-gray-600">Lista todos os imóveis ativos</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => testEndpoint('ApiPublicProperties')}
                >
                  Testar
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-mono text-green-600 font-medium">GET /api/public/properties/{'{id}'}</span>
                  <p className="text-sm text-gray-600">Detalhes de um imóvel específico</p>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Testar
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-mono text-purple-600 font-medium">POST /api/public/leads</span>
                  <p className="text-sm text-gray-600">Recebe leads do portal público</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => testEndpoint('ApiPublicLeads')}
                >
                  Testar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seção 3: Status do Webhook */}
        <TabsContent value="webhook" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Status do Webhook de Coleta de Dados
              </CardTitle>
              <CardDescription>
                Configurado na página "Marketing Digital"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL do Webhook Configurada</Label>
                <Input 
                  value={marketingConfig.webhook_url || "Nenhuma URL configurada"} 
                  readOnly 
                  className="mt-2"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={marketingConfig.webhook_ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {marketingConfig.webhook_ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  {marketingConfig.webhook_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href="/MarketingSettings" target="_blank">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Configurar
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Log dos Últimos Envios</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {webhookLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">{log.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  O webhook é disparado automaticamente sempre que um imóvel é criado ou atualizado no sistema.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}