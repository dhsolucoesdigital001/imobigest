import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Imovel } from "@/api/entities";
import { Building2, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SequentialCodeValidator() {
  const [imoveis, setImoveis] = useState([]);
  const [nextCode, setNextCode] = useState(100);
  const [loading, setLoading] = useState(false);
  const [fixedCodes, setFixedCodes] = useState([]);
  const { toast } = useToast();

  const loadImoveis = async () => {
    setLoading(true);
    try {
      const data = await Imovel.list();
      setImoveis(data);
      
      // Calcular próximo código
      const codes = data.map(i => i.codigo).filter(Boolean).sort((a, b) => b - a);
      const highestCode = codes.length > 0 ? codes[0] : 99;
      setNextCode(Math.max(100, highestCode + 1));
      
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os imóveis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImoveis();
  }, []);

  const fixSequentialCodes = async () => {
    setLoading(true);
    setFixedCodes([]);
    
    try {
      const imoveisSemCodigo = imoveis.filter(i => !i.codigo);
      let currentCode = Math.max(100, Math.max(...imoveis.map(i => i.codigo || 0)) + 1);
      
      const fixes = [];
      
      for (const imovel of imoveisSemCodigo) {
        try {
          await Imovel.update(imovel.id, { ...imovel, codigo: currentCode });
          fixes.push({ id: imovel.id, oldCode: null, newCode: currentCode });
          currentCode++;
        } catch (error) {
          console.error(`Erro ao atualizar imóvel ${imovel.id}:`, error);
        }
      }
      
      setFixedCodes(fixes);
      await loadImoveis(); // Recarregar dados
      
      toast({
        title: "Códigos Corrigidos",
        description: `${fixes.length} imóveis foram atualizados com códigos sequenciais`
      });
      
    } catch (error) {
      console.error("Erro na correção:", error);
      toast({
        title: "Erro",
        description: "Erro ao corrigir códigos sequenciais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const imoveisSemCodigo = imoveis.filter(i => !i.codigo);
  const codigosExistentes = imoveis.map(i => i.codigo).filter(Boolean).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validador de Códigos Sequenciais</h2>
        <p className="text-gray-600">Verifica e corrige a numeração automática dos imóveis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Total de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{imoveis.length}</div>
            <p className="text-sm text-gray-600">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Com Código
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{imoveis.length - imoveisSemCodigo.length}</div>
            <p className="text-sm text-gray-600">Códigos atribuídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Sem Código
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{imoveisSemCodigo.length}</div>
            <p className="text-sm text-gray-600">Precisam de correção</p>
          </CardContent>
        </Card>
      </div>

      {imoveisSemCodigo.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>{imoveisSemCodigo.length} imóveis</strong> estão sem código sequencial. 
            Clique no botão abaixo para corrigir automaticamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button onClick={loadImoveis} variant="outline" disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar
        </Button>
        
        {imoveisSemCodigo.length > 0 && (
          <Button onClick={fixSequentialCodes} disabled={loading}>
            Corrigir Códigos Sequenciais
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximo Código</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 mb-2">{nextCode}</div>
            <p className="text-sm text-gray-600">
              Será atribuído automaticamente ao próximo imóvel cadastrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faixa de Códigos</CardTitle>
          </CardHeader>
          <CardContent>
            {codigosExistentes.length > 0 ? (
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {Math.min(...codigosExistentes)} - {Math.max(...codigosExistentes)}
                </div>
                <p className="text-sm text-gray-600">
                  Faixa atual de códigos utilizados
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum código atribuído ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {fixedCodes.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Correção realizada com sucesso!</strong><br />
            {fixedCodes.length} imóveis receberam códigos sequenciais: {fixedCodes.map(f => f.newCode).join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}