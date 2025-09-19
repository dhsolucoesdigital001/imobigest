import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3
} from "lucide-react";

export default function AgentDashboard({ agents, logs, onRefresh }) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status).length;
  const recentLogs = logs.slice(0, 10);
  
  // Estatísticas
  const totalExecutions = agents.reduce((sum, a) => sum + (a.total_execucoes || 0), 0);
  const successfulExecutions = agents.reduce((sum, a) => sum + (a.sucesso_execucoes || 0), 0);
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
  
  // Logs por status nas últimas 24h
  const recentSuccessLogs = logs.filter(l => l.status === "Sucesso").length;
  const recentErrorLogs = logs.filter(l => l.status === "Erro").length;

  const getStatusIcon = (status) => {
    switch (status) {
      case "Sucesso": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Erro": return <XCircle className="w-4 h-4 text-red-500" />;
      case "Parcial": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Sucesso": return "bg-green-100 text-green-800";
      case "Erro": return "bg-red-100 text-red-800";
      case "Parcial": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Agentes</p>
                <p className="text-3xl font-bold text-gray-900">{totalAgents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes Ativos</p>
                <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Execuções</p>
                <p className="text-3xl font-bold text-purple-600">{totalExecutions}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-indigo-600">{successRate}%</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agentes por Performance */}
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Agentes por Performance</CardTitle>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents
                .sort((a, b) => (b.sucesso_execucoes || 0) - (a.sucesso_execucoes || 0))
                .slice(0, 5)
                .map((agent) => {
                  const rate = agent.total_execucoes > 0 ? 
                    Math.round(((agent.sucesso_execucoes || 0) / agent.total_execucoes) * 100) : 0;
                  
                  return (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <div>
                          <p className="font-medium text-sm">{agent.nome}</p>
                          <p className="text-xs text-gray-500">{agent.total_execucoes || 0} execuções</p>
                        </div>
                      </div>
                      <Badge className={rate >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {rate}%
                      </Badge>
                    </div>
                  );
                })
              }
              
              {agents.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum agente configurado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logs Recentes */}
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Atividade Recente</CardTitle>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {log.tarefa_executada}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                        {log.status}
                      </Badge>
                      {log.tempo_execucao && (
                        <span className="text-xs text-gray-500">
                          {log.tempo_execucao}ms
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(log.created_date).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              
              {recentLogs.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Status */}
      {logs.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Resumo de Execuções (Últimas 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{recentSuccessLogs}</p>
                <p className="text-sm text-green-700">Sucessos</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{recentErrorLogs}</p>
                <p className="text-sm text-red-700">Erros</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}