
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/api/entities";
import { Imovel } from "@/api/entities";
import { Agent } from "@/api/entities";
import { PortalConfig } from "@/api/entities";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Shield,
  Database,
  Settings,
  Bot,
  RefreshCw,
  Wrench,
  Activity,
  HeartPulse, // Added new icon
  Users,      // Added new icon
  Hash        // Added new icon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import SystemHealthCheck from "../components/system/SystemHealthCheck";
// SystemAnalysis is removed from tabs and no longer needed here if not used elsewhere
import UserTestAccounts from "../components/system/UserTestAccounts";
import SequentialCodeValidator from "../components/system/SequentialCodeValidator";
import IntegrationValidator from "../components/system/IntegrationValidator"; // Added new component import

export default function SystemHealthCheckPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({});
  const [activeTab, setActiveTab] = useState("health"); // Initial tab set to "health"
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    runQuickHealthCheck();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const runQuickHealthCheck = async () => {
    setLoading(true); // Indicate loading for health check
    const status = {};
    
    try {
      // Check entities
      const imoveis = await Imovel.list('', 1);
      status.entities = { status: 'success', count: imoveis.length };
    } catch (error) {
      status.entities = { status: 'error', message: 'Erro ao acessar entidades' };
    }

    try {
      // Check users
      const users = await User.list();
      const superAdmins = users.filter(u => u.tipo_usuario === 'Super Admin');
      status.users = { 
        status: superAdmins.length > 0 ? 'success' : 'warning', 
        total: users.length,
        superAdmins: superAdmins.length 
      };
    } catch (error) {
      status.users = { status: 'error', message: 'Erro ao verificar usuários' };
    }

    try {
      // Check agents
      const agents = await Agent.list();
      status.agents = { 
        status: 'success', 
        total: agents.length,
        active: agents.filter(a => a.status).length 
      };
    } catch (error) {
      status.agents = { status: 'warning', message: 'AI Agents não configurados' };
    }

    try {
      // Check portal config
      const configs = await PortalConfig.list();
      status.portal = { 
        status: configs.length > 0 ? 'success' : 'warning',
        configured: configs.length > 0 
      };
    } catch (error) {
      status.portal = { status: 'error', message: 'Erro na configuração do portal' };
    }

    setSystemStatus(status);
    setLoading(false); // End loading after health check
  };

  const runAutoFix = async () => {
    setLoading(true);
    let fixedItems = [];

    try {
      // Fix 1: Ensure Super Admin permissions
      const users = await User.list();
      const superAdmins = users.filter(u => u.tipo_usuario === 'Super Admin');
      
      for (const admin of superAdmins) {
        if (!admin.permissoes || admin.permissoes.length === 0 || admin.permissoes.length < 15) { // Check for minimal permissions
          const allPermissions = [
            "dashboard_ver", "imoveis_criar", "imoveis_editar", "imoveis_ver", "imoveis_excluir",
            "clientes_criar", "clientes_editar", "clientes_ver", "clientes_excluir",
            "corretores_criar", "corretores_editar", "corretores_ver", "corretores_excluir",
            "proprietarios_criar", "proprietarios_editar", "proprietarios_ver", "proprietarios_excluir",
            "visitas_criar", "visitas_editar", "visitas_ver", "visitas_excluir",
            "relatorios_ver", "relatorios_exportar", "portal_config", "usuarios_gerenciar", "sistema_configurar"
          ];
          
          await User.update(admin.id, { ...admin, permissoes: allPermissions });
          fixedItems.push(`Permissões do Super Admin ${admin.full_name} atualizadas`);
        }
      }

      // Fix 2: Create default portal config if missing
      const configs = await PortalConfig.list();
      if (configs.length === 0) {
        await PortalConfig.create({
          versao: 'Completa',
          layout: 'Moderno',
          nome_imobiliaria: 'ImobiGest',
          endereco_completo: 'Av. Principal, 123 - Centro, Sua Cidade/UF',
          telefone_principal: '(31) 3333-4444',
          whatsapp: '(31) 99999-8888',
          email_contato: 'contato@imobigest.com',
          redes_sociais: { facebook: '', instagram: '', linkedin: '', youtube: '' },
          modulos_home: [
            { id: 'banner', nome: 'Banner Principal', ativo: true, ordem: 0, config: {} },
            { id: 'busca', nome: 'Barra de Busca', ativo: true, ordem: 1, config: {} },
            { id: 'destaques', nome: 'Imóveis em Destaque', ativo: true, ordem: 2, config: {} }
          ]
        });
        fixedItems.push('Configuração do Portal Público criada');
      }

      // Fix 3: Fix sequential codes for properties without codes
      const imoveis = await Imovel.list();
      const imoveisSemCodigo = imoveis.filter(i => !i.codigo);
      let nextCode = 100;
      
      if (imoveis.length > 0) {
        const codigosExistentes = imoveis.map(i => i.codigo).filter(Boolean);
        if (codigosExistentes.length > 0) {
          nextCode = Math.max(...codigosExistentes) + 1;
        }
      }

      for (const imovel of imoveisSemCodigo) {
        await Imovel.update(imovel.id, { ...imovel, codigo: nextCode });
        fixedItems.push(`Código ${nextCode} atribuído ao imóvel ${imovel.id}`);
        nextCode++;
      }

      await runQuickHealthCheck(); // Re-run health check after fixes
      
      toast({
        title: "Correções Aplicadas",
        description: `${fixedItems.length} itens foram corrigidos automaticamente.`
      });

    } catch (error) {
      console.error("Erro na correção automática:", error);
      toast({
        title: "Erro na Correção",
        description: "Alguns itens não puderam ser corrigidos automaticamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentUser) { // Only show full-screen loader if initial currentUser is not loaded
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (currentUser && currentUser.tipo_usuario !== "Super Admin") {
    return (
      <div className="p-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h3>
            <p className="text-gray-500 mb-6">
              Apenas Super Administradores podem acessar o diagnóstico do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Diagnóstico do Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Monitore a saúde e integridade de todos os módulos do ImobiGest {/* Updated description */}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={runQuickHealthCheck} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Atualizar
          </Button>
          <Button onClick={runAutoFix} className="bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
            Correção Automática
          </Button>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entidades</p>
                <div className="flex items-center gap-2">
                  {systemStatus.entities?.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    {systemStatus.entities?.status === 'success' ? 'OK' : 'Erro'}
                  </span>
                </div>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários</p>
                <div className="flex items-center gap-2">
                  {systemStatus.users?.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : systemStatus.users?.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    {systemStatus.users?.superAdmins || 0} Super Admin
                  </span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Agents</p>
                <div className="flex items-center gap-2">
                  {systemStatus.agents?.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {systemStatus.agents?.active || 0}/{systemStatus.agents?.total || 0}
                  </span>
                </div>
              </div>
              <Bot className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portal</p>
                <div className="flex items-center gap-2">
                  {systemStatus.portal?.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {systemStatus.portal?.configured ? 'Configurado' : 'Pendente'}
                  </span>
                </div>
              </div>
              <Settings className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4" />
            Health Check
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Integração
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários Teste
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Códigos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthCheck />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <IntegrationValidator />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserTestAccounts />
        </TabsContent>

        <TabsContent value="codes" className="space-y-6">
          <SequentialCodeValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
