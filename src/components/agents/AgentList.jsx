
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Zap,
  Calendar,
  Brain,
  Sparkles
} from "lucide-react";
import { Agent } from "@/api/entities";
import { AgentLog } from "@/api/entities";
import { aiService } from "../services/aiService";
import { useToast } from "@/components/ui/use-toast";

export default function AgentList({ agents, loading, onEdit, onDelete, onNewAgent, onRefresh }) {
  const [executingAgent, setExecutingAgent] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const { toast } = useToast();

  React.useEffect(() => {
    loadAiStats();
  }, []);

  const loadAiStats = async () => {
    try {
      const stats = aiService.getProviderStats();
      setAiStats(stats);
    } catch (error) {
      console.error("Erro ao carregar stats AI:", error);
    }
  };

  const executeAgent = async (agent) => {
    setExecutingAgent(agent.id);
    const startTime = Date.now();
    
    try {
      // Preparar dados de contexto para o agente
      const contextData = {
        agente_id: agent.id,
        timestamp: new Date().toISOString(),
        configuracao: agent.configuracao || {},
        sistema_info: {
          data_execucao: new Date().toISOString(),
          executado_por: "manual"
        }
      };

      // Executar usando o AI Service (Gemini + fallback Base44)
      const resultado = await aiService.executeAgentTask(agent, contextData);
      const executionTime = Date.now() - startTime;

      // Salvar log da execução
      await AgentLog.create({
        agent_id: agent.id,
        tarefa_executada: `Execução completa do agente ${agent.nome}`,
        status: resultado.status === "sucesso" ? "Sucesso" : 
                resultado.status === "erro" ? "Erro" : "Parcial",
        resultado: resultado,
        tempo_execucao: executionTime,
        dados_entrada: contextData,
        detalhes: resultado.dados_resultado?.resumo || "Execução realizada com IA avançada"
      });

      // Atualizar estatísticas do agente
      await Agent.update(agent.id, {
        ...agent,
        ultima_execucao: new Date().toISOString(),
        total_execucoes: (agent.total_execucoes || 0) + 1,
        sucesso_execucoes: (agent.sucesso_execucoes || 0) + (resultado.status === "sucesso" ? 1 : 0)
      });

      toast({
        title: "✨ Execução Concluída com IA",
        description: `${agent.nome}: ${resultado.dados_resultado?.resumo || 'Tarefas executadas com sucesso'}`
      });

      // Mostrar insights se disponíveis
      if (resultado.insights && resultado.insights.length > 0) {
        setTimeout(() => {
          toast({
            title: "💡 Insights Gerados",
            description: resultado.insights.slice(0, 2).join('. ')
          });
        }, 2000);
      }

      onRefresh();
      await loadAiStats(); // Atualizar estatísticas

    } catch (error) {
      console.error("Erro na execução do agente:", error);
      
      let errorTitle = "Erro na Execução";
      let errorMessage = `Falha ao executar ${agent.nome}.`;
      let errorDetails = "Falha na execução do agente com IA";

      if (error.message && (error.message.includes("exceeded your current quota") || error.message.includes("RateLimitError"))) {
        errorTitle = "Limite de Requisições Atingido";
        errorMessage = "Você excedeu sua cota de uso com o provedor de IA. Por favor, verifique seu plano e detalhes de faturamento ou tente novamente mais tarde.";
        errorDetails = "Quota ou limite de requisições do provedor de IA atingido.";
      } else {
        errorMessage = `Falha ao executar ${agent.nome}: ${error.message}`;
      }
      
      // Salvar log de erro
      await AgentLog.create({
        agent_id: agent.id,
        tarefa_executada: `Execução falhou do agente ${agent.nome}`,
        status: "Erro",
        resultado: { error: errorMessage },
        tempo_execucao: Date.now() - startTime,
        dados_entrada: { agente: agent.nome },
        mensagem_erro: error.message,
        detalhes: errorDetails
      });

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setExecutingAgent(null);
    }
  };

  const toggleAgentStatus = async (agent) => {
    try {
      await Agent.update(agent.id, {
        ...agent,
        status: !agent.status
      });
      onRefresh();
      
      toast({
        title: agent.status ? "Agente Desativado" : "Agente Ativado",
        description: `${agent.nome} foi ${agent.status ? "desativado" : "ativado"}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do agente",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Assistente Financeiro": return "💰";
      case "Gestor de Contratos": return "📄";
      case "Atendimento ao Cliente": return "🎧";
      case "Gestor de Imóveis": return "🏢";
      case "Analista de Vendas": return "📊";
      default: return "🤖";
    }
  };

  const getFrequencyColor = (freq) => {
    switch (freq) {
      case "Diária": return "bg-green-100 text-green-800";
      case "Semanal": return "bg-blue-100 text-blue-800";
      case "Mensal": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-12 text-center">
          <Bot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum Agente Configurado
          </h3>
          <p className="text-gray-500 mb-6">
            Crie seu primeiro agente inteligente powered by Google Gemini
          </p>
          <Button onClick={onNewAgent} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Criar Primeiro Agente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Stats */}
      {aiStats && (
        <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Google Gemini Integrado</h3>
                  <p className="text-sm text-gray-600">
                    {aiStats.gemini.remainingRequests} requisições restantes hoje
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Quota Utilizada</div>
                  <div className="text-lg font-bold text-blue-600">
                    {aiStats.gemini.quotaPercentage}%
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {aiStats.available_providers.gemini ? "Gemini OK" : "Base44 Only"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-2xl">
                      {getRoleIcon(agent.role)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{agent.nome}</CardTitle>
                    <p className="text-sm text-gray-600">{agent.role}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={agent.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {agent.status ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{agent.descricao}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tarefas:</span>
                  <span className="font-medium">{agent.tarefas?.length || 0}</span>
                </div>
                
                {agent.configuracao?.frequencia && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Frequência:</span>
                    <Badge className={`text-xs ${getFrequencyColor(agent.configuracao.frequencia)}`}>
                      {agent.configuracao.frequencia}
                    </Badge>
                  </div>
                )}
                
                {agent.ultima_execucao && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Última execução:</span>
                    <span className="text-xs text-gray-600">
                      {new Date(agent.ultima_execucao).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {(agent.total_execucoes || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Taxa de sucesso:</span>
                    <span className="font-medium text-green-600">
                      {Math.round(((agent.sucesso_execucoes || 0) / agent.total_execucoes) * 100)}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeAgent(agent)}
                  disabled={!agent.status || executingAgent === agent.id}
                  className="flex-1"
                >
                  {executingAgent === agent.id ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Executar com IA
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAgentStatus(agent)}
                >
                  {agent.status ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => onEdit(agent)}>
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(agent.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
