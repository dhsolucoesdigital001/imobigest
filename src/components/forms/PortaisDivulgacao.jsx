import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Star, Crown, Check, AlertCircle, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const portaisConfig = {
  vivareal: { 
    nome: 'VivaReal', 
    cor: 'bg-orange-100 text-orange-800', 
    icon: '🏠',
    description: 'Maior portal imobiliário do Brasil'
  },
  zap: { 
    nome: 'Zap Imóveis', 
    cor: 'bg-blue-100 text-blue-800', 
    icon: '⚡',
    description: 'Portal premium da OLX Brasil'
  },
  imovelweb: { 
    nome: 'ImovelWeb', 
    cor: 'bg-purple-100 text-purple-800', 
    icon: '🌐',
    description: 'Portal líder na América Latina'
  },
  casamineira: { 
    nome: 'Casa Mineira', 
    cor: 'bg-green-100 text-green-800', 
    icon: '🏡',
    description: 'Portal regional de Minas Gerais'
  },
  chavesnamao: { 
    nome: 'Chaves na Mão', 
    cor: 'bg-red-100 text-red-800', 
    icon: '🗝️',
    description: 'Portal nacional especializado'
  },
  olx: { 
    nome: 'OLX', 
    cor: 'bg-indigo-100 text-indigo-800', 
    icon: '📱',
    description: 'Classificados online líder'
  },
  quintoandar: { 
    nome: 'Quinto Andar', 
    cor: 'bg-teal-100 text-teal-800', 
    icon: '🏢',
    description: 'Plataforma de aluguel digital'
  },
  loft: { 
    nome: 'Loft', 
    cor: 'bg-pink-100 text-pink-800', 
    icon: '🏗️',
    description: 'Startup de compra e venda'
  },
  tata: { 
    nome: 'Tata', 
    cor: 'bg-yellow-100 text-yellow-800', 
    icon: '⭐',
    description: 'Plataforma de venda digital'
  }
};

const tiposAnuncio = {
  'Padrão': { icon: Check, cor: 'text-gray-600' },
  'Premium': { icon: Star, cor: 'text-yellow-600' },
  'Destaque': { icon: Crown, cor: 'text-purple-600' }
};

const statusIcons = {
  'publicado': { icon: CheckCircle2, cor: 'text-green-600', label: 'Publicado' },
  'pendente': { icon: Clock, cor: 'text-yellow-600', label: 'Pendente' },
  'erro': { icon: XCircle, cor: 'text-red-600', label: 'Erro' },
  'removido': { icon: XCircle, cor: 'text-gray-600', label: 'Removido' }
};

