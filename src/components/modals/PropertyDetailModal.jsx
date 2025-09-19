import React, { useState, useEffect, useCallback } from "react";
import { Imovel, Proprietario, User as UserEntity } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit, Building2, MapPin, DollarSign, User, Bed, Bath, Car, Square, Sparkles, FileText, Camera, Shield, Link as LinkIcon, AlertTriangle, Info, ListChecks, Star, Play, Globe, X
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="flex items-center text-sm text-gray-500 gap-2 mb-1">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <p className="text-md font-semibold text-gray-800 break-words">{value || "Não informado"}</p>
  </div>
);

const statusColors = {
  'Disponível': 'bg-green-100 text-green-800 border-green-200',
  'Visitado': 'bg-blue-100 text-blue-800 border-blue-200',
  'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Vendido': 'bg-purple-100 text-purple-800 border-purple-200',
  'Alugado': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Reservado': 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function PropertyDetailModal({ propertyId, onClose }) {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [proprietario, setProprietario] = useState(null);
  const [captadores, setCaptadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const loadPropertyDetails = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);
    setProperty(null);
    setProprietario(null);
    setCaptadores([]);

    try {
      const foundProperty = await Imovel.get(propertyId);
      
      if (!foundProperty) {
        setError(`Imóvel com ID #${propertyId} não encontrado.`);
        setLoading(false);
        return;
      }
      
      setProperty(foundProperty);

      if (foundProperty.proprietario_id) {
        try {
            const foundProprietario = await Proprietario.get(foundProperty.proprietario_id);
            setProprietario(foundProprietario);
        } catch (e) { console.error("Proprietário não encontrado", e)}
      }

      if (foundProperty.captadores && Array.isArray(foundProperty.captadores)) {
        const allUsers = await UserEntity.list().catch(() => []);
        const captadoresData = foundProperty.captadores.map(captador => {
          const usuario = allUsers.find(u => u.id === captador.user_id);
          return { 
            ...captador, 
            nome: usuario?.full_name || captador.nome || 'Nome não encontrado'
          };
        });
        setCaptadores(captadoresData);
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes do imóvel:", err);
      setError("Ocorreu um erro ao buscar os dados do imóvel. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadPropertyDetails();
  }, [loadPropertyDetails]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800">Erro ao Carregar Imóvel</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      );
    }

    if (!property) {
      return (
        <div className="p-6 text-center space-y-4">
          <Building2 className="w-16 h-16 mx-auto text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800">Imóvel Não Encontrado</h2>
        </div>
      );
    }

    return (
      <>
        <DialogHeader className="pr-12">
            <DialogTitle className="text-2xl font-bold text-gray-900">
                Imóvel #{property.codigo}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 pt-1">
                <span>{property.tipo} para {property.situacao}</span>
                <Badge className={statusColors[property.estagio] || 'bg-gray-100 text-gray-800'}>
                    {property.estagio}
                </Badge>
                {!property.ativo && (
                    <Badge variant="destructive">Inativo</Badge>
                )}
            </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
             <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 sticky top-0 bg-white z-10">
                    <TabsTrigger value="overview">Básicos</TabsTrigger>
                    <TabsTrigger value="features">Características</TabsTrigger>
                    <TabsTrigger value="owner">Proprietário</TabsTrigger>
                    <TabsTrigger value="docs">Docs & Interno</TabsTrigger>
                    <TabsTrigger value="media">Mídia & Portais</TabsTrigger>
                </TabsList>
                
                {/* Content for each tab */}
                <div className="mt-4 space-y-4">
                    <TabsContent value="overview" className="space-y-4 m-0">
                        {/* Values Card */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Valores</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                <DetailItem icon={DollarSign} label={`Valor de ${property.situacao}`} value={formatCurrency(property.valor)} />
                                <DetailItem icon={Building2} label="Condomínio" value={formatCurrency(property.valor_condominio)} />
                                <DetailItem icon={FileText} label="IPTU (anual)" value={formatCurrency(property.valor_iptu)} />
                            </CardContent>
                        </Card>
                         {/* Location Card */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Localização</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <DetailItem 
                                icon={MapPin} 
                                label="Endereço Completo" 
                                value={`${property.endereco || ''}${property.numero ? `, ${property.numero}` : ''}${property.complemento ? `, ${property.complemento}` : ''}`} 
                                />
                                <div className="grid md:grid-cols-4 gap-4">
                                    <DetailItem icon={Info} label="Bairro" value={property.bairro} />
                                    <DetailItem icon={Info} label="Cidade" value={property.cidade} />
                                    <DetailItem icon={Info} label="Estado" value={property.estado} />
                                    <DetailItem icon={Info} label="CEP" value={property.cep} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-4 m-0">
                        {/* Main Features */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Principais Características</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-4 gap-4">
                                <DetailItem icon={Bed} label="Quartos" value={property.quartos} />
                                <DetailItem icon={Shield} label="Suítes" value={property.suites} />
                                <DetailItem icon={Bath} label="Banheiros" value={property.banheiros} />
                                <DetailItem icon={Car} label="Vagas" value={property.vagas} />
                            </CardContent>
                        </Card>
                        {/* Areas */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Áreas e Medidas</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                <DetailItem icon={Square} label="Área Útil/Total" value={`${property.area_util_total || 0} m²`} />
                                <DetailItem icon={Building2} label="Área Construída" value={`${property.area_construida || 0} m²`} />
                                <DetailItem icon={Square} label="Área do Lote" value={`${property.area_lote_terreno || 0} m²`} />
                            </CardContent>
                        </Card>
                        {/* Extra Features */}
                        {property.caracteristicas_extras?.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Características Extras</CardTitle></CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {property.caracteristicas_extras.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="owner" className="space-y-4 m-0">
                         {/* Owner */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Dados do Proprietário</CardTitle></CardHeader>
                            <CardContent>
                            {proprietario ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                <DetailItem icon={User} label="Nome" value={proprietario.nome} />
                                <DetailItem icon={FileText} label="CPF/CNPJ" value={proprietario.cpf_cnpj} />
                                <DetailItem icon={Info} label="Telefone" value={proprietario.telefone} />
                                <DetailItem icon={Info} label="E-mail" value={proprietario.email} />
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Proprietário não vinculado.</p>
                            )}
                            </CardContent>
                        </Card>
                        {/* Captadores */}
                        {captadores.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Captação e Comissões</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {captadores.map((captador, index) => (
                                        <div key={captador.user_id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                        <span className="font-medium text-sm">{captador.nome}</span>
                                        <Badge variant="outline">Comissão: {captador.comissao || 0}%</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="docs" className="space-y-4 m-0">
                         {/* Description */}
                        {property.descricao && (
                             <Card>
                                <CardHeader><CardTitle className="text-base">Descrição do Imóvel</CardTitle></CardHeader>
                                <CardContent><p className="text-gray-700 whitespace-pre-wrap">{property.descricao}</p></CardContent>
                            </Card>
                        )}
                         {/* Internal Notes */}
                        {property.observacoes_internas && (
                             <Card>
                                <CardHeader><CardTitle className="text-base">Observações Internas</CardTitle></CardHeader>
                                <CardContent><div className="bg-yellow-50 p-3 rounded"><p className="text-gray-700 whitespace-pre-wrap">{property.observacoes_internas}</p></div></CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="media" className="space-y-4 m-0">
                        {/* Photo Gallery */}
                        {property.fotos?.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Galeria de Fotos</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {property.fotos.map((foto, index) => (
                                    <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                                    <img src={foto.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover"/>
                                    {foto.url === property.foto_principal && (
                                        <Badge className="absolute top-1 left-1 bg-blue-600 text-white text-xs">Principal</Badge>
                                    )}
                                    </div>
                                ))}
                                </CardContent>
                            </Card>
                        )}
                        {/* Video */}
                        {property.video_url && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Vídeo</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="aspect-video bg-gray-200 rounded">
                                         <iframe 
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${property.video_url.split('v=')[1] || property.video_url.split('/').pop()}`} 
                                            title="Vídeo do Imóvel"
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {/* Portals */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Status dos Portais</CardTitle></CardHeader>
                            <CardContent className="text-center text-gray-500 italic">
                                Funcionalidade de status de portais em desenvolvimento.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
        <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`CadastroImoveis?edit=${property.id}`))}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Imóvel
            </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={!!propertyId} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl w-full">
         <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}