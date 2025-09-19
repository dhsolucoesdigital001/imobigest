import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
import { Imovel } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { Proprietario } from "@/api/entities";
import { Agent } from "@/api/entities";
import { PortalConfig } from "@/api/entities";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Database,
  Users,
  Building2,
  Settings,
  Globe,
  Shield,
  Bot,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SystemHealthCheck() {
  const [checks, setChecks] = useState({
    database: { status: 'checking', message: 'Verificando conexão...' },
    entities: { status: 'checking', message: 'Validando entidades...' },
    users: { status: 'checking', message: 'Verificando usuários...' },
    permissions: { status: 'checking', message: 'Validando permissões...' },
    agents: { status: 'checking', message: 'Verificando AI Agents...' },
    portal: { status: 'checking', message: 'Validando portal público...' },
    sequentialCodes: { status: 'checking', message: 'Verificando códigos sequenciais...' }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    setLoading(true);
    
    // Check 1: Database Connection
    try {
      const testUser = await User.me();
      setChecks(prev => ({
        ...prev,
        database: { status: 'success', message: 'Conexão com banco estabelecida' }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        database: { status: 'error', message: 'Erro na conexão com banco de dados' }
      }));
    }

    // Check 2: Entities
    try {
      const [imoveis, clientes, proprietarios] = await Promise.all([
        Imovel.list('', 1),
        Cliente.list('', 1),
        Proprietario.list('', 1)
      ]);
      setChecks(prev => ({
        ...prev,
        entities: { 
          status: 'success', 
          message: `Entidades funcionando. ${imoveis.length + clientes.length + proprietarios.length} registros encontrados` 
        }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        entities: { status: 'error', message: 'Erro ao acessar entidades principais' }
      }));
    }

    // Check 3: Users and Permissions
    try {
      const users = await User.list();
      const superAdmins = users.filter(u => u.tipo_usuario === 'Super Admin');
      const adminsWithoutPermissions = superAdmins.filter(u => !u.permissoes || u.permissoes.length === 0);
      
      if (superAdmins.length === 0) {
        setChecks(prev => ({
          ...prev,
          users: { status: 'error', message: 'Nenhum Super Admin encontrado' },
          permissions: { status: 'error', message: 'Sem Super Admins para verificar permissões' }
        }));
      } else {
        setChecks(prev => ({
          ...prev,
          users: { status: 'success', message: `${users.length} usuários, ${superAdmins.length} Super Admin(s)` }
        }));

        if (adminsWithoutPermissions.length > 0) {
          setChecks(prev => ({
            ...prev,
            permissions: { 
              status: 'warning', 
              message: `${adminsWithoutPermissions.length} Super Admin(s) sem permissões configuradas` 
            }
          }));
        } else {
          setChecks(prev => ({
            ...prev,
            permissions: { status: 'success', message: 'Permissões de Super Admin OK' }
          }));
        }
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        users: { status: 'error', message: 'Erro ao verificar usuários' },
        permissions: { status: 'error', message: 'Erro ao verificar permissões' }
      }));
    }

    // Check 4: AI Agents
    try {
      const agents = await Agent.list();
      const activeAgents = agents.filter(a => a.status);
      
      if (agents.length === 0) {
        setChecks(prev => ({
          ...prev,
          agents: { status: 'warning', message: 'Nenhum AI Agent configurado' }
        }));
      } else {
        setChecks(prev => ({
          ...prev,
          agents: { 
            status: 'success', 
            message: `${agents.length} agentes configurados, ${activeAgents.length} ativos` 
          }
        }));
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        agents: { status: 'warning', message: 'AI Agents não disponível ou erro de acesso' }
      }));
    }

    // Check 5: Portal Configuration
    try {
      const configs = await PortalConfig.list();
      if (configs.length === 0) {
        setChecks(prev => ({
          ...prev,
          portal: { status: 'warning', message: 'Portal público não configurado' }
        }));
      } else {
        const config = configs[0];
        const hasBasicConfig = config.nome_imobiliaria && config.telefone_principal;
        setChecks(prev => ({
          ...prev,
          portal: { 
            status: hasBasicConfig ? 'success' : 'warning', 
            message: hasBasicConfig ? 'Portal público configurado' : 'Configuração do portal incompleta' 
          }
        }));
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        portal: { status: 'error', message: 'Erro ao verificar configuração do portal' }
      }));
    }

    // Check 6: Sequential Codes
    try {
      const imoveis = await Imovel.list();
      const semCodigo = imoveis.filter(i => !i.codigo);
      const codigosDuplicados = imoveis
        .map(i => i.codigo)
        .filter(Boolean)
        .filter((code, index, arr) => arr.indexOf(code) !== index);

      if (semCodigo.length > 0 || codigosDuplicados.length > 0) {
        setChecks(prev => ({
          ...prev,
          sequentialCodes: { 
            status: 'warning', 
            message: `${semCodigo.length} sem código, ${codigosDuplicados.length} duplicados` 
          }
        }));
      } else {
        setChecks(prev => ({
          ...prev,
          sequentialCodes: { status: 'success', message: 'Códigos sequenciais OK' }
        }));
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        sequentialCodes: { status: 'error', message: 'Erro ao verificar códigos sequenciais' }
      }));
    }

    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const checkItems = [
    { key: 'database', title: 'Conexão com Banco', icon: Database },
    { key: 'entities', title: 'Entidades do Sistema', icon: Building2 },
    { key: 'users', title: 'Gestão de Usuários', icon: Users },
    { key: 'permissions', title: 'Sistema de Permissões', icon: Shield },
    { key: 'agents', title: 'AI Agents', icon: Bot },
    { key: 'portal', title: 'Portal Público', icon: Globe },
    { key: 'sequentialCodes', title: 'Códigos Sequenciais', icon: Settings }
  ];

  const overallStatus = () => {
    const statuses = Object.values(checks).map(check => check.status);
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('checking')) return 'checking';
    return 'success';
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className={`border-2 ${getStatusColor(overallStatus())}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon(overallStatus())}
            Status Geral do Sistema
            <Button onClick={runHealthChecks} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Verificar Novamente
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkItems.map(({ key, title, icon: Icon }) => (
              <div key={key} className={`p-4 border rounded-lg ${getStatusColor(checks[key].status)}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  {getStatusIcon(checks[key].status)}
                </div>
                <p className="text-sm text-gray-600">{checks[key].message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Problemas Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(checks)
                .filter(([_, check]) => check.status === 'error' || check.status === 'warning')
                .map(([key, check]) => (
                  <div key={key} className={`p-3 border rounded-lg ${getStatusColor(check.status)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(check.status)}
                      <span className="font-medium capitalize">
                        {checkItems.find(item => item.key === key)?.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{check.message}</p>
                  </div>
                ))}
              
              {Object.values(checks).every(check => check.status === 'success') && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-medium">
                    Todos os sistemas estão funcionando corretamente!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checks.permissions.status === 'warning' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Permissões:</strong> Use a "Correção Automática" para configurar permissões dos Super Admins.
                  </p>
                </div>
              )}
              
              {checks.agents.status === 'warning' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">
                    <strong>AI Agents:</strong> Acesse o painel de AI Agents para configurar automações inteligentes.
                  </p>
                </div>
              )}
              
              {checks.portal.status === 'warning' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Portal Público:</strong> Configure as informações básicas da imobiliária nas configurações do portal.
                  </p>
                </div>
              )}
              
              {checks.sequentialCodes.status === 'warning' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Códigos Sequenciais:</strong> Use a aba "Códigos Sequenciais" para corrigir numeração dos imóveis.
                  </p>
                </div>
              )}

              {Object.values(checks).every(check => check.status === 'success') && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Sistema OK:</strong> Todos os componentes estão funcionando corretamente. 
                    Execute verificações regulares para manter a integridade.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}