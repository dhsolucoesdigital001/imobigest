
import React, { useState, useEffect, useCallback } from "react";
import { PortalConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, GripVertical, Eye, EyeOff, Edit, Plus, Globe, Palette, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import PortalModuleEditor from "../components/portal/PortalModuleEditor";
import RichTextEditor from "../components/portal/RichTextEditor";
import LogoUploader from "../components/portal/LogoUploader";
import FaviconUploader from "../components/portal/FaviconUploader";

const availableModules = [
  { 
    id: 'banner', 
    nome: 'Banner Principal', 
    icon: '🏠',
    config: { 
      titulo: 'Encontre seu imóvel dos sonhos', 
      subtitulo: 'As melhores ofertas da cidade.', 
      imagem_url: '',
      fullscreen: true,
      overlay: true 
    } 
  },
  { 
    id: 'busca', 
    nome: 'Barra de Busca', 
    icon: '🔍',
    config: { 
      titulo: '', 
      placeholder: 'Digite o bairro, cidade ou tipo de imóvel...',
      filtros_ativos: ['cidade', 'bairro', 'tipo', 'situacao', 'valor']
    } 
  },
  { 
    id: 'destaques', 
    nome: 'Imóveis em Destaque', 
    icon: '⭐',
    config: { 
      titulo: 'Nossos Destaques',
      modo_selecao: 'automatico',
      quantidade: 6
    } 
  },
  { 
    id: 'sobre', 
    nome: 'Sobre a Empresa', 
    icon: '📋',
    config: { 
      titulo: 'Sobre Nossa Empresa',
      conteudo: '<p>Conte aqui a história da sua imobiliária...</p>',
      imagem_url: ''
    } 
  },
  { 
    id: 'mapa', 
    nome: 'Mapa Interativo', 
    icon: '🗺️',
    config: { 
      titulo: 'Nossa Localização',
      maps_iframe_url: '',
      altura: '400px'
    } 
  },
  { 
    id: 'contato', 
    nome: 'Contato Rápido', 
    icon: '📞',
    config: { 
      titulo: 'Entre em Contato',
      texto_apoio: 'Estamos aqui para te ajudar!',
      telefone: '',
      whatsapp: '',
      email: '',
      mostrar_formulario: true
    } 
  },
  { 
    id: 'corretores', 
    nome: 'Nossa Equipe', 
    icon: '👥',
    config: { 
      titulo: 'Nossa Equipe de Especialistas',
      subtitulo: 'Profissionais qualificados para te atender',
      mostrar_creci: true,
      mostrar_contato: true
    } 
  },
];

export default function AdminPortalSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // New state for saving status
  const [configId, setConfigId] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [activeTab, setActiveTab] = useState("estrutura");
  const { toast } = useToast();

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const configs = await PortalConfig.list();
      if (configs.length > 0) {
        const configData = configs[0];
        // Garantir que modulos_home seja sempre um array
        if (!configData.modulos_home || !Array.isArray(configData.modulos_home)) {
          configData.modulos_home = [
            { id: 'banner', nome: 'Banner Principal', ativo: true, ordem: 0, config: availableModules[0].config },
            { id: 'busca', nome: 'Barra de Busca', ativo: true, ordem: 1, config: availableModules[1].config },
            { id: 'destaques', nome: 'Imóveis em Destaque', ativo: true, ordem: 2, config: availableModules[2].config },
          ];
        }
        // Garantir outras propriedades padrão
        if (!configData.redes_sociais) {
          configData.redes_sociais = { facebook: '', instagram: '', linkedin: '', youtube: '' };
        }
        setConfig(configData);
        setConfigId(configData.id);
      } else {
        const newConfigData = { 
          versao: 'Completa', 
          layout: 'Moderno',
          nome_imobiliaria: 'ImobiGest',
          endereco_completo: 'Av. Principal, 123 - Cabral, Contagem/MG',
          telefone_principal: '(31) 3333-4444',
          whatsapp: '(31) 99999-8888',
          email_contato: 'contato@imobigest.com',
          redes_sociais: { facebook: '', instagram: '', linkedin: '', youtube: '' },
          modulos_home: [
            { id: 'banner', nome: 'Banner Principal', ativo: true, ordem: 0, config: availableModules[0].config },
            { id: 'busca', nome: 'Barra de Busca', ativo: true, ordem: 1, config: availableModules[1].config },
            { id: 'destaques', nome: 'Imóveis em Destaque', ativo: true, ordem: 2, config: availableModules[2].config },
          ],
          pagina_sobre: {
            titulo: 'Sobre Nós',
            conteudo: '<p>Conte aqui a história da sua imobiliária...</p>',
            imagem_url: ''
          },
          pagina_contato: {
            titulo: 'Entre em Contato',
            texto_apoio: 'Estamos prontos para te atender!',
            mapa_iframe_url: ''
          },
          politica_privacidade: '<p>Sua política de privacidade aqui...</p>',
          termos_uso: '<p>Seus termos de uso aqui...</p>'
        };
        const createdConfig = await PortalConfig.create(newConfigData);
        setConfig(createdConfig);
        setConfigId(createdConfig.id);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as configurações.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    if (!config) return; // Ensure config is loaded
    setSaving(true);
    try {
      if (config.id) { // Use config.id for consistency
        await PortalConfig.update(config.id, config);
      } else {
        await PortalConfig.create(config);
      }
      toast({
        title: "Configurações salvas!",
        description: "As configurações do portal foram atualizadas."
      });
      
      await loadConfig(); // Reload config to ensure ID is set for new entries, and state is fresh
      
      // Sincronizar com portal público automaticamente
      try {
        const { portalSyncService } = await import("../components/services/portalSyncService");
        await portalSyncService.onPortalConfigUpdated();
        
        toast({
          title: "Portal sincronizado",
          description: "As alterações foram enviadas automaticamente para o portal público."
        });
      } catch (syncError) {
        console.error('Erro na sincronização:', syncError);
        toast({
          title: "Aviso",
          description: "Configurações salvas, mas houve erro na sincronização automática com o portal.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (parent, key, value) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(config.modulos_home || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({ ...item, ordem: index }));
    setConfig(prev => ({ ...prev, modulos_home: updatedItems }));
  };

  const toggleModuleStatus = (moduleId) => {
    const modulosHome = config.modulos_home || [];
    const updatedModules = modulosHome.map(m => 
      m.id === moduleId ? { ...m, ativo: !m.ativo } : m
    );
    setConfig(prev => ({ ...prev, modulos_home: updatedModules }));
  };

  const addModule = (moduleToAdd) => {
    const modulosHome = config.modulos_home || [];
    const newModule = {
      ...moduleToAdd,
      ativo: true,
      ordem: modulosHome.length,
    };
    setConfig(prev => ({ ...prev, modulos_home: [...modulosHome, newModule] }));
  };

  const handleUpdateModuleConfig = (moduleId, newModuleConfig) => {
    const modulosHome = config.modulos_home || [];
    const updatedModules = modulosHome.map(m => 
      m.id === moduleId ? { ...m, config: newModuleConfig } : m
    );
    setConfig(prev => ({ ...prev, modulos_home: updatedModules }));
    setEditingModule(null);
  };
  
  if (loading || !config) {
    return <div className="p-6">Carregando editor do portal...</div>;
  }

  // Garantir que modulos_home seja um array válido antes de renderizar
  const modulosHome = config.modulos_home || [];
  const redesSociais = config.redes_sociais || {};
  const paginaSobre = config.pagina_sobre || {};
  const paginaContato = config.pagina_contato || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor do Portal Público</h1>
            <p className="text-gray-600 mt-1">Personalize completamente seu site imobiliário</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading || saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {editingModule && (
        <PortalModuleEditor
          module={editingModule}
          onSave={handleUpdateModuleConfig}
          onClose={() => setEditingModule(null)}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estrutura" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Estrutura
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="conteudo" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estrutura" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Estrutura da Página Inicial</CardTitle>
                  <CardDescription>Arraste para reordenar, ative ou desative os módulos da sua home.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="modules">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {modulosHome.sort((a,b) => a.ordem - b.ordem).map((mod, index) => (
                            <Draggable key={mod.id} draggableId={mod.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center p-4 border rounded-lg transition-all ${
                                    mod.ativo ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab p-2">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-xl">
                                      {availableModules.find(am => am.id === mod.id)?.icon || '📄'}
                                    </span>
                                    <span className={`font-medium ${mod.ativo ? 'text-gray-800' : 'text-gray-500'}`}>
                                      {mod.nome}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingModule(mod)}>
                                      <Edit className="w-4 h-4 mr-1" /> Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => toggleModuleStatus(mod.id)}>
                                      {mod.ativo ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                                      {mod.ativo ? 'Ativo' : 'Inativo'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Adicionar Módulos</CardTitle>
                  <CardDescription>Clique para adicionar novos blocos à sua página inicial.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {availableModules.filter(am => !modulosHome.some(m => m.id === am.id)).map(mod => (
                    <Button key={mod.id} variant="outline" onClick={() => addModule(mod)} className="flex items-center gap-2">
                      <span>{mod.icon}</span>
                      <Plus className="w-4 h-4" />
                      {mod.nome}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Versão do Portal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Portal</Label>
                    <Select value={config.versao} onValueChange={(v) => handleChange('versao', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Simplificada">
                          <div className="flex flex-col">
                            <span className="font-medium">Simplificada</span>
                            <span className="text-xs text-gray-500">Landing page + listagem básica</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Completa">
                          <div className="flex flex-col">
                            <span className="font-medium">Completa</span>
                            <span className="text-xs text-gray-500">Todos os recursos + mapa + corretores</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Layout Visual</CardTitle>
                <CardDescription>Escolha o estilo visual do seu portal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Estilo do Layout</Label>
                  <Select value={config.layout} onValueChange={(v) => handleChange('layout', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clássico">
                        <div className="flex flex-col">
                          <span className="font-medium">Clássico</span>
                          <span className="text-xs text-gray-500">Menu superior fixo, estrutura tradicional</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Moderno">
                        <div className="flex flex-col">
                          <span className="font-medium">Moderno</span>
                          <span className="text-xs text-gray-500">Banner fullscreen, visual dinâmico</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Minimalista">
                        <div className="flex flex-col">
                          <span className="font-medium">Minimalista</span>
                          <span className="text-xs text-gray-500">Foco em imóveis, design limpo</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Configure logo e cores da marca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Nome da Imobiliária</Label>
                  <Input
                    value={config.nome_imobiliaria}
                    onChange={(e) => handleChange('nome_imobiliaria', e.target.value)}
                    placeholder="Nome da sua imobiliária"
                  />
                </div>
                
                <LogoUploader
                  currentImageUrl={config.logo_url}
                  onImageChange={(url) => handleChange('logo_url', url)}
                  label="Logo da Imobiliária"
                  acceptedTypes={['.png', '.jpg', '.jpeg', '.svg']}
                  maxSize={2}
                />
                
                <FaviconUploader
                  currentImageUrl={config.favicon_url}
                  onImageChange={(url) => handleChange('favicon_url', url)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-6">
          <div className="grid gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Página "Sobre Nós"</CardTitle>
                <CardDescription>Configure o conteúdo da página institucional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Título da Página</Label>
                  <Input
                    value={paginaSobre.titulo || ''}
                    onChange={(e) => handleNestedChange('pagina_sobre', 'titulo', e.target.value)}
                    placeholder="Sobre Nossa Empresa"
                  />
                </div>
                <RichTextEditor
                  value={paginaSobre.conteudo || ''}
                  onChange={(value) => handleNestedChange('pagina_sobre', 'conteudo', value)}
                  label="Conteúdo da Página"
                  placeholder="Conte a história da sua imobiliária..."
                  height="300px"
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Políticas e Termos</CardTitle>
                <CardDescription>Configure as páginas legais do seu site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RichTextEditor
                  value={config.politica_privacidade || ''}
                  onChange={(value) => handleChange('politica_privacidade', value)}
                  label="Política de Privacidade"
                  placeholder="Sua política de privacidade..."
                  height="250px"
                />
                <RichTextEditor
                  value={config.termos_uso || ''}
                  onChange={(value) => handleChange('termos_uso', value)}
                  label="Termos de Uso"
                  placeholder="Seus termos de uso..."
                  height="250px"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Configure os dados de contato da imobiliária</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Endereço Completo</Label>
                  <Input
                    value={config.endereco_completo}
                    onChange={(e) => handleChange('endereco_completo', e.target.value)}
                    placeholder="Av. Principal, 123 - Bairro, Cidade/UF"
                  />
                </div>
                <div>
                  <Label>Telefone Principal</Label>
                  <Input
                    value={config.telefone_principal}
                    onChange={(e) => handleChange('telefone_principal', e.target.value)}
                    placeholder="(31) 3333-4444"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={config.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="(31) 99999-8888"
                  />
                </div>
                <div>
                  <Label>E-mail de Contato</Label>
                  <Input
                    value={config.email_contato}
                    onChange={(e) => handleChange('email_contato', e.target.value)}
                    placeholder="contato@imobiliaria.com"
                    type="email"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Links para suas redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={redesSociais.facebook || ''}
                    onChange={(e) => handleNestedChange('redes_sociais', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/suaimobiliaria"
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={redesSociais.instagram || ''}
                    onChange={(e) => handleNestedChange('redes_sociais', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/suaimobiliaria"
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={redesSociais.linkedin || ''}
                    onChange={(e) => handleNestedChange('redes_sociais', 'linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/suaimobiliaria"
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={redesSociais.youtube || ''}
                    onChange={(e) => handleNestedChange('redes_sociais', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/@suaimobiliaria"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
