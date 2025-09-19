import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ApiDocumentation() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Pública ImobiGest</h1>
        <p className="text-gray-600">
          Documentação completa da API headless para integração com portais externos.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Autenticação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Todas as requisições devem incluir o parâmetro <code>api_key</code>:</p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code>?api_key=YOUR_API_KEY</code>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Endpoints Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Portal Settings */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/ApiPortalSettings</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Retorna todas as configurações do portal (marketing, layout, contatos).
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs">
                <strong>Exemplo:</strong><br/>
                <code>/ApiPortalSettings?api_key=abc123</code>
              </div>
            </div>

            {/* Properties List */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/ApiProperties</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Lista imóveis ativos com suporte a filtros.
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs">
                <strong>Filtros disponíveis:</strong><br/>
                <code>bairro, cidade, tipo, situacao, quartos, banheiros, vagas, valor_min, valor_max, limit, offset</code>
                <br/><br/>
                <strong>Exemplo:</strong><br/>
                <code>/ApiProperties?api_key=abc123&tipo=Casa&bairro=Centro&quartos=3</code>
              </div>
            </div>

            {/* Property Details */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/ApiProperties?id={'{codigo}'}</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Detalhes completos de um imóvel específico.
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs">
                <strong>Exemplo:</strong><br/>
                <code>/ApiProperties?api_key=abc123&id=123</code>
              </div>
            </div>

            {/* Lead Creation */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">POST</Badge>
                <code className="text-sm">/ApiLeads</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Cria um novo lead no sistema.
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs">
                <strong>Parâmetros obrigatórios:</strong> nome, email, telefone<br/>
                <strong>Opcionais:</strong> mensagem, imovel_codigo<br/><br/>
                <strong>Exemplo:</strong><br/>
                <code>/ApiLeads?api_key=abc123&nome=João&email=joao@email.com&telefone=11999999999&imovel_codigo=123</code>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Webhook */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Webhook de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              O sistema pode enviar automaticamente dados de imóveis quando criados/atualizados.
            </p>
            <div className="bg-gray-100 p-3 rounded">
              <strong>Configure na tela Marketing Digital:</strong>
              <ul className="mt-2 text-sm">
                <li>• URL do Webhook</li>
                <li>• Ativar "Envio automático via webhook"</li>
              </ul>
            </div>
            <div className="mt-4 bg-blue-50 p-3 rounded text-sm">
              <strong>Payload enviado:</strong>
              <pre className="mt-2 text-xs">{`{
  "action": "created|updated|deleted",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": { /* dados do imóvel */ },
  "source": "ImobiGest",
  "version": "1.0"
}`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>🛡️ Segurança e CORS</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• <strong>API Key obrigatória:</strong> Configure uma chave de API segura</li>
              <li>• <strong>CORS:</strong> Apenas o domínio configurado em "Configuração de Domínios" pode acessar</li>
              <li>• <strong>Rate Limiting:</strong> Limite de requisições por minuto</li>
              <li>• <strong>Dados sanitizados:</strong> Apenas campos públicos são expostos</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}