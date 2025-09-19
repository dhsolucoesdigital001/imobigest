
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Database,
  Users,
  Building2,
  UserCheck,
  Calendar,
  FileText,
  Settings,
  Globe
} from "lucide-react";
import { Imovel } from "@/api/entities";
import { Proprietario } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { User } from "@/api/entities";
import { Visita } from "@/api/entities";
import { Lead } from "@/api/entities";
import { PortalConfig } from "@/api/entities";
import { MarketingConfig } from "@/api/entities";

const integrationTests = [
  {
    name: "Entidades Base",
    icon: Database,
    tests: [
      { name: "User", entity: User },
      { name: "Imovel", entity: Imovel },
      { name: "Proprietario", entity: Proprietario },
      { name: "Cliente", entity: Cliente },
      { name: "Lead", entity: Lead },
      { name: "Visita", entity: Visita }
    ]
  },
  {
    name: "Configurações",
    icon: Settings,
    tests: [
      { name: "PortalConfig", entity: PortalConfig },
      { name: "MarketingConfig", entity: MarketingConfig }
    ]
  },
  {
    name: "APIs Públicas",
    icon: Globe,
    tests: [
      { name: "Properties API", endpoint: "/api/public/properties" },
      { name: "Leads API", endpoint: "/api/public/leads" },
      { name: "Portal Settings API", endpoint: "/api/public/portal-settings" }
    ]
  }
];

export default function IntegrationValidator() {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState("");

  const runAllTests = async () => {
    setTesting(true);
    setResults({});
    
    const newResults = {};

    for (const group of integrationTests) {
      newResults[group.name] = {};
      
      for (const test of group.tests) {
        setCurrentTest(`${group.name} - ${test.name}`);
        
        try {
          if (test.entity) {
            // Testar entidade
            const data = await test.entity.list();
            newResults[group.name][test.name] = {
              status: 'success',
              count: data.length,
              message: `${data.length} registros encontrados`
            };
          } else if (test.endpoint) {
            // Testar API endpoint
            const response = await fetch(test.endpoint);
            newResults[group.name][test.name] = {
              status: response.ok ? 'success' : 'error',
              message: response.ok ? 'API funcionando' : `Erro ${response.status}`
            };
          }
        } catch (error) {
          newResults[group.name][test.name] = {
            status: 'error',
            message: error.message
          };
        }
        
        // Pequeno delay para UX
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setResults(newResults);
    setTesting(false);
    setCurrentTest("");
  };

  const getOverallStatus = () => {
    const allTests = Object.values(results).flatMap(group => Object.values(group));
    const errors = allTests.filter(test => test.status === 'error');
    const total = allTests.length;
    
    if (total === 0) return { status: 'idle', message: 'Nenhum teste executado' };
    if (errors.length === 0) return { status: 'success', message: `Todos os ${total} testes passaram` };
    return { status: 'error', message: `${errors.length} de ${total} testes falharam` };
  };

  const overall = getOverallStatus();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Validador de Integração</h2>
          <p className="text-gray-600">Verifica a comunicação entre todos os módulos</p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            'Executar Validação'
          )}
        </Button>
      </div>

      {testing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Executando teste: {currentTest}
          </AlertDescription>
        </Alert>
      )}

      {overall.status !== 'idle' && (
        <Alert className={overall.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {overall.status === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={overall.status === 'success' ? 'text-green-800' : 'text-red-800'}>
            {overall.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {integrationTests.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.name} className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {group.tests.map((test) => {
                    const result = results[group.name]?.[test.name];
                    
                    return (
                      <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{test.name}</span>
                        <div className="flex items-center gap-2">
                          {result && (
                            <span className="text-sm text-gray-600">{result.message}</span>
                          )}
                          {result ? (
                            result.status === 'success' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erro
                              </Badge>
                            )
                          ) : testing ? (
                            <Badge variant="secondary">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Testando
                            </Badge>
                          ) : (
                            <Badge variant="outline">Aguardando</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
