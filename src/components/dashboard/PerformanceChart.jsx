import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

const mockData = [
  { mes: 'Jan', vendas: 4, visitas: 24 },
  { mes: 'Fev', vendas: 3, visitas: 18 },
  { mes: 'Mar', vendas: 7, visitas: 32 },
  { mes: 'Abr', vendas: 5, visitas: 28 },
  { mes: 'Mai', vendas: 8, visitas: 35 },
  { mes: 'Jun', vendas: 6, visitas: 30 }
];

export default function PerformanceChart() {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Performance dos Últimos 6 Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="mes" 
                className="text-gray-600"
                fontSize={12}
              />
              <YAxis 
                className="text-gray-600"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="vendas" 
                name="Vendas" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="visitas" 
                name="Visitas" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}