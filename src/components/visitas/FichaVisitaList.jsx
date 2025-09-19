
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Search } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Cliente } from "@/api/entities";
import { Imovel } from "@/api/entities";

const statusVariant = {
  Pendente: "default",
  Realizada: "success",
  Cancelada: "destructive",
};

export default function FichaVisitaList({ fichas, loading, onEdit, onDelete }) {
  const [filteredFichas, setFilteredFichas] = useState([]);
  const [clientes, setClientes] = useState({});
  const [imoveis, setImoveis] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRelatedData = async () => {
        if(fichas.length === 0) return;
        const clienteIds = [...new Set(fichas.map(f => f.cliente_id))];
        const imovelIds = [...new Set(fichas.map(f => f.imovel_id))];

        const [clientesData, imoveisData] = await Promise.all([
            Cliente.list().then(data => data.filter(c => clienteIds.includes(c.id))),
            Imovel.list().then(data => data.filter(i => imovelIds.includes(i.id)))
        ]);

        setClientes(clientesData.reduce((acc, c) => ({...acc, [c.id]: c}), {}));
        setImoveis(imoveisData.reduce((acc, i) => ({...acc, [i.id]: i}), {}));
    };
    fetchRelatedData();
  }, [fichas]);
  
  useEffect(() => {
    let results = fichas;
    if (searchTerm) {
        results = fichas.filter(ficha => {
            const cliente = clientes[ficha.cliente_id];
            const imovel = imoveis[ficha.imovel_id];
            const term = searchTerm.toLowerCase();
            return (
                cliente?.nome.toLowerCase().includes(term) ||
                imovel?.codigo.toString().includes(term) ||
                imovel?.endereco.toLowerCase().includes(term)
            );
        });
    }
    setFilteredFichas(results);
  }, [searchTerm, fichas, clientes, imoveis]);

  if (loading) return <p>Carregando fichas...</p>;

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fichas Cadastradas</CardTitle>
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
                placeholder="Buscar por cliente, cód. do imóvel ou endereço..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Imóvel (Cód)</TableHead>
              <TableHead>Data da Visita</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFichas.length > 0 ? (
                filteredFichas.map((ficha) => (
                    <TableRow key={ficha.id}>
                        <TableCell>{clientes[ficha.cliente_id]?.nome || 'Carregando...'}</TableCell>
                        <TableCell>{imoveis[ficha.imovel_id]?.endereco || 'Carregando...'} (#{imoveis[ficha.imovel_id]?.codigo})</TableCell>
                        <TableCell>{format(new Date(ficha.data_visita), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                        <TableCell><Badge variant={statusVariant[ficha.status]}>{ficha.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(ficha)}><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDelete(ficha.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Nenhuma ficha encontrada.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
