import { MarketingConfig } from '@/api/entities';

class WebhookService {
  constructor() {
    this.config = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const configs = await MarketingConfig.list();
      this.config = configs.length > 0 ? configs[0] : null;
      this.isInitialized = true;
    } catch (error) {
      console.error('Erro ao inicializar WebhookService:', error);
    }
  }

  async sendWebhook(action, data) {
    await this.initialize();
    
    if (!this.config || !this.config.webhook_ativo || !this.config.webhook_url) {
      console.log('Webhook não configurado ou inativo');
      return;
    }

    const payload = {
      action: action, // 'created' | 'updated' | 'deleted'
      timestamp: new Date().toISOString(),
      data: data,
      source: 'ImobiGest',
      version: '1.0'
    };

    try {
      const response = await fetch(this.config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ImobiGest-Webhook/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('Webhook enviado com sucesso:', action, data.codigo || data.id);
      return { success: true, status: response.status };

    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      return { success: false, error: error.message };
    }
  }

  async onPropertyCreated(property) {
    return this.sendWebhook('created', this.sanitizeProperty(property));
  }

  async onPropertyUpdated(property) {
    return this.sendWebhook('updated', this.sanitizeProperty(property));
  }

  async onPropertyDeleted(property) {
    return this.sendWebhook('deleted', { 
      id: property.id, 
      codigo: property.codigo, 
      tipo: property.tipo 
    });
  }

  sanitizeProperty(property) {
    return {
      id: property.id,
      codigo: property.codigo,
      endereco: property.endereco,
      numero: property.numero,
      bairro: property.bairro,
      cidade: property.cidade,
      estado: property.estado,
      tipo: property.tipo,
      situacao: property.situacao,
      valor: property.valor,
      valor_condominio: property.valor_condominio,
      quartos: property.quartos,
      suites: property.suites,
      banheiros: property.banheiros,
      vagas: property.vagas,
      area_util_total: property.area_util_total,
      caracteristicas_extras: property.caracteristicas_extras,
      descricao: property.descricao,
      fotos: property.fotos,
      foto_principal: property.foto_principal,
      video_url: property.video_url,
      ativo: property.ativo,
      data_atualizacao: property.data_atualizacao,
      created_date: property.created_date,
      updated_date: property.updated_date
    };
  }
}

// Exportar instância singleton
export const webhookService = new WebhookService();
export default webhookService;