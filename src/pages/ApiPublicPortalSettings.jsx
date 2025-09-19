import React, { useState, useEffect } from "react";
import { PortalConfig, MarketingConfig } from "@/api/entities";

export default function ApiPublicPortalSettings() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleApiRequest = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const apiKey = urlParams.get('api_key');
        
        if (!apiKey || apiKey !== 'imobigest_api_2024') {
          throw new Error('Chave de API inválida ou não fornecida.');
        }

        const [portalConfigs, marketingConfigs] = await Promise.all([
          PortalConfig.list().catch(() => []),
          MarketingConfig.list().catch(() => [])
        ]);

        const portalConfig = portalConfigs[0] || {};
        const marketingConfig = marketingConfigs[0] || {};

        const settingsResponse = {
          portal: {
            nome_imobiliaria: portalConfig.nome_imobiliaria || "Lar Imóveis",
            layout: portalConfig.layout || "Moderno",
            logo_url: portalConfig.logo_url,
            favicon_url: portalConfig.favicon_url,
            endereco_completo: portalConfig.endereco_completo,
            telefone_principal: portalConfig.telefone_principal,
            whatsapp: portalConfig.whatsapp,
            email_contato: portalConfig.email_contato,
            redes_sociais: portalConfig.redes_sociais,
          },
          marketing: {
            pixel_meta: marketingConfig.pixel_meta,
            google_analytics: marketingConfig.google_analytics,
            google_ads: marketingConfig.google_ads,
            google_tag_manager: marketingConfig.google_tag_manager,
            tiktok_pixel: marketingConfig.tiktok_pixel,
            taboola_tag: marketingConfig.taboola_tag,
            pinterest_tag: marketingConfig.pinterest_tag,
            rastreamento_ativo: marketingConfig.rastreamento_ativo,
          },
          webchat: {
            enabled: marketingConfig.tech_atende_ativo,
            waba_id: marketingConfig.tech_atende_waba_id,
            websocket_token: marketingConfig.tech_atende_token,
          },
          content: {
            pagina_sobre: portalConfig.pagina_sobre,
            pagina_contato: portalConfig.pagina_contato,
            politica_privacidade: portalConfig.politica_privacidade,
            termos_uso: portalConfig.termos_uso,
          },
          timestamp: new Date().toISOString()
        };

        setResponse(settingsResponse);

      } catch (e) {
        setError(e.message);
      }
    };

    handleApiRequest();
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: '20px' }}>
      <pre>
        {error 
          ? JSON.stringify({ success: false, error: error }, null, 2)
          : JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}