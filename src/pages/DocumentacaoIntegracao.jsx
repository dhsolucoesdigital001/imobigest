import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Code, 
  Globe, 
  ArrowLeftRight, 
  Shield, 
  Database,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DocumentacaoIntegracao() {
  const [copiedText, setCopiedText] = useState("");
  const { toast } = useToast();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast({ title: "Copiado!", description: `${label} copiado para a área de transferência` });
    setTimeout(() => setCopiedText(""), 2000);
  };

  const CodeBlock = ({ children, language = "json", title = "" }) => (
    <div className="relative">
      {title && <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>}
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 uppercase">{language}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white"
            onClick={() => handleCopy(children, title || "Código")}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <pre className="text-sm text-gray-100 whitespace-pre-wrap">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">ImobiGest - Documentação de Integração</h1>
        <p className="text-xl text-gray-600">Guia completo para integração entre Painel Administrativo e Portal Público</p>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <FileText className="w-4 h-4 mr-2" />
          Versão 2.0 - Base44 Platform
        </Badge>
      </div>

      <Tabs defaultValue="architecture" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="architecture">Arquitetura</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
          <TabsTrigger value="payloads">Payloads</TabsTrigger>
          <TabsTrigger value="logs">Logs & Debug</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
        </TabsList>

        {/* Arquitetura Geral */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                Arquitetura Geral da Integração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-600">📤 Fluxo Push (Painel → Portal)</h3>
                  <p className="text-sm text-gray-600 mb-3">O Painel Administrativo envia ativamente (push) dados para o Portal Público sempre que ocorrem alterações.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Configurações do Portal:</strong> Alterações em nome, logo, cores, contatos e layout são enviadas via webhook.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Marketing Digital:</strong> IDs de pixels e tags (GA4, GTM) são sincronizados para rastreamento.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Imóveis:</strong> Criação, edição ou inativação de um imóvel dispara um webhook para o portal atualizar sua base.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">📥 Fluxo Pull (Portal → Painel)</h3>
                   <p className="text-sm text-gray-600 mb-3">O Portal Público envia dados para o Painel Administrativo, que os consome e armazena.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span><strong>Leads:</strong> Formulários de contato no portal enviam os dados do lead para o endpoint de recebimento no painel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span><strong>Estatísticas:</strong> O portal pode enviar eventos (page views, cliques) para o painel para análise de performance.</span>
                    </li>
                     <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span><strong>Status de Sincronização:</strong> O portal responde às solicitações de push com um status, que é logado no painel.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🔄 Como a Sincronização Acontece</h4>
                <p className="text-sm text-gray-600">
                  O painel dispara a sincronização (push) de forma automática ao salvar alterações nas seções relevantes (Portal, Marketing, Imóveis). O portal, ao receber os dados, deve processá-los, persistir em seu banco de dados e re-renderizar as seções afetadas para que as mudanças sejam refletidas em tempo real. A sincronização manual também pode ser forçada através do botão <strong>"Testar Sincronização"</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Endpoints Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Sync Endpoint */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default">POST</Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/public/update-settings</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>(Painel → Portal)</strong> Envia um payload completo com todas as configurações do portal. Usado para sincronização total.</p>
                  <div className="text-xs text-gray-500">
                    <p><strong>Headers:</strong> Authorization: Bearer {'{API_KEY}'}, Content-Type: application/json</p>
                  </div>
                </div>
                
                 {/* Imoveis Endpoint */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div><Badge>POST</Badge> <Badge variant="outline" className="ml-2">PUT</Badge> <Badge variant="destructive" className="ml-2">DELETE</Badge></div>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/imoveis</code> ou <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/imoveis/{'{id}'}</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>(Painel ↔ Portal)</strong> Webhook disparado pelo painel para notificar o portal sobre criação, atualização ou exclusão de um imóvel. O portal deve consumir essa informação para manter sua base de dados atualizada.</p>
                </div>

                {/* Leads Endpoint */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-500">POST</Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/public/leads</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>(Portal → Painel)</strong> Endpoint no painel para receber leads gerados no portal público.</p>
                   <div className="text-xs text-gray-500">
                    <p><strong>Response:</strong> 201 Created ou 400 Bad Request</p>
                  </div>
                </div>

                {/* Properties List */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">GET</Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/public/properties</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>(Portal)</strong> Endpoint exposto pelo portal para listagem pública de imóveis ativos.</p>
                  <div className="text-xs text-gray-500">
                    <p><strong>Query Params:</strong> ?limit=50&offset=0&situacao=Venda</p>
                  </div>
                </div>

                {/* Property Detail */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">GET</Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/public/properties/{'{id}'}</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>(Portal)</strong> Endpoint exposto pelo portal para exibir detalhes de um imóvel específico.</p>
                </div>

                {/* Portal Settings */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">GET</Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/public/portal-settings</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>(Portal)</strong> Endpoint exposto pelo portal para leitura das configurações que foram aplicadas.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autenticação */}
        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Sistema de Autenticação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Configuração Obrigatória</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  A integração requer configuração prévia da <strong>URL do Portal</strong> e <strong>API Key</strong> 
                  na seção "Portal Público Sync" do painel administrativo.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">🔐 Tipo de Autenticação</h3>
                <p className="text-sm">A comunicação entre Painel e Portal é protegida por um Bearer Token (API Key).</p>
                <CodeBlock title="Estrutura do Cabeçalho (Header)">
{`Authorization: Bearer YOUR_API_KEY_HERE
Content-Type: application/json
User-Agent: ImobiGest-Webhook/1.0`}
                </CodeBlock>

                <h3 className="font-semibold">⚙️ Onde Configurar no Painel</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Acesse <strong>Sistema → Portal Público Sync</strong>.</li>
                    <li>No campo <strong>URL do Portal</strong>, insira a URL base do seu portal público (ex: https://meusite.com).</li>
                    <li>No campo <strong>Chave de API (API Key)</strong>, insira o token fornecido pelo seu portal para autenticação.</li>
                    <li>Clique em <strong>"Salvar e Testar Sincronização"</strong> para validar as credenciais.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payloads */}
        <TabsContent value="payloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Modelos de Payload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="font-semibold text-lg">📤 Payload de Sincronização Completa</h3>
              <CodeBlock title="POST /api/public/update-settings">
{`{
  "estrutura": {
    "versao": "Completa",
    "layout": "Moderno",
    "modulos_home": [
      {
        "id": "hero",
        "nome": "Banner Principal",
        "ativo": true,
        "ordem": 1
      },
      {
        "id": "featured",
        "nome": "Imóveis Destaque",
        "ativo": true,
        "ordem": 2
      }
    ]
  },
  "aparencia": {
    "nome_imobiliaria": "ImobiGest",
    "logo_url": "https://example.com/logo.png",
    "favicon_url": "https://example.com/favicon.ico",
    "cores": {
      "primaria": "#3B82F6",
      "secundaria": "#1F2937"
    }
  },
  "conteudo": {
    "endereco_completo": "Av. Principal, 123 - Centro, Cidade/UF",
    "telefone_principal": "(11) 3333-4444",
    "whatsapp": "(11) 99999-8888",
    "email_contato": "contato@imobiliaria.com",
    "redes_sociais": {
      "facebook": "https://facebook.com/imobiliaria",
      "instagram": "https://instagram.com/imobiliaria"
    },
    "pagina_sobre": {
      "titulo": "Sobre Nós",
      "conteudo": "História da imobiliária...",
      "imagem_url": "https://example.com/sobre.jpg"
    }
  },
  "marketing": {
    "meta_pixel": "1234567890123456",
    "ga4": "G-XXXXXXXXXX",
    "google_ads": "AW-123456789",
    "gtm": "GTM-XXXXXXX",
    "tiktok": "C4A1A2A3A4A5A6",
    "taboola": "1234567",
    "pinterest": "1234567890"
  },
  "webhook": {
    "url": "https://webhooks.example.com/imobigest",
    "enabled": true
  },
  "webchat": {
    "enabled": true,
    "wabaId": "120363321234567890",
    "token": "your-websocket-token-here"
  }
}`}
              </CodeBlock>

              <h3 className="font-semibold text-lg">🏠 Payload de Imóvel Individual</h3>
              <p className="text-sm">Enviado via webhook quando um imóvel é criado, atualizado ou excluído.</p>
              <CodeBlock title="Webhook para /api/imoveis">
{`{
  "action": "updated", // created, updated, deleted
  "timestamp": "2024-05-21T14:30:00Z",
  "data": {
    "id": "66f7e4123abc456def789012",
    "codigo": 5581,
    "endereco": "Rua Coronel Belmiro Cruz, 844",
    "bairro": "Novo Progresso",
    "cidade": "Contagem",
    "tipo": "Casa",
    "situacao": "Venda",
    "valor": 900000,
    "quartos": 5,
    "banheiros": 2,
    "vagas": 0,
    "area_util_total": 360,
    "descricao": "Casa em excelente localização...",
    "fotos": [{ "url": "https://example.com/foto1.jpg", "principal": true }],
    "video_url": "https://youtube.com/watch?v=abc123",
    "ativo": true
  },
  "source": "ImobiGest",
  "version": "1.0"
}`}
              </CodeBlock>

              <h3 className="font-semibold text-lg">✅ Respostas Esperadas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <CodeBlock title="Sucesso (200 OK / 201 Created)">
{`{
  "status": "success",
  "message": "Sincronização recebida com sucesso.",
  "timestamp": "2024-05-21T14:30:01Z"
}`}
                </CodeBlock>
                
                <CodeBlock title="Erro (401/403/500)">
{`{
  "error": true,
  "status": 401,
  "message": "Token de autenticação inválido ou ausente."
}`}
                </CodeBlock>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs e Debug */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Monitoramento e Diagnóstico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="font-semibold">📋 Onde Encontrar os Logs</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Painel ImobiGest:</strong> Acesse <strong>Sistema → Portal Público Sync</strong> e clique na aba <strong>"Logs de Sincronização"</strong>.<br/>
                  <strong>Entidades no Banco de Dados:</strong> Os logs são armazenados na entidade <code>PortalSyncLog</code>.
                </p>
              </div>

              <h3 className="font-semibold">🔧 Como Testar a Integração</h3>
              <p className="text-sm">Na página <strong>Portal Público Sync</strong>, após salvar a URL e a API Key, clique no botão <strong>"Salvar e Testar Sincronização"</strong>. Isso dispara um payload de teste para a URL configurada e exibe o resultado (sucesso ou falha) em tempo real, além de registrar um log detalhado.</p>

              <h3 className="font-semibold">❗ Solução de Problemas Comuns</h3>
              <div className="space-y-3 text-sm">
                <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                  <p><strong>Erro 401 Unauthorized / 403 Forbidden</strong></p>
                  <p className="text-red-600"><strong>Causa:</strong> A API Key está incorreta, expirou ou não foi enviada no cabeçalho `Authorization`.<br/><strong>Solução:</strong> Verifique se a API Key no painel ImobiGest é idêntica à esperada pelo portal. Garanta que o header `Authorization: Bearer YOUR_API_KEY` está sendo enviado.</p>
                </div>
                <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
                  <p><strong>Erro de CORS</strong></p>
                  <p className="text-yellow-600"><strong>Causa:</strong> O servidor do portal público não está configurado para aceitar requisições do domínio do painel ImobiGest.<br/><strong>Solução:</strong> No backend do portal, adicione o domínio do painel (ex: `https://seu-painel.base44.app`) à lista de origens permitidas (Access-Control-Allow-Origin).</p>
                </div>
                 <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
                  <p><strong>Erro 500 Internal Server Error</strong></p>
                  <p className="text-orange-600"><strong>Causa:</strong> Ocorreu um erro no servidor do portal ao tentar processar o payload recebido.<br/><strong>Solução:</strong> Verifique os logs do servidor do portal para identificar a causa do erro. Pode ser um campo inesperado no JSON, um erro de banco de dados, etc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exemplos Práticos e Critérios de Aceitação */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Critérios de Aceitação e Exemplos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <h3 className="font-semibold text-lg">✅ Checklist de Validação</h3>
               <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span><strong>Sincronização em Tempo Real:</strong> Alterar o nome da imobiliária no painel e ver a mudança no portal em segundos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span><strong>Atualização de Imóveis:</strong> Mudar o preço de um imóvel no painel e confirmar a atualização no portal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span><strong>Criação de Imóveis:</strong> Cadastrar um novo imóvel (ativo) no painel e vê-lo aparecer na listagem do portal.</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span><strong>Geração de Leads:</strong> Preencher um formulário de contato no portal e ver o lead aparecer na seção "Leads" do painel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span><strong>Logs Detalhados:</strong> Toda operação de sincronização (sucesso ou falha) deve gerar um registro em "Portal Público Sync → Logs".</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span><strong>Diagnóstico Verde:</strong> Acessar "Sistema → Diagnóstico" e confirmar que o status da integração com o portal está "OK".</span>
                    </li>
                  </ul>
                </div>
              
              <h3 className="font-semibold text-lg">🚀 Cenário de Teste: Primeira Sincronização</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p><strong>Objetivo:</strong> Configurar e validar a comunicação inicial entre painel e portal.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>No painel, acesse <strong>Sistema → Portal Público Sync</strong>.</li>
                  <li>Preencha a <strong>URL do Portal</strong> e a <strong>API Key</strong>.</li>
                  <li>Clique em <strong>"Salvar e Testar Sincronização"</strong>.</li>
                  <li>Observe o feedback em tela: "Conexão bem-sucedida!".</li>
                  <li>Verifique a aba "Logs de Sincronização" e confirme o registro de "Sucesso".</li>
                  <li>No portal, verifique se as configurações básicas (nome da imobiliária, etc.) foram aplicadas.</li>
                </ol>
              </div>

              <h3 className="font-semibold text-lg">🔄 Cenário de Teste: Atualização de Imóvel</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p><strong>Objetivo:</strong> Garantir que a edição de um imóvel seja refletida no portal.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>No painel, acesse <strong>Cadastros → Imóveis</strong> e edite um imóvel existente.</li>
                  <li>Altere o preço e clique em <strong>"Atualizar"</strong>.</li>
                  <li>Acesse o portal público e localize o imóvel editado.</li>
                  <li>Confirme que o novo preço está sendo exibido.</li>
                  <li>(Opcional) Verifique os logs do webhook no servidor do portal para confirmar o recebimento do evento "updated".</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center py-8 border-t bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">
          © 2024 ImobiGest - Sistema de Gestão Imobiliária | Base44 Platform
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Documentação gerada automaticamente - Versão 2.0
        </p>
      </div>
    </div>
  );
}