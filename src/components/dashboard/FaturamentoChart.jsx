import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from "lucide-react";

// Dados simulados - em produção viria do backend
const mockFaturamentoData = [
  { mes: 'Jan', faturamento: 450000, meta: 500000 },
  { mes: 'Fev', faturamento: 380000, meta: 500000 },
  { mes: 'Mar', faturamento: 620000, meta: 500000 },
  { mes: 'Abr', faturamento: 540000, meta: 500000 },
  { mes: 'Mai', faturamento: 680000, meta: 500000 },
  { mes: 'Jun', faturamento: 590000, meta: 500000 }
];

export default function FaturamentoChart({ faturamentoMes }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Evolução do Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Faturamento Este Mês</p>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(faturamentoMes)}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Meta Mensal</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(500000)}
            </p>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockFaturamentoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="mes" 
                className="text-gray-600"
                fontSize={12}
              />
              <YAxis 
                className="text-gray-600"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [formatCurrency(value), '']}
              />
              <Line 
                type="monotone" 
                dataKey="faturamento" 
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                name="Faturamento Real"
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="8 8"
                dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                name="Meta"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}