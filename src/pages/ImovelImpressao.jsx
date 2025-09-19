import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Imovel, Proprietario, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ImovelImpressao() {
    const { id } = useParams();
    const [imovel, setImovel] = useState(null);
    const [proprietario, setProprietario] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const imovelData = await Imovel.get(id);
                setImovel(imovelData);

                if (imovelData && imovelData.proprietario_id) {
                    const proprietarioData = await Proprietario.get(imovelData.proprietario_id);
                    setProprietario(proprietarioData);
                }
            } catch (error) {
                console.error("Erro ao carregar dados para impressão:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!loading && imovel) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading, imovel]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg">Carregando ficha do imóvel...</p>
            </div>
        );
    }

    if (!imovel) {
        return <div className="p-10 text-center text-red-500">Imóvel não encontrado.</div>;
    }

    return (
        <div className="bg-gray-100 print:bg-white">
            <div className="fixed top-4 right-4 print:hidden">
                <Button onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir / Salvar PDF
                </Button>
            </div>
            
            <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg print:shadow-none">
                <header className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">FICHA DE CADASTRO DE IMÓVEL</h1>
                    <p className="text-gray-600">Código do Imóvel: #{imovel.codigo}</p>
                </header>

                <section className="mb-6">
                    <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">DADOS BÁSICOS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><strong className="block text-gray-500">Índice Cadastral:</strong> {imovel.indice_cadastral || 'N/A'}</div>
                        <div><strong className="block text-gray-500">Tipo de Imóvel:</strong> {imovel.tipo}</div>
                        <div><strong className="block text-gray-500">Situação:</strong> {imovel.situacao}</div>
                        <div><strong className="block text-gray-500">Valor:</strong> {formatCurrency(imovel.valor)}</div>
                        <div><strong className="block text-gray-500">Condomínio:</strong> {formatCurrency(imovel.valor_condominio)}</div>
                        <div><strong className="block text-gray-500">IPTU:</strong> {formatCurrency(imovel.valor_iptu)}</div>
                        <div><strong className="block text-gray-500">Aceita Permuta:</strong> {imovel.aceita_permuta ? 'Sim' : 'Não'}</div>
                        <div><strong className="block text-gray-500">Ocupação:</strong> {imovel.ocupacao || 'N/A'}</div>
                    </div>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">ENDEREÇO</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2"><strong className="block text-gray-500">Logradouro:</strong> {imovel.endereco}, {imovel.numero || 'S/N'}</div>
                        <div><strong className="block text-gray-500">Complemento:</strong> {imovel.complemento || 'N/A'}</div>
                        <div><strong className="block text-gray-500">Bairro:</strong> {imovel.bairro}</div>
                        <div><strong className="block text-gray-500">Cidade/Estado:</strong> {imovel.cidade}/{imovel.estado}</div>
                        <div><strong className="block text-gray-500">CEP:</strong> {imovel.cep || 'N/A'}</div>
                        <div><strong className="block text-gray-500">Região:</strong> {imovel.regiao || 'N/A'}</div>
                    </div>
                </section>

                {proprietario && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">DADOS DO PROPRIETÁRIO</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong className="block text-gray-500">Nome:</strong> {proprietario.nome}</div>
                            <div><strong className="block text-gray-500">CPF/CNPJ:</strong> {proprietario.cpf_cnpj || 'N/A'}</div>
                            <div><strong className="block text-gray-500">Telefone:</strong> {proprietario.telefone || 'N/A'}</div>
                            <div><strong className="block text-gray-500">E-mail:</strong> {proprietario.email || 'N/A'}</div>
                        </div>
                    </section>
                )}

                <section className="mb-6">
                    <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">DETALHES E ÁREAS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div><strong className="block text-gray-500">Quartos:</strong> {imovel.quartos || 0}</div>
                        <div><strong className="block text-gray-500">Suítes:</strong> {imovel.suites || 0}</div>
                        <div><strong className="block text-gray-500">Salas:</strong> {imovel.salas || 0}</div>
                        <div><strong className="block text-gray-500">Banheiros:</strong> {imovel.banheiros || 0}</div>
                        <div><strong className="block text-gray-500">Vagas:</strong> {imovel.vagas || 0}</div>
                        <div><strong className="block text-gray-500">Área Útil:</strong> {imovel.area_util_total || 0} m²</div>
                        <div><strong className="block text-gray-500">Área Construída:</strong> {imovel.area_construida || 0} m²</div>
                        <div><strong className="block text-gray-500">Área do Lote:</strong> {imovel.area_lote_terreno || 0} m²</div>
                        <div><strong className="block text-gray-500">Idade do Imóvel:</strong> {imovel.idade ? `${imovel.idade} anos` : 'N/A'}</div>
                        <div><strong className="block text-gray-500">Construtora/Ed.:</strong> {imovel.construtora || 'N/A'}</div>
                    </div>
                    {imovel.caracteristicas_extras && imovel.caracteristicas_extras.length > 0 && (
                        <div className="mt-4">
                            <strong className="block text-gray-500 text-sm mb-2">Características Extras:</strong>
                            <div className="flex flex-wrap gap-2">
                                {imovel.caracteristicas_extras.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}
                            </div>
                        </div>
                    )}
                </section>
                
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">DESCRIÇÃO</h2>
                    <p className="text-sm text-justify whitespace-pre-wrap">{imovel.descricao || 'Nenhuma descrição fornecida.'}</p>
                </section>

                {imovel.fotos && imovel.fotos.length > 0 && (
                    <section className="mb-6 break-inside-avoid">
                        <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">GALERIA DE FOTOS</h2>
                        <div className="grid grid-cols-3 gap-2">
                            {imovel.fotos.slice(0, 9).map((foto, index) => (
                                <div key={index} className="border p-1">
                                    <img src={foto.url} alt={`Foto ${index + 1}`} className="w-full h-auto object-cover"/>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <footer className="text-center text-xs text-gray-500 pt-4 mt-8 border-t">
                    Ficha gerada por ImobiGest em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                </footer>
            </div>
        </div>
    );
}