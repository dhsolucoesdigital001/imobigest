class GeminiService {
  constructor() {
    // API Key hardcoded já que process.env não está disponível no frontend
    this.apiKey = "AIzaSyDVufc4bTv5WzVekMcuH4iQ9kkHJSnYENg";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.model = "gemini-1.5-flash"; // Mudança para modelo mais econômico
    this.requestCount = 0;
    this.dailyLimit = 50; // Limite muito conservador
    this.lastReset = new Date().toDateString();
    this.customApiKey = null;
    this.isQuotaExceeded = false;
    this.quotaResetTime = null;
    this.lastErrorTime = null;
  }

  // Método para configurar API Key via interface
  setApiKey(apiKey) {
    this.customApiKey = apiKey;
    // Reset quota status when changing key
    this.isQuotaExceeded = false;
    this.quotaResetTime = null;
  }

  // Método para obter a chave ativa
  getActiveApiKey() {
    return this.customApiKey || this.apiKey;
  }

  isAvailable() {
    // Não disponível se quota foi excedida recentemente
    if (this.isQuotaExceeded && this.quotaResetTime) {
      const now = new Date();
      if (now < this.quotaResetTime) {
        return false;
      }
      // Reset quota status se tempo passou
      this.isQuotaExceeded = false;
      this.quotaResetTime = null;
    }
    
    return !!this.getActiveApiKey() && !this.isQuotaExceeded;
  }

  checkQuota() {
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.requestCount = 0;
      this.lastReset = today;
    }
    return this.requestCount < this.dailyLimit;
  }

  handleQuotaError(error) {
    console.warn("Gemini quota exceeded, marking as unavailable:", error.message);
    this.isQuotaExceeded = true;
    this.lastErrorTime = new Date();
    
    // Set quota reset time (1 hour from now as safe margin)
    this.quotaResetTime = new Date(Date.now() + 60 * 60 * 1000);
    
    throw new Error("Google Gemini quota excedida. Usando Base44 como alternativa.");
  }

  async generateContent(prompt, options = {}) {
    const activeApiKey = this.getActiveApiKey();
    
    if (!activeApiKey) {
      throw new Error("Gemini API key não configurada");
    }

    if (!this.checkQuota()) {
      throw new Error("Limite diário local atingido");
    }

    if (this.isQuotaExceeded) {
      throw new Error("Quota do Gemini foi excedida. Tente novamente mais tarde.");
    }

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt.length > 8000 ? prompt.substring(0, 8000) + "..." : prompt // Limitar tamanho do prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 20, // Reduzido para economizar tokens
          topP: options.topP || 0.8, // Reduzido para economizar tokens
          maxOutputTokens: options.maxTokens || 1024, // Reduzido significativamente
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${activeApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        
        // Check for quota errors
        if (response.status === 429 || errorData.includes('quota') || errorData.includes('RESOURCE_EXHAUSTED')) {
          return this.handleQuotaError(new Error(`Quota Error: ${response.status} - ${errorData}`));
        }
        
        throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      this.requestCount++;
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        
        // Se foi solicitado JSON, tentar fazer parse
        if (options.responseFormat === 'json') {
          try {
            return JSON.parse(text);
          } catch (e) {
            // Se falhar o parse, retornar texto mesmo
            console.warn("Gemini retornou texto ao invés de JSON válido");
            return { content: text, error: "Invalid JSON format" };
          }
        }
        
        return text;
      }

      throw new Error("Resposta inválida da API Gemini");

    } catch (error) {
      // Check if it's a quota error
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return this.handleQuotaError(error);
      }
      
      console.error("Erro na API Gemini:", error);
      throw error;
    }
  }

  async analyzeSystem(systemData) {
    // Prompt mais conciso para economizar tokens
    const prompt = `
Analise este sistema imobiliário e retorne JSON:

DADOS: ${JSON.stringify(systemData, null, 0).substring(0, 2000)}

Retorne:
{
  "status_geral": "bom|regular|ruim",
  "problemas_identificados": [
    {"categoria": "dados", "severidade": "media", "descricao": "...", "solucao": "..."}
  ],
  "recomendacoes": ["..."],
  "metricas_importantes": {
    "score_saude": 80,
    "areas_atencao": ["..."],
    "pontos_fortes": ["..."]
  }
}`;

    return this.generateContent(prompt, { 
      responseFormat: 'json',
      temperature: 0.3,
      maxTokens: 800
    });
  }

  async executeAgentTask(agentConfig, taskData) {
    // Prompt mais conciso
    const prompt = `
Agente: ${agentConfig.nome} (${agentConfig.role})
Tarefa: ${agentConfig.tarefas[0] || 'Executar análise'}

Retorne JSON:
{
  "status": "sucesso",
  "tarefas_executadas": [
    {"tarefa": "...", "status": "concluida", "resultado": "...", "detalhes": "..."}
  ],
  "insights": ["..."],
  "dados_resultado": {"resumo": "..."}
}`;

    return this.generateContent(prompt, { 
      responseFormat: 'json',
      temperature: 0.4,
      maxTokens: 600
    });
  }

  getUsageStats() {
    return {
      requestCount: this.requestCount,
      dailyLimit: this.dailyLimit,
      remainingRequests: Math.max(0, this.dailyLimit - this.requestCount),
      lastReset: this.lastReset,
      quotaPercentage: Math.round((this.requestCount / this.dailyLimit) * 100),
      hasCustomKey: !!this.customApiKey,
      isActive: this.isAvailable(),
      isQuotaExceeded: this.isQuotaExceeded,
      quotaResetTime: this.quotaResetTime,
      lastErrorTime: this.lastErrorTime,
      model: this.model
    };
  }

  // Método para reset manual da quota (apenas para testes)
  resetQuotaStatus() {
    this.isQuotaExceeded = false;
    this.quotaResetTime = null;
    this.requestCount = 0;
  }
}

export const geminiService = new GeminiService();