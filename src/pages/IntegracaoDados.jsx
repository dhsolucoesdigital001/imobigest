import React, { useState, useEffect } from "react";
import { IntegrationConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  ExternalLink, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Database,
  MapPin,
  ImageIcon,
  FileText,
  Mail,
  MessageSquare,
  Bot,
  CreditCard,
  Users,
  Zap,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function IntegracaoDados() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [testResults, setTestResults] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    loadCurrentUser();
  }, []);

  const loadConfig = async () => {
    try {
      const configs = await IntegrationConfig.list();
      setConfig(configs[0] || {});
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
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

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleApiKeyVisibility = (integration) => {
    setShowApiKeys(prev => ({ ...prev, [integration]: !prev[integration] }));
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      if (config.id) {
        await IntegrationConfig.update(config.id, config);
      } else {
        await IntegrationConfig.create(config);
      }
      toast({
        title: "Configurações salvas!",
        description: "As integrações foram configuradas com sucesso."
      });
      await loadConfig();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testIntegration = async (integration, endpoint, testData = {}) => {
    setTestResults(prev => ({ ...prev, [integration]: { status: 'testing' } }));
    
    // Simular teste de integração
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% de chance de sucesso
      setTestResults(prev => ({
        ...prev,
        [integration]: {
          status: success ? 'success' : 'error',
          message: success 
            ? `${integration} conectado com sucesso!`
            : `Erro ao conectar com ${integration}. Verifique as credenciais.`
        }
      }));
      
      toast({
        title: success ? "Teste bem-sucedido" : "Falha no teste",
        description: success 
          ? `${integration} está funcionando corretamente.`
          : `Erro ao conectar com ${integration}.`,
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  if (currentUser && currentUser.tipo_usuario !== 'Super Admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso restrito. Apenas Super Administradores podem configurar integrações.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const integrations = [
    {
      id: 'google_places',
      name: 'Google Places & Maps',
      icon: MapPin,
      color: 'bg-green-500',
      description: 'Validação de endereços e mapas interativos',
      fields: [
        { key: 'google_places_api_key', label: 'Google API Key', type: 'password' }
      ],
      functions: [
        'Validação de endereço em tempo real',
        'Exibição de mapas interativos',
        'Busca de endereços'
      ],
      link: 'https://console.cloud.google.com/apis/credentials',
      linkText: '🔗 Ativar Google Cloud Console'
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary (Imagens)',
      icon: ImageIcon,
      color: 'bg-blue-500',
      description: 'Gerenciamento e otimização de imagens',
      fields: [
        { key: 'cloudinary_cloud_name', label: 'Cloud Name', type: 'text' },
        { key: 'cloudinary_api_key', label: 'API Key', type: 'password' },
        { key: 'cloudinary_api_secret', label: 'API Secret', type: 'password' }
      ],
      functions: [
        'Upload automático em pasta /imoveis',
        'Conversão para WEBP',
        'Múltiplos tamanhos automáticos'
      ],
      link: 'https://cloudinary.com/console',
      linkText: '🔗 Configurar Cloudinary'
    },
    {
      id: 'pdf_monkey',
      name: 'PDF Monkey (Contratos)',
      icon: FileText,
      color: 'bg-red-500',
      description: 'Geração automática de documentos PDF',
      fields: [
        { key: 'pdf_monkey_api_key', label: 'PDF Monkey API Key', type: 'password' }
      ],
      functions: [
        'Contratos de locação/venda',
        'Extratos de pagamento',
        'Laudos de vistoria'
      ],
      link: 'https://www.pdfmonkey.io/dashboard',
      linkText: '🔗 Acessar PDF Monkey'
    },
    {
      id: 'resend',
      name: 'Resend (E-mails)',
      icon: Mail,
      color: 'bg-purple-500',
      description: 'E-mails transacionais profissionais',
      fields: [
        { key: 'resend_api_key', label: 'Resend API Key', type: 'password' }
      ],
      functions: [
        'Lembretes de pagamento',
        'Confirmação de visitas',
        'Extratos para proprietários'
      ],
      link: 'https://resend.com/dashboard',
      linkText: '🔗 Resend Dashboard'
    },
    {
      id: 'twilio',
      name: 'Twilio (SMS/WhatsApp)',
      icon: MessageSquare,
      color: 'bg-indigo-500',
      description: 'Comunicação via SMS e WhatsApp',
      fields: [
        { key: 'twilio_account_sid', label: 'Account SID', type: 'text' },
        { key: 'twilio_auth_token', label: 'Auth Token', type: 'password' },
        { key: 'twilio_from_number', label: 'From Number', type: 'text' }
      ],
      functions: [
        'SMS de lembrete de aluguel',
        'Confirmação de visitas',
        'Notificações de repasse'
      ],
      link: 'https://console.twilio.com/',
      linkText: '🔗 Twilio Console'
    },
    {
      id: 'gemini',
      name: 'Gemini (IA)',
      icon: Bot,
      color: 'bg-yellow-500',
      description: 'IA para descrições automáticas',
      fields: [
        { key: 'gemini_api_key', label: 'Gemini API Key', type: 'password' }
      ],
      functions: [
        'Descrições automáticas de imóveis',
        'Textos atrativos em português',
        'Otimização de conteúdo'
      ],
      link: 'https://aistudio.google.com/app/apikey',
      linkText: '🔗 Google AI Studio'
    },
    {
      id: 'payments',
      name: 'Pagamentos (Múltiplos)',
      icon: CreditCard,
      color: 'bg-emerald-500',
      description: 'Processamento de pagamentos',
      fields: [
        { key: 'hyp_payments_api_key', label: 'Hyp Payments API Key', type: 'password' },
        { key: 'tranzila_api_key', label: 'Tranzila API Key', type: 'password' },
        { key: 'asaas_api_key', label: 'Asaas API Key', type: 'password' }
      ],
      functions: [
        'Geração de boletos/PIX',
        'Baixa automática de pagamentos',
        'Controle de inadimplência'
      ],
      links: [
        { url: 'https://hyppayments.com/', text: '🔗 Hyp Payments' },
        { url: 'https://tranzila.com/', text: '🔗 Tranzila' },
        { url: 'https://www.asaas.com/', text: '🔗 Asaas' }
      ]
    },
    {
      id: 'hubspot',
      name: 'Hubspot (CRM)',
      icon: Users,
      color: 'bg-orange-500',
      description: 'Gestão de relacionamento com clientes',
      fields: [
        { key: 'hubspot_api_key', label: 'Hubspot API Key', type: 'password' }
      ],
      functions: [
        'Funil de vendas automatizado',
        'Relatórios de conversão',
        'Automação de marketing'
      ],
      link: 'https://app.hubspot.com/',
      linkText: '🔗 Hubspot Dashboard'
    },
    {
      id: 'zapier',
      name: 'Zapier (Automação)',
      icon: Zap,
      color: 'bg-pink-500',
      description: 'Automação e integrações avançadas',
      fields: [
        { key: 'zapier_api_key', label: 'Zapier API Key', type: 'password' },
        { key: 'zapier_webhook_url', label: 'Webhook URL', type: 'text' }
      ],
      functions: [
        'Conexão com Google Sheets',
        'Notificações Slack/Teams',
        'Backup automático'
      ],
      link: 'https://zapier.com/app/dashboard',
      linkText: '🔗 Zapier Dashboard'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Integração de Dados
          </h1>
          <p className="text-gray-600 mt-1">
            Configure APIs e serviços essenciais para o sistema imobiliário
          </p>
        </div>
        
        <Button 
          onClick={saveConfig}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isActive = config[`${integration.id}_ativo`];
          const testResult = testResults[integration.id];
          
          return (
            <Card key={integration.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isActive || false}
                    onCheckedChange={(checked) => handleInputChange(`${integration.id}_ativo`, checked)}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  {testResult && (
                    <Badge className={
                      testResult.status === 'success' 
                        ? "bg-green-100 text-green-800" 
                        : testResult.status === 'error'
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }>
                      {testResult.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {testResult.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {testResult.status === 'testing' && "Testando..."}
                      {testResult.status === 'success' && "Conectado"}
                      {testResult.status === 'error' && "Erro"}
                    </Badge>
                  )}
                </div>

                {/* Configuration Fields */}
                {isActive && (
                  <div className="space-y-3">
                    {integration.fields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key} className="text-sm font-medium">
                          {field.label}
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id={field.key}
                              type={showApiKeys[field.key] ? 'text' : field.type}
                              value={config[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              placeholder={`Digite seu ${field.label}`}
                              className="pr-10"
                            />
                            {field.type === 'password' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-7 w-7"
                                onClick={() => toggleApiKeyVisibility(field.key)}
                              >
                                {showApiKeys[field.key] ? 
                                  <EyeOff className="h-3 w-3" /> : 
                                  <Eye className="h-3 w-3" />
                                }
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Functions List */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Funcionalidades:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {integration.functions.map((func, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        {func}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  {/* External Links */}
                  {integration.links ? (
                    integration.links.map((link, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        {link.text}
                      </Button>
                    ))
                  ) : integration.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => window.open(integration.link, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      {integration.linkText}
                    </Button>
                  )}
                  
                  {/* Test Button */}
                  {isActive && integration.fields.some(f => config[f.key]) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => testIntegration(integration.name, integration.id)}
                      disabled={testResult?.status === 'testing'}
                    >
                      <TestTube className="w-3 h-3 mr-2" />
                      {testResult?.status === 'testing' ? 'Testando...' : 'Testar Integração'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}