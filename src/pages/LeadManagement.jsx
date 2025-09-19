
import React, { useState, useEffect, useCallback } from "react";
import { Lead, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Search,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  'Novo': 'bg-blue-100 text-blue-800',
  'Contatado': 'bg-yellow-100 text-yellow-800',
  'Qualificado': 'bg-green-100 text-green-800',
  'Convertido': 'bg-purple-100 text-purple-800',
  'Perdido': 'bg-red-100 text-red-800'
};

const origemColors = {
  'Portal Público': 'bg-blue-100 text-blue-800',
  'WhatsApp': 'bg-green-100 text-green-800',
  'Facebook': 'bg-blue-200 text-blue-900',
  'Instagram': 'bg-pink-100 text-pink-800',
  'Indicação': 'bg-purple-100 text-purple-800',
  'Outros': 'bg-gray-100 text-gray-800'
};

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [origemFilter, setOrigemFilter] = useState("");

  const applyFilters = useCallback(() => {
    let filtered = leads;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.nome.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.telefone?.includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (origemFilter) {
      filtered = filtered.filter(lead => lead.origem === origemFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, origemFilter]);

  const loadData = useCallback(async () => {
    try {
      const [leadsData, corretoresData] = await Promise.all([
        Lead.list("-created_date"),
        User.list()
      ]);

      setLeads(leadsData);
      setCorretores(corretoresData.filter(user => user.tipo_usuario === 'Corretor'));
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as it only sets state and calls external API methods

  useEffect(() => {
    loadData();
  }, [loadData]); // Now depends on the memoized loadData

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Now depends on the memoized applyFilters

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await Lead.update(leadId, {
        status: newStatus,
        data_ultima_interacao: new Date().toISOString()
      });
      loadData(); // This will trigger a re-fetch of all data, then re-apply filters
    } catch (error) {
      console.error("Erro ao atualizar status do lead:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return '';
    }
  };

  const getStats = () => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === 'Novo').length;
    const convertidos = leads.filter(l => l.status === 'Convertido').length;
    const taxaConversao = total > 0 ? (convertidos / total * 100).toFixed(1) : 0;

    return { total, novos, convertidos, taxaConversao };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Leads</h1>
        <p className="text-gray-600 mt-1">
          Gerencie todos os leads captados pelo portal público
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads Novos</p>
                <p className="text-3xl font-bold text-blue-600">{stats.novos}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Convertidos</p>
                <p className="text-3xl font-bold text-green-600">{stats.convertidos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-purple-600">{stats.taxaConversao}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Pesquisar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos</SelectItem>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Contatado">Contatado</SelectItem>
                <SelectItem value="Qualificado">Qualificado</SelectItem>
                <SelectItem value="Convertido">Convertido</SelectItem>
                <SelectItem value="Perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={origemFilter} onValueChange={setOrigemFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                <SelectItem value="Portal Público">Portal Público</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Indicação">Indicação</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum lead encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter || origemFilter
                ? 'Ajuste os filtros para ver mais leads'
                : 'Leads capturados pelo portal público aparecerão aqui'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{lead.nome}</h3>
                        <Badge className={statusColors[lead.status]}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline" className={origemColors[lead.origem]}>
                          {lead.origem}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </div>
                        )}
                        {lead.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.telefone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(lead.created_date)}
                        </div>
                        {lead.interesse && (
                          <div className="flex items-center gap-1">
                            <span>Interesse: {lead.interesse}</span>
                          </div>
                        )}
                      </div>

                      {lead.mensagem && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                          "{lead.mensagem}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Contatado">Contatado</SelectItem>
                        <SelectItem value="Qualificado">Qualificado</SelectItem>
                        <SelectItem value="Convertido">Convertido</SelectItem>
                        <SelectItem value="Perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
