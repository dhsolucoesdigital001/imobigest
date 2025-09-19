import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Proprietario } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Search, Loader2, X, Plus, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ITEMS_PER_PAGE = 20;
const SEARCH_DELAY = 300;

export default function ProprietarioSelector({ 
  proprietarioId, 
  onSelectProprietario, 
  proprietarios = [], 
  error, 
  className = "",
  required = true,
  placeholder = "Digite nome, CPF ou e-mail do proprietário..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProprietarios, setFilteredProprietarios] = useState([]);
  const [selectedProprietario, setSelectedProprietario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [allProprietarios, setAllProprietarios] = useState(proprietarios);
  
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Cache para pesquisas recentes
  const searchCache = useRef(new Map());

  // Load proprietário selecionado no mount
  useEffect(() => {
    if (proprietarioId && allProprietarios.length > 0) {
      const proprietario = allProprietarios.find(p => p.id === proprietarioId);
      setSelectedProprietario(proprietario);
    }
  }, [proprietarioId, allProprietarios]);

  // Load inicial de proprietários se não foram passados
  useEffect(() => {
    if (proprietarios.length === 0) {
      loadProprietarios('', 0, true);
    } else {
      setAllProprietarios(proprietarios);
    }
  }, [proprietarios]);

  const loadProprietarios = useCallback(async (searchQuery = '', page = 0, isNewSearch = false) => {
    const cacheKey = `${searchQuery}-${page}`;
    
    if (searchCache.current.has(cacheKey)) {
      const cached = searchCache.current.get(cacheKey);
      if (isNewSearch) {
        setFilteredProprietarios(cached.data);
      } else {
        setFilteredProprietarios(prev => [...prev, ...cached.data]);
      }
      setHasMore(cached.hasMore);
      return;
    }

    try {
      if (isNewSearch) {
        setIsLoading(true);
        setCurrentPage(0);
      } else {
        setLoadingMore(true);
      }

      let results;
      if (searchQuery.length >= 3) {
        // Busca por nome, CPF/CNPJ ou email
        results = await Proprietario.list("-created_date", ITEMS_PER_PAGE * (page + 1));
        
        // Filtrar localmente (em um cenário real, isso seria feito no backend)
        const filtered = results.filter(proprietario => {
          const searchLower = searchQuery.toLowerCase();
          return (
            proprietario.nome?.toLowerCase().includes(searchLower) ||
            proprietario.cpf_cnpj?.toLowerCase().includes(searchLower) ||
            proprietario.email?.toLowerCase().includes(searchLower)
          );
        });
        
        results = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
      } else {
        // Busca geral paginada
        results = await Proprietario.list("-created_date", ITEMS_PER_PAGE);
        // Simular paginação (em um cenário real, seria implementada no backend)
        const startIndex = page * ITEMS_PER_PAGE;
        results = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      }

      const hasMoreResults = results.length === ITEMS_PER_PAGE;
      
      // Cache dos resultados
      searchCache.current.set(cacheKey, { data: results, hasMore: hasMoreResults });
      
      if (isNewSearch) {
        setFilteredProprietarios(results);
        setAllProprietarios(prev => {
          // Merge com proprietários existentes, evitando duplicados
          const existing = new Set(prev.map(p => p.id));
          const newProprietarios = results.filter(p => !existing.has(p.id));
          return [...prev, ...newProprietarios];
        });
      } else {
        setFilteredProprietarios(prev => [...prev, ...results]);
      }
      
      setHasMore(hasMoreResults);
      setCurrentPage(page + 1);

    } catch (error) {
      console.error("Erro ao buscar proprietários:", error);
      if (isNewSearch) {
        setFilteredProprietarios([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadProprietarios(query, 0, true);
    }, SEARCH_DELAY);
  }, [loadProprietarios]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    if (value.length >= 3 || value.length === 0) {
      debouncedSearch(value);
    } else if (value.length < 3 && value.length > 0) {
      setFilteredProprietarios([]);
      setIsLoading(false);
    }
  };

  const handleProprietarioSelect = (proprietario) => {
    setSelectedProprietario(proprietario);
    setSearchTerm("");
    setIsOpen(false);
    onSelectProprietario(proprietario.id);
  };

  const handleClearSelection = () => {
    setSelectedProprietario(null);
    setSearchTerm("");
    onSelectProprietario(null);
    inputRef.current?.focus();
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadProprietarios(searchTerm, currentPage, false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasMore && !loadingMore) {
      handleLoadMore();
    }
  };

  // Close dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDocument = (cpfCnpj) => {
    if (!cpfCnpj) return '';
    const numbers = cpfCnpj.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpfCnpj;
  };

  const displayValue = selectedProprietario 
    ? `${selectedProprietario.nome} ${selectedProprietario.cpf_cnpj ? `- ${formatDocument(selectedProprietario.cpf_cnpj)}` : ''}`
    : searchTerm;

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Proprietário do Imóvel {required && <span className="text-red-500">*</span>}
        </Label>
        
        {selectedProprietario ? (
          // Proprietário selecionado
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{selectedProprietario.nome}</p>
                    <div className="flex items-center gap-4 text-sm text-green-700">
                      {selectedProprietario.cpf_cnpj && (
                        <span>{formatDocument(selectedProprietario.cpf_cnpj)}</span>
                      )}
                      {selectedProprietario.email && (
                        <span>{selectedProprietario.email}</span>
                      )}
                      {selectedProprietario.telefone && (
                        <span>{selectedProprietario.telefone}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Input de busca
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={`pl-10 ${error ? 'border-red-500' : ''}`}
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
              )}
            </div>

            {/* Dropdown de resultados */}
            {isOpen && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-hidden shadow-lg">
                <div className="max-h-80 overflow-y-auto" onScroll={handleScroll}>
                  {isLoading && filteredProprietarios.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Buscando proprietários...
                    </div>
                  ) : filteredProprietarios.length > 0 ? (
                    <>
                      {filteredProprietarios.map((proprietario) => (
                        <div
                          key={proprietario.id}
                          onClick={() => handleProprietarioSelect(proprietario)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{proprietario.nome}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                {proprietario.cpf_cnpj && (
                                  <Badge variant="outline" className="text-xs">
                                    {formatDocument(proprietario.cpf_cnpj)}
                                  </Badge>
                                )}
                                {proprietario.email && (
                                  <span className="truncate">{proprietario.email}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load more */}
                      {hasMore && (
                        <div className="p-3 text-center">
                          {loadingMore ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleLoadMore}
                              className="text-blue-600"
                            >
                              Carregar mais resultados
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : searchTerm.length >= 3 ? (
                    <div className="p-6 text-center">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">Nenhum proprietário encontrado</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Não encontramos proprietários com "{searchTerm}"
                      </p>
                      <Link to={createPageUrl("CadastroProprietarios")}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Cadastrar Novo Proprietário
                        </Button>
                      </Link>
                    </div>
                  ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
                    <div className="p-4 text-center text-gray-500">
                      Digite pelo menos 3 caracteres para buscar
                    </div>
                  ) : allProprietarios.length === 0 ? (
                    <div className="p-6 text-center">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">Nenhum proprietário cadastrado</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Cadastre primeiro em Cadastros → Proprietários
                      </p>
                      <Link to={createPageUrl("CadastroProprietarios")}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Cadastrar Proprietário
                        </Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </Card>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}