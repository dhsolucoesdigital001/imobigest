import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

import ImageUploader from './ImageUploader';
import RichTextEditor from './RichTextEditor';

export default function PortalModuleEditor({ module, onSave, onClose }) {
  const [currentConfig, setCurrentConfig] = useState(module.config || {});

  useEffect(() => {
    setCurrentConfig(module.config || {});
  }, [module]);

  const handleChange = (field, value) => {
    setCurrentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(module.id, currentConfig);
  };

  const renderFields = () => {
    switch(module.id) {
      case 'banner':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título Principal</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Encontre seu imóvel dos sonhos"
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input 
                value={currentConfig.subtitulo || ''} 
                onChange={(e) => handleChange('subtitulo', e.target.value)}
                placeholder="Ex: As melhores ofertas da cidade"
              />
            </div>
            <ImageUploader
              currentImageUrl={currentConfig.imagem_url}
              onImageChange={(url) => handleChange('imagem_url', url)}
              label="Imagem de Fundo do Banner"
              maxSize={2}
              maxWidth={1920}
              maxHeight={1080}
            />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fullscreen"
                  checked={currentConfig.fullscreen || false}
                  onCheckedChange={(checked) => handleChange('fullscreen', checked)}
                />
                <Label htmlFor="fullscreen">Banner em tela cheia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overlay"
                  checked={currentConfig.overlay || true}
                  onCheckedChange={(checked) => handleChange('overlay', checked)}
                />
                <Label htmlFor="overlay">Aplicar sobreposição escura</Label>
              </div>
            </div>
          </div>
        );

      case 'sobre':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título da Seção</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Sobre Nossa Empresa"
              />
            </div>
            <RichTextEditor
              value={currentConfig.conteudo}
              onChange={(value) => handleChange('conteudo', value)}
              label="Conteúdo"
              placeholder="Conte a história da sua imobiliária..."
              height="250px"
            />
            <ImageUploader
              currentImageUrl={currentConfig.imagem_url}
              onImageChange={(url) => handleChange('imagem_url', url)}
              label="Imagem da Seção (Opcional)"
              maxSize={1}
              maxWidth={800}
              maxHeight={600}
            />
          </div>
        );

      case 'contato':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título da Seção</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Entre em Contato"
              />
            </div>
            <div>
              <Label>Texto de Apoio</Label>
              <Textarea 
                value={currentConfig.texto_apoio || ''} 
                onChange={(e) => handleChange('texto_apoio', e.target.value)}
                placeholder="Ex: Estamos aqui para te ajudar a encontrar o imóvel perfeito!"
                rows={3}
              />
            </div>
            <div>
              <Label>Telefone Principal</Label>
              <Input 
                value={currentConfig.telefone || ''} 
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(31) 3333-4444"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input 
                value={currentConfig.whatsapp || ''} 
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="(31) 99999-8888"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input 
                value={currentConfig.email || ''} 
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contato@imobiliaria.com"
                type="email"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mostrar_formulario"
                checked={currentConfig.mostrar_formulario || false}
                onCheckedChange={(checked) => handleChange('mostrar_formulario', checked)}
              />
              <Label htmlFor="mostrar_formulario">Mostrar formulário de contato</Label>
            </div>
          </div>
        );

      case 'mapa':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título da Seção</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Nossa Localização"
              />
            </div>
            <div>
              <Label>URL do Google Maps (iframe)</Label>
              <Textarea 
                value={currentConfig.maps_iframe_url || ''} 
                onChange={(e) => handleChange('maps_iframe_url', e.target.value)}
                placeholder="Cole aqui o código embed do Google Maps..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Acesse google.com/maps, busque seu endereço, clique em "Compartilhar" → "Incorporar um mapa" e cole o código aqui.
              </p>
            </div>
            <div>
              <Label>Altura do Mapa</Label>
              <Select 
                value={currentConfig.altura || '400px'} 
                onValueChange={(value) => handleChange('altura', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300px">Baixo (300px)</SelectItem>
                  <SelectItem value="400px">Médio (400px)</SelectItem>
                  <SelectItem value="500px">Alto (500px)</SelectItem>
                  <SelectItem value="600px">Muito Alto (600px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'corretores':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título da Seção</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Nossa Equipe"
              />
            </div>
            <div>
              <Label>Subtítulo (Opcional)</Label>
              <Input 
                value={currentConfig.subtitulo || ''} 
                onChange={(e) => handleChange('subtitulo', e.target.value)}
                placeholder="Ex: Profissionais qualificados para te atender"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mostrar_creci"
                checked={currentConfig.mostrar_creci !== false}
                onCheckedChange={(checked) => handleChange('mostrar_creci', checked)}
              />
              <Label htmlFor="mostrar_creci">Mostrar número do CRECI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mostrar_contato"
                checked={currentConfig.mostrar_contato !== false}
                onCheckedChange={(checked) => handleChange('mostrar_contato', checked)}
              />
              <Label htmlFor="mostrar_contato">Mostrar botões de contato</Label>
            </div>
          </div>
        );

      case 'destaques':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título da Seção</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Imóveis em Destaque"
              />
            </div>
            <div>
              <Label>Modo de Seleção</Label>
              <Select 
                value={currentConfig.modo_selecao || 'automatico'} 
                onValueChange={(value) => handleChange('modo_selecao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatico">Automático (últimos cadastrados)</SelectItem>
                  <SelectItem value="manual">Manual (seleção específica)</SelectItem>
                  <SelectItem value="alto_valor">Maior valor</SelectItem>
                  <SelectItem value="destaque">Marcados como destaque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade de Imóveis</Label>
              <Select 
                value={String(currentConfig.quantidade || 6)} 
                onValueChange={(value) => handleChange('quantidade', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 imóveis</SelectItem>
                  <SelectItem value="6">6 imóveis</SelectItem>
                  <SelectItem value="9">9 imóveis</SelectItem>
                  <SelectItem value="12">12 imóveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'busca':
        return (
          <div className="space-y-6">
            <div>
              <Label>Título da Seção (Opcional)</Label>
              <Input 
                value={currentConfig.titulo || ''} 
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Encontre seu Imóvel"
              />
            </div>
            <div>
              <Label>Placeholder do Campo de Busca</Label>
              <Input 
                value={currentConfig.placeholder || ''} 
                onChange={(e) => handleChange('placeholder', e.target.value)}
                placeholder="Ex: Digite o bairro, cidade ou tipo de imóvel..."
              />
            </div>
            <div className="space-y-3">
              <Label>Filtros Disponíveis</Label>
              <div className="grid grid-cols-2 gap-3">
                {['cidade', 'bairro', 'tipo', 'situacao', 'valor', 'quartos'].map(filtro => (
                  <div key={filtro} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filtro_${filtro}`}
                      checked={currentConfig.filtros_ativos?.includes(filtro) || false}
                      onCheckedChange={(checked) => {
                        const filtrosAtuais = currentConfig.filtros_ativos || [];
                        if (checked) {
                          handleChange('filtros_ativos', [...filtrosAtuais, filtro]);
                        } else {
                          handleChange('filtros_ativos', filtrosAtuais.filter(f => f !== filtro));
                        }
                      }}
                    />
                    <Label htmlFor={`filtro_${filtro}`} className="capitalize">{filtro}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="py-8 text-center">
            <p className="text-gray-500">Este módulo não possui configurações editáveis.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Editando: {module.nome}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          {renderFields()}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}