import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Trophy, Medal, Award } from "lucide-react";

const rankingIcons = {
  0: { icon: Trophy, color: "text-yellow-500" },
  1: { icon: Medal, color: "text-gray-400" },
  2: { icon: Award, color: "text-orange-500" }
};

export default function CorretorRanking({ corretores }) {
  const getInitials = (name) => {
    if (!name) return 'C';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          Top Corretores - Visitas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {corretores.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">Nenhum corretor com visitas</p>
            <p className="text-gray-400 text-sm">Dados aparecerão conforme as visitas são realizadas</p>
          </div>
        ) : (
          corretores.map((corretor, index) => {
            const rankIcon = rankingIcons[index];
            const IconComponent = rankIcon?.icon || Star;
            const iconColor = rankIcon?.color || "text-gray-500";
            
            return (
              <div key={corretor.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-5 h-5 ${iconColor}`} />
                  <span className="font-bold text-lg text-gray-600">#{index + 1}</span>
                </div>
                
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {getInitials(corretor.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {corretor.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    CRECI: {corretor.creci || 'Não informado'}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {corretor.totalVisitas} visitas
                    </Badge>
                    {corretor.imoveisVendidos > 0 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {corretor.imoveisVendidos} vendidos
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {corretor.totalVisitas}
                  </p>
                  <p className="text-xs text-gray-500">visitas</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}