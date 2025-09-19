
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/api/entities";
import { Imovel } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { Proprietario } from "@/api/entities";
import { ContratoLocacao } from "@/api/entities";
import { Agent } from "@/api/entities";
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Shield,
  Database,
  Users,
  Building2,
  FileText,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "../services/aiService";

export default function SystemAnalysis() {
  const [analysisData, setAnalysisData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const loadSystemData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, imoveis, clientes, proprietarios, contratos, agents] = await Promise.all([
        User.list(),
        Imovel.list(),
        Cliente.list(), 
        Proprietario.list(),
        ContratoLocacao.list(),
        Agent.list()
      ]);

      const systemData = {
        timestamp: new Date().toISOString(),
        users: {
          total: users.length,
          super_admins: users.filter(u => u.tipo_usuario === 'Super Admin').length,
          corretores: users.filter(u => u.tipo_usuario === 'Corretor').length,
          assistentes: users.filter(u => u.tipo_usuario === 'Assistente').length,
          without_permissions: users.filter(u => !u.permissoes || u.permissoes.length === 0).length,
          inactive: users.filter(u => !u.ativo).length
        },
        imoveis: {
          total: imoveis.length,
          without_code: imoveis.filter(i => !i.codigo).length,
          without_photos: imoveis.filter(i => !i.fotos || i.fotos.length === 0).length,
          active: imoveis.filter(i => i.ativo !== false).length,
          by_status: {
            disponivel: imoveis.filter(i => i.estagio === 'Disponível').length,
            vendido: imoveis.filter(i => i.estagio === 'Vendido').length,
            alugado: imoveis.filter(i => i.estagio === 'Alugado').length
          }
        },
        clientes: {
          total: clientes.length,
          active: clientes.filter(c => c.status === 'Ativo').length,
          by_status: {
            ativo: clientes.filter(c => c.status === 'Ativo').length,
            frio: clientes.filter(c => c.status === 'Frio').length,
            finalizado: clientes.filter(c => c.status === 'Finalizado').length
          }
        },
        proprietarios: {
          total: proprietarios.length,
          active: proprietarios.filter(p => p.ativo !== false).length,
          with_exclusivity: proprietarios.filter(p => p.exclusividade).length
        },
        contratos: {
          total: contratos.length,
          active: contratos.filter(c => c.status === 'Ativo').length,
          by_status: {
            ativo: contratos.filter(c => c.status === 'Ativo').length,
            encerrado: contratos.filter(c => c.status === 'Encerrado').length,
            inadimplente: contratos.filter(c => c.status === 'Inadimplente').length
          }
        },
        agents: {
          total: agents.length,
          active: agents.filter(a => a.status).length,
          total_executions: agents.reduce((sum, a) => sum + (a.total_execucoes || 0), 0),
          success_executions: agents.reduce((sum, a) => sum + (a.sucesso_execucoes || 0), 0)
        }
      };

      setAnalysisData(systemData);
    } catch (error) {
      console.error("Erro ao carregar dados do sistema:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSystemData();
  }, [loadSystemData]);

  const runAIAnalysis = async () => {
    if (!analysisData) {
      toast({
        title: "Erro",
        description: "Carregue os dados do sistema primeiro",
        variant: "destructive"
      });
      return;
    }

    setAiLoading(true);
    try {
      const analysis = await aiService.analyzeSystem(analysisData);
      setAiAnalysis(analysis);
      
      toast({
        title: "✨ Análise com IA Concluída",
        description: `Sistema analisado com Google Gemini. Score: ${analysis.metricas_importantes?.score_saude || 'N/A'}/100`
      });
    } catch (error) {
      console.error("Erro na análise com IA:", error);
      toast({
        title: "Erro na Análise",
        description: `Falha na análise: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excelente': return 'bg-green-100 text-green-800';
      case 'bom': return 'bg-blue-100 text-blue-800';
      case 'regular': return 'bg-yellow-100 text-yellow-800';
      case 'ruim': return 'bg-orange-100 text-orange-800';
      case 'critico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            Análise Inteligente do Sistema
          </h2>
          <p className="text-gray-600 mt-1">
            Análise avançada powered by Google Gemini
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={loadSystemData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
          <Button onClick={runAIAnalysis} disabled={!analysisData || aiLoading}>
            <Sparkles className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiLoading ? "Analisando..." : "Análise com IA"}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      {analysisData && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysisData.users.total}</div>
              <div className="text-sm text-gray-600">Usuários</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysisData.imoveis.total}</div>
              <div className="text-sm text-gray-600">Imóveis</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysisData.clientes.total}</div>
              <div className="text-sm text-gray-600">Clientes</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysisData.proprietarios.total}</div>
              <div className="text-sm text-gray-600">Proprietários</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysisData.contratos.total}</div>
              <div className="text-sm text-gray-600">Contratos</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysisData.agents.total}</div>
              <div className="text-sm text-gray-600">AI Agents</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="space-y-6">
          {/* Status Geral */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
                Análise Geral do Sistema
                <Badge className={getStatusColor(aiAnalysis.status_geral)}>
                  {aiAnalysis.status_geral?.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {aiAnalysis.metricas_importantes?.score_saude || 0}
                  </div>
                  <div className="text-sm text-gray-600">Score de Saúde</div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pontos Fortes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiAnalysis.metricas_importantes?.pontos_fortes?.slice(0, 3).map((ponto, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Áreas de Atenção:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiAnalysis.metricas_importantes?.areas_atencao?.slice(0, 3).map((area, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Problemas Identificados */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Problemas Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.problemas_identificados?.length > 0 ? (
                    aiAnalysis.problemas_identificados.map((problema, i) => (
                      <div key={i} className={`p-3 border rounded-lg ${getSeverityColor(problema.severidade)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{problema.categoria}</span>
                          <Badge className={getSeverityColor(problema.severidade)}>
                            {problema.severidade}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{problema.descricao}</p>
                        <div className="text-sm">
                          <strong>Solução:</strong> {problema.solucao}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600">Nenhum problema crítico identificado!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recomendações */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.recomendacoes?.map((recomendacao, i) => (
                    <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{recomendacao}</p>
                      </div>
                    </div>
                  ))}
                  
                  {aiAnalysis.proximo_diagnostico && (
                    <Alert className="border-purple-200 bg-purple-50 mt-4">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <AlertDescription>
                        <strong>Próximo diagnóstico:</strong> {aiAnalysis.proximo_diagnostico}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Loading States */}
      {loading && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados do sistema...</p>
          </CardContent>
        </Card>
      )}

      {aiLoading && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-8 h-8 animate-pulse text-blue-600" />
              <Sparkles className="w-6 h-6 animate-spin text-purple-600" />
            </div>
            <p className="text-gray-900 font-medium mb-2">Google Gemini Analisando...</p>
            <p className="text-gray-600 text-sm">Processando dados e gerando insights inteligentes</p>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {!aiAnalysis && analysisData && !aiLoading && (
        <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Análise Inteligente Disponível
            </h3>
            <p className="text-gray-600 mb-6">
              Use o poder do Google Gemini para obter insights avançados sobre seu sistema
            </p>
            <Button onClick={runAIAnalysis} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Iniciar Análise com IA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