export default function PortaisDivulgacao({ portais, onPortaisChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const { toast } = useToast();

  // Garantir que portais sempre tenha um objeto válido com valores padrão
  const portaisSeguro = portais || Object.fromEntries(
    Object.keys(portaisConfig).map(key => [
      key, 
      { 
        ativo: false, 
        tipo_anuncio: 'Padrão', 
        id_externo: '', 
        status: 'pendente',
        data_publicacao: null,
        erro_mensagem: ''
      }
    ])
  );

  const handlePortalChange = async (portal, field, value) => {
    const newPortais = {
      ...portaisSeguro,
      [portal]: {
        ...portaisSeguro[portal],
        [field]: value
      }
    };

    // Se estiver ativando um portal, validar requisitos
    if (field === 'ativo' && value === true) {
      const validacao = await validarPortal(portal, newPortais[portal]);
      if (!validacao.valido) {
        toast({
          title: "Erro de Validação",
          description: validacao.mensagem,
          variant: "destructive"
        });
        return;
      }
      
      // Atualizar status para pendente quando ativar
      newPortais[portal].status = 'pendente';
      newPortais[portal].data_publicacao = new Date().toISOString();
    }

    // Se estiver desativando, marcar como removido
    if (field === 'ativo' && value === false) {
      newPortais[portal].status = 'removido';
    }

    onPortaisChange(newPortais);

    // Simular publicação automática
    if (field === 'ativo' && value === true) {
      await simularPublicacao(portal, newPortais);
    }
  };

  const validarPortal = async (portal, config) => {
    // Validações específicas por portal
    switch (portal) {
      case 'vivareal':
      case 'zap':
        // Verificar se tem contrato ativo (simulado)
        return {
          valido: true,
          mensagem: 'Validação OK'
        };
      
      case 'quintoandar':
        // Verificar se o tipo de negócio é aluguel
        return {
          valido: true,
          mensagem: 'Portal focado em locação'
        };
      
      default:
        return { valido: true, mensagem: 'OK' };
    }
  };

  const simularPublicacao = async (portal, portaisAtualizados) => {
    setIsUpdating(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso/erro aleatório (90% sucesso)
      const sucesso = Math.random() > 0.1;
      
      const novoStatus = sucesso ? 'publicado' : 'erro';
      const mensagemErro = sucesso ? '' : 'Erro na validação do XML. Verifique as informações do imóvel.';

      const portaisAtualizadosComStatus = {
        ...portaisAtualizados,
        [portal]: {
          ...portaisAtualizados[portal],
          status: novoStatus,
          erro_mensagem: mensagemErro,
          id_externo: sucesso ? `EXT_${Math.random().toString(36).substr(2, 9).toUpperCase()}` : ''
        }
      };

      onPortaisChange(portaisAtualizadosComStatus);
      setLastSync(new Date());

      if (sucesso) {
        toast({
          title: "Publicado com Sucesso",
          description: `Imóvel publicado no ${portaisConfig[portal].nome}`,
        });
      } else {
        toast({
          title: "Erro na Publicação",
          description: mensagemErro,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro na publicação:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar com o portal. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const sincronizarTodos = async () => {
    setIsUpdating(true);
    const portaisAtivos = Object.entries(portaisSeguro).filter(([_, config]) => config.ativo);
    
    for (const [portal, config] of portaisAtivos) {
      await simularPublicacao(portal, portaisSeguro);
    }
    
    toast({
      title: "Sincronização Concluída",
      description: `${portaisAtivos.length} portais sincronizados.`
    });
    setIsUpdating(false);
  };

  const getPortaisAtivos = () => {
    return Object.keys(portaisSeguro).filter(portal => portaisSeguro[portal]?.ativo);
  };

  const getStatusResumo = () => {
    const portaisAtivos = getPortaisAtivos();
    const publicados = portaisAtivos.filter(portal => portaisSeguro[portal]?.status === 'publicado').length;
    const erros = portaisAtivos.filter(portal => portaisSeguro[portal]?.status === 'erro').length;
    return { total: portaisAtivos.length, publicados, erros };
  };

  const statusResumo = getStatusResumo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Portais de Divulgação</h3>
            <p className="text-sm text-gray-600">Configure onde este imóvel será anunciado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {lastSync && (
            <span className="text-xs text-gray-500">
              Última sincronização: {lastSync.toLocaleTimeString()}
            </span>
          )}
          
          <Button
            onClick={sincronizarTodos}
            disabled={isUpdating || getPortaisAtivos().length === 0}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Sincronizar Todos
          </Button>
        </div>
      </div>

      {/* Resumo de Status */}
      {statusResumo.total > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Resumo da Divulgação</h4>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-800">
                  {statusResumo.publicados} Publicados
                </Badge>
                {statusResumo.erros > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {statusResumo.erros} com Erro
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Portais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(portaisConfig).map(([key, config]) => {
          const portal = portaisSeguro[key] || { 
            ativo: false, 
            tipo_anuncio: 'Padrão', 
            id_externo: '', 
            status: 'pendente',
            data_publicacao: null,
            erro_mensagem: ''
          };
          
          const IconComponent = tiposAnuncio[portal.tipo_anuncio]?.icon || Check;
          const StatusIcon = statusIcons[portal.status]?.icon || Clock;
          
          return (
            <Card 
              key={key} 
              className={`border-2 transition-all ${
                portal.ativo 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <span className="font-medium">{config.nome}</span>
                      <p className="text-xs text-gray-500 font-normal">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`portal_${key}`}
                      checked={portal.ativo}
                      onCheckedChange={(checked) => handlePortalChange(key, 'ativo', checked)}
                      disabled={isUpdating}
                    />
                  </div>
                </CardTitle>
              </CardHeader>

              {portal.ativo && (
                <CardContent className="pt-0 space-y-4">
                  {/* Status do Portal */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${statusIcons[portal.status]?.cor}`} />
                      <span className="text-sm font-medium">
                        {statusIcons[portal.status]?.label}
                      </span>
                    </div>
                    {portal.id_externo && (
                      <span className="text-xs text-gray-500">
                        ID: {portal.id_externo}
                      </span>
                    )}
                  </div>

                  {/* Mensagem de Erro */}
                  {portal.status === 'erro' && portal.erro_mensagem && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{portal.erro_mensagem}</p>
                      </div>
                    </div>
                  )}

                  {/* Configurações Avançadas */}
                  <div>
                    <Label className="text-sm font-medium">Tipo de Anúncio</Label>
                    <Select 
                      value={portal.tipo_anuncio} 
                      onValueChange={(value) => handlePortalChange(key, 'tipo_anuncio', value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(tiposAnuncio).map(([tipo, config]) => (
                          <SelectItem key={tipo} value={tipo}>
                            <div className="flex items-center gap-2">
                              <config.icon className={`w-4 h-4 ${config.cor}`} />
                              {tipo}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Informações de Data */}
                  {portal.data_publicacao && (
                    <div className="text-xs text-gray-500">
                      Publicado em: {new Date(portal.data_publicacao).toLocaleString('pt-BR')}
                    </div>
                  )}

                  {/* Footer com Badge do Portal */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge className={config.cor}>
                      {config.nome}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${tiposAnuncio[portal.tipo_anuncio]?.cor} border-current`}
                    >
                      <IconComponent className="w-3 h-3 mr-1" />
                      {portal.tipo_anuncio}
                    </Badge>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Avisos Importantes */}
      {getPortaisAtivos().some(portal => 
        ['vivareal', 'zap'].includes(portal) && 
        (portaisSeguro[portal]?.tipo_anuncio === 'Premium' || portaisSeguro[portal]?.tipo_anuncio === 'Destaque')
      ) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Atenção - Planos Premium</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Anúncios Premium e Destaque podem exigir planos específicos nos portais VivaReal e Zap Imóveis. 
                  Verifique se sua imobiliária possui os planos adequados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkbox para ativar no portal público */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="imovel_ativo"
              checked={true} // This would come from formData.ativo
              // onCheckedChange={...} // This would update formData.ativo
            />
            <div>
              <label htmlFor="imovel_ativo" className="text-sm font-medium text-blue-900">
                Imóvel Ativo no Portal Público
              </label>
              <p className="text-xs text-blue-700">
                Marque para exibir este imóvel no seu site público
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}