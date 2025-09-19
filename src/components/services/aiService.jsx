import { geminiService } from './geminiService.jsx';
import { InvokeLLM } from '@/api/integrations';

class AIService {
  constructor() {
    this.config = {
      provider: 'both',
      gemini_enabled: true,
      fallback_to_base44: true,
      agent_execution_mode: 'base44_first' // Mudança padrão para Base44 primeiro
    };
  }

  async executeWithFallback(geminiFunction, base44Function, context = {}) {
    const mode = this.config?.agent_execution_mode || 'base44_first';
    
    switch (mode) {
      case 'gemini_only':
        if (!geminiService.isAvailable()) {
          throw new Error("Gemini não disponível e fallback desabilitado");
        }
        return await this.executeGemini(geminiFunction, context);
      
      case 'base44_only':
        return await this.executeBase44(base44Function, context);
      
      case 'gemini_first':
        if (geminiService.isAvailable()) {
          try {
            return await this.executeGemini(geminiFunction, context);
          } catch (error) {
            console.warn("Gemini falhou, usando Base44:", error.message);
            if (this.config?.fallback_to_base44) {
              return await this.executeBase44(base44Function, context);
            }
            throw error;
          }
        } else {
          console.warn("Gemini não disponível, usando Base44");
          return await this.executeBase44(base44Function, context);
        }
      
      case 'base44_first':
      default:
        // Tentar Base44 primeiro (mais confiável)
        try {
          return await this.executeBase44(base44Function, context);
        } catch (error) {
          console.warn("Base44 falhou, tentando Gemini:", error.message);
          if (geminiService.isAvailable()) {
            try {
              return await this.executeGemini(geminiFunction, context);
            } catch (geminiError) {
              console.warn("Gemini também falhou:", geminiError.message);
              throw error; // Throw original Base44 error
            }
          }
          throw error;
        }
    }
  }

  async executeGemini(geminiFunction, context = {}) {
    if (!geminiService.isAvailable()) {
      throw new Error("Gemini não disponível devido a limites de quota");
    }
    
    return await geminiFunction();
  }

  async executeBase44(base44Function, context = {}) {
    return await base44Function();
  }

  async analyzeSystem(systemData) {
    const geminiAnalysis = async () => {
      return await geminiService.analyzeSystem(systemData);
    };

    const base44Analysis = async () => {
      // Prompt mais simples para Base44
      const prompt = `
Analise os dados do sistema ImobiGest e forneça insights:

Total de usuários: ${systemData.users?.total || 0}
Total de imóveis: ${systemData.imoveis?.total || 0}
Usuários ativos: ${systemData.users?.active || 0}

Identifique problemas e recomendações para este sistema imobiliário.
`;

      return await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            status_geral: { type: "string" },
            problemas_identificados: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  categoria: { type: "string" },
                  severidade: { type: "string" },
                  descricao: { type: "string" },
                  solucao: { type: "string" }
                }
              }
            },
            recomendacoes: {
              type: "array",
              items: { type: "string" }
            },
            metricas_importantes: {
              type: "object",
              properties: {
                score_saude: { type: "number" },
                areas_atencao: {
                  type: "array",
                  items: { type: "string" }
                },
                pontos_fortes: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });
    };

    return await this.executeWithFallback(geminiAnalysis, base44Analysis);
  }

  async executeAgentTask(agentConfig, taskData) {
    const geminiExecution = async () => {
      return await geminiService.executeAgentTask(agentConfig, taskData);
    };

    const base44Execution = async () => {
      const prompt = `
Você é o agente "${agentConfig.nome}" com a função de "${agentConfig.role}".
Descrição: ${agentConfig.descricao}

Execute as seguintes tarefas:
${agentConfig.tarefas.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n')}

${agentConfig.prompt_sistema || ''}

Forneça um relatório estruturado da execução das tarefas com insights práticos.
`;

      return await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            status: { 
              type: "string", 
              enum: ["sucesso", "erro", "parcial"] 
            },
            tarefas_executadas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tarefa: { type: "string" },
                  status: { type: "string" },
                  resultado: { type: "string" },
                  detalhes: { type: "string" }
                }
              }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            },
            acoes_recomendadas: {
              type: "array", 
              items: { type: "string" }
            },
            dados_resultado: {
              type: "object",
              properties: {
                resumo: { type: "string" },
                metricas: { type: "string" },
                alertas: { type: "string" }
              }
            }
          }
        }
      });
    };

    return await this.executeWithFallback(geminiExecution, base44Execution);
  }

  getProviderStats() {
    return {
      gemini: geminiService.getUsageStats(),
      config: this.config,
      available_providers: {
        gemini: geminiService.isAvailable(),
        base44: true
      }
    };
  }

  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }

  // Método para reset de quota (apenas para testes/debug)
  resetGeminiQuota() {
    geminiService.resetQuotaStatus();
  }
}

export const aiService = new AIService();