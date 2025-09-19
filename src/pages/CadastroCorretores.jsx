import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, ArrowRight } from 'lucide-react';

export default function CadastroCorretores() {
  return (
    <div className="p-6 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <Card className="max-w-xl text-center p-8 shadow-lg">
        <CardContent>
          <Users className="w-16 h-16 mx-auto text-blue-500 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Gestão de Usuários Centralizada
          </h1>
          <p className="text-gray-600 mb-8">
            A seção "Cadastro de Corretores" foi integrada à nova tela de "Gestão de Usuários" para um controle mais completo e seguro.
          </p>
          <p className="text-gray-600 mb-8">
            Agora, você pode gerenciar corretores, assistentes e gerentes em um só lugar, definindo permissões, horários de acesso e muito mais.
          </p>
          <Link to={createPageUrl("GestaoUsuarios")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Acessar Gestão de Usuários
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}