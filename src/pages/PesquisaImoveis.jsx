
import React, { useState, useEffect, useCallback } from "react";
import { Imovel } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Square,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

import PropertyFilters from "../components/search/PropertyFilters";
import PropertyCard from "../components/search/PropertyCard";
import PropertyList from "../components/search/PropertyList";
import PropertyDetailModal from "../components/modals/PropertyDetailModal";

export default function PesquisaImoveis() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // cards, list
  const [filters, setFilters] = useState({
    tipo: "",
    situacao: "",
    estagio: "",
    bairro: "",
    valorMin: "",
    valorMax: "",
    quartos: "",
    banheiros: "",
    vagas: ""
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const applyFilters = useCallback(() => {
    let filtered = properties;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        (property.codigo?.toString() || '').toLowerCase().includes(term) ||
        (property.endereco?.toLowerCase() || '').includes(term) ||
        (property.bairro?.toLowerCase() || '').includes(term)
      );
    }

    // Filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value) {
        if (key === 'valorMin') {
          filtered = filtered.filter(p => (p.valor || 0) >= parseFloat(value));
        } else if (key === 'valorMax') {
          filtered = filtered.filter(p => (p.valor || 0) <= parseFloat(value));
        } else {
          filtered = filtered.filter(p => 
            p[key] && p[key].toString() === value.toString()
          );
        }
      }
    });

    setFilteredProperties(filtered);
  }, [searchTerm, filters, properties]);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadProperties = async () => {
    try {
      const data = await Imovel.list("-created_date");
      setProperties(data);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      tipo: "",
      situacao: "",
      estagio: "",
      bairro: "",
      valorMin: "",
      valorMax: "",
      quartos: "",
      banheiros: "",
      vagas: ""
    });
    setSearchTerm("");
  };

  const handleViewDetails = (propertyId) => {
    setSelectedPropertyId(propertyId);
  };

  const handleCloseModal = () => {
    setSelectedPropertyId(null);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid md:grid-cols-2 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {selectedPropertyId && (
        <PropertyDetailModal 
          propertyId={selectedPropertyId}
          onClose={handleCloseModal}
        />
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesquisa de Imóveis</h1>
          <p className="text-gray-600 mt-1">
            {filteredProperties.length} imóveis encontrados
          </p>
        </div>
        <Link to={createPageUrl("CadastroImoveis")}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Imóvel
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PropertyFilters 
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={clearFilters}
            propertyCount={filteredProperties.length}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and View Controls */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Pesquisar por código, endereço ou bairro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    Lista
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Display */}
          {filteredProperties.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum imóvel encontrado
                </h3>
                <p className="text-gray-500 mb-6">
                  Ajuste os filtros de pesquisa ou cadastre novos imóveis
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={clearFilters} variant="outline">
                    Limpar Filtros
                  </Button>
                  <Link to={createPageUrl("CadastroImoveis")}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Cadastrar Imóvel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {viewMode === "cards" ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard 
                      key={property.id}
                      property={property}
                      onReload={loadProperties}
                      onViewDetails={() => handleViewDetails(property.id)}
                    />
                  ))}
                </div>
              ) : (
                <PropertyList 
                  properties={filteredProperties}
                  onReload={loadProperties}
                  onViewDetails={handleViewDetails}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
