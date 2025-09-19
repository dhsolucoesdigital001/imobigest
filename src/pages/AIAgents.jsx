
import React, { useState, useEffect } from "react";
import { Agent, AgentLog, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  Shield,
  Zap,
  Brain, // Added Brain for header icon
  MessageSquare,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Sparkles // Added Sparkles for Gemini badge and button
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Import useToast

import AgentForm from "../components/agents/AgentForm";
import AgentList from "../components/agents/AgentList";
import AgentDashboard from "../components/agents/AgentDashboard";

export default function AIAgents() {
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  const loadData = async () => {
    try {
      const [agentsData, logsData] = await Promise.all([
        Agent.list("-created_date"),
        AgentLog.list("-created_date", 50)
      ]);
      setAgents(agentsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Erro ao carregar dados dos agentes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAgents = async () => {
    setLoading(true);
    try {
      const defaultAgents = [
        {
          nome: "Assistente Financeiro IA",
          role: "Assistente Financeiro", 
          descricao: "Agente inteligente powered by Google Gemini para análise financeira avançada e insights sobre receitas, despesas e inadimplência",
          tarefas: [
            "Gerar relatórios de receitas mensais com análise de tendências",
            "Identificar padrões de inadimplência e enviar alertas inteligentes", 
            "Calcular repasses para proprietários com otimizações",
            "Analisar performance financeira e sugerir melhorias",
            "Prever fluxo de caixa baseado em dados históricos"
          ],
          configuracao: {
            execucao_automatica: true,
            frequencia: "Diária",
            horario_execucao: "09:00",
            notificar_admin: true,
            integracoes_ativas: ["contratos", "pagamentos", "relatorios", "gemini"]
          },
          prompt_sistema: "Você é um assistente financeiro especializado em gestão imobiliária com acesso ao Google Gemini. Analise dados financeiros profundamente, identifique tendências, padrões de inadimplência e oportunidades de otimização. Forneça insights acionáveis e previsões baseadas em inteligência artificial avançada.",
          status: true
        },
        {
          nome: "Gestor de Contratos IA",
          role: "Gestor de Contratos",
          descricao: "Agente inteligente para gestão automatizada de contratos com análise preditiva de vencimentos e renovações",
          tarefas: [
            "Monitorar vencimentos de contratos com análise preditiva",
            "Enviar notificações personalizadas de reajuste automático",
            "Analisar histórico de contratos e sugerir melhorias nos termos", 
            "Gerar checklists inteligentes de renovação",
            "Prever probabilidade de renovação baseado no histórico do cliente"
          ],
          configuracao: {
            execucao_automatica: true,
            frequencia: "Semanal", 
            horario_execucao: "08:00",
            notificar_admin: true,
            integracoes_ativas: ["contratos", "vistorias", "documentos", "gemini"]
          },
          prompt_sistema: "Você é um gestor de contratos imobiliários com IA avançada. Use análise preditiva para antecipar necessidades de renovação, identifique riscos contratuais, otimize termos baseado em dados históricos e mantenha conformidade legal com insights inteligentes.",
          status: true
        },
        {
          nome: "Atendimento Inteligente",
          role: "Atendimento ao Cliente",
          descricao: "Agente de atendimento com IA conversacional avançada para suporte automatizado 24/7",
          tarefas: [
            "Responder FAQ com processamento de linguagem natural",
            "Qualificar leads automaticamente com análise de intenção",
            "Enviar mensagens personalizadas via WhatsApp baseadas no perfil",
            "Agendar visitas inteligentemente considerando disponibilidade",
            "Gerar insights sobre satisfação do cliente e oportunidades"
          ],
          configuracao: {
            execucao_automatica: true,
            frequencia: "Diária",
            horario_execucao: "24/7",
            notificar_admin: false,
            integracoes_ativas: ["portal", "whatsapp", "clientes", "visitas", "gemini"]
          },
          prompt_sistema: "Você é um assistente de atendimento ao cliente com IA conversacional avançada. Seja empático, inteligente e proativo. Use processamento de linguagem natural para entender necessidades, personalize respostas baseado no perfil do cliente, identifique oportunidades de vendas e mantenha sempre um tom profissional e prestativo.",
          status: true
        }
      ];

      for (const agentData of defaultAgents) {
        await Agent.create(agentData);
      }

      await loadData();
      
      toast({
        title: "🚀 Agentes IA Criados!",
        description: "3 agentes inteligentes powered by Google Gemini foram configurados com sucesso."
      });
      
    } catch (error) {
      console.error("Erro ao criar agentes padrão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar os agentes padrão.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (agentData) => {
    try {
      if (editingAgent) {
        await Agent.update(editingAgent.id, agentData);
      } else {
        await Agent.create(agentData);
      }
      setShowForm(false);
      setEditingAgent(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleDelete = async (agentId) => {
    if (window.confirm("Tem certeza que deseja excluir este agente?")) {
      try {
        await Agent.delete(agentId);
        loadData();
      } catch (error) {
        console.error("Erro ao excluir agente:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAgent(null);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
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
              Apenas Super Administradores podem acessar o painel de AI Agents.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" /> {/* Changed icon to Brain */}
              AI Agents
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" /> {/* Added Sparkles icon */}
                Powered by Gemini
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Agentes inteligentes com Google Gemini para automatizar processos
            </p> {/* Updated description */}
          </div>
        </div>
        
        <div className="flex gap-3">
          {agents.length === 0 && (
            <Button onClick={createDefaultAgents} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" /> {/* Changed icon to Sparkles */}
              Criar Agentes IA {/* Updated button text */}
            </Button>
          )}
          
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" // Added gradient
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agente IA {/* Updated button text */}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "agents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            Agentes ({agents.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {showForm ? (
        <AgentForm 
          agent={editingAgent}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {activeTab === "dashboard" && (
            <AgentDashboard 
              agents={agents}
              logs={logs}
              onRefresh={loadData}
            />
          )}
          
          {activeTab === "agents" && (
            <AgentList 
              agents={agents}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNewAgent={() => setShowForm(true)}
              onRefresh={loadData}
            />
          )}
        </>
      )}
    </div>
  );
}
