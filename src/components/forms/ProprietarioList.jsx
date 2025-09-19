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
  Mail
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProprietarioList({ 
  proprietarios, 
  loading, 
  onEdit, 
  onDelete, 
  onNewProprietario 
}) {
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
            Proprietários Cadastrados ({proprietarios.length})
          </CardTitle>
          <Button onClick={onNewProprietario} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Proprietário
          </Button>
        </CardHeader>
      </Card>

      {proprietarios.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum proprietário cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro proprietário
            </p>
            <Button onClick={onNewProprietario} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Proprietário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proprietarios.map((proprietario) => (
            <Card key={proprietario.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{proprietario.nome}</h3>
                      {!proprietario.ativo && (
                        <Badge variant="destructive" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {proprietario.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {proprietario.telefone}
                        </span>
                      )}
                      {proprietario.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {proprietario.email}
                        </span>
                      )}
                    </div>
                    
                    {proprietario.cidade && (
                      <p className="text-sm text-gray-500 mt-1">
                        {proprietario.cidade}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(proprietario)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(proprietario.id)}
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