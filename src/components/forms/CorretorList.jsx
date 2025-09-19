import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Award
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CorretorList({ 
  corretores, 
  loading, 
  onEdit, 
  onDelete, 
  onNewCorretor 
}) {
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Corretores Cadastrados ({corretores.length})
          </CardTitle>
          <Button onClick={onNewCorretor} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Corretor
          </Button>
        </CardHeader>
      </Card>

      {corretores.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum corretor cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro corretor
            </p>
            <Button onClick={onNewCorretor} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Corretor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {corretores.map((corretor) => (
            <Card key={corretor.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{corretor.nome}</h3>
                      {!corretor.ativo && (
                        <Badge variant="destructive" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                        CRECI: {corretor.creci}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-1">
                      {corretor.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {corretor.telefone}
                        </span>
                      )}
                      {corretor.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {corretor.email}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {corretor.percentual_comissao && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Comissão: {corretor.percentual_comissao}%
                        </span>
                      )}
                      {corretor.meta_mensal && (
                        <span>
                          Meta: {formatCurrency(corretor.meta_mensal)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(corretor)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(corretor.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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