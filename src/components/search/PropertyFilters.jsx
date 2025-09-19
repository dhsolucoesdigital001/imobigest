
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { Filter, X } from "lucide-react";

const tiposImovel = [
  "Casa", "Apartamento", "Cobertura", "Sala Comercial", 
  "Galpão", "Terreno", "Chácara", "Casa de Condomínio"
];

const situacoes = ["Venda", "Aluguel", "Venda/Aluguel"]; // Changed Locação to Aluguel and Venda/Locação to Venda/Aluguel
const estagios = ["Disponível", "Visitado", "Proposta", "Vendido", "Alugado", "Reservado"];

export default function PropertyFilters({ filters, onFiltersChange, onClearFilters, propertyCount }) {
  const handleChange = (key, value) => {
    onFiltersChange({ [key]: value });
  };

  return (
    <Card className="border-none shadow-lg sticky top-6"> {/* Added sticky top-6 */}
      <CardHeader>
        <div className="flex justify-between items-center"> {/* Added div for flex layout */}
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filtros {/* Changed title from "Filtros Avançados" to "Filtros" */}
          </CardTitle>
          <Badge variant="secondary">{propertyCount} encontrados</Badge> {/* Added Badge */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Tipo de Imóvel</Label>
          <Select value={filters.tipo} onValueChange={(value) => handleChange('tipo', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos os tipos</SelectItem>
              {tiposImovel.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Situação */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Situação</Label>
          <Select value={filters.situacao} onValueChange={(value) => handleChange('situacao', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todas as situações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas as situações</SelectItem>
              {situacoes.map(situacao => (
                <SelectItem key={situacao} value={situacao}>{situacao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estágio */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Estágio</Label>
          <Select value={filters.estagio} onValueChange={(value) => handleChange('estagio', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todos os estágios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos os estágios</SelectItem>
              {estagios.map(estagio => (
                <SelectItem key={estagio} value={estagio}>{estagio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bairro */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Bairro</Label>
          <Input
            value={filters.bairro}
            onChange={(e) => handleChange('bairro', e.target.value)}
            placeholder="Digite o bairro"
            className="mt-1"
          />
        </div>

        {/* Valor */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Faixa de Valor</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input
              type="number"
              placeholder="Valor mín."
              value={filters.valorMin}
              onChange={(e) => handleChange('valorMin', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Valor máx."
              value={filters.valorMax}
              onChange={(e) => handleChange('valorMax', e.target.value)}
            />
          </div>
        </div>

        {/* Quartos */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Quartos</Label>
          <Select value={filters.quartos} onValueChange={(value) => handleChange('quartos', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Qualquer</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Banheiros */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Banheiros</Label>
          <Select value={filters.banheiros} onValueChange={(value) => handleChange('banheiros', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Qualquer</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vagas */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Vagas de Garagem</Label>
          <Select value={filters.vagas} onValueChange={(value) => handleChange('vagas', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Qualquer</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={onClearFilters} 
          className="w-full mt-6"
        >
          <X className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
      </CardContent>
    </Card>
  );
}
