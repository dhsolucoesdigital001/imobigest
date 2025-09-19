

import React, { useEffect, useState } from "react";
import { User } from "@/api/entities";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster } from "@/components/ui/toaster";
import {
  LayoutDashboard,
  Search,
  Building2,
  Users,
  User as UserIcon,
  UserCheck,
  Calendar,
  FileText,
  FileSignature, // Adicionado ícone
  Settings,
  Palette,
  Megaphone,
  Globe,
  Bot,
  HeartPulse,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Home,
  Menu,
  X,
  Database,
  RefreshCw
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  {
    group: "PRINCIPAL",
    items: [
      { page: "Dashboard", icon: LayoutDashboard },
      { page: "PesquisaImoveis", icon: Search, label: "Pesquisa Imóveis" },
    ],
  },
  {
    group: "CADASTROS",
    items: [
      { page: "CadastroImoveis", icon: Building2, label: "Imóveis" },
      { page: "CadastroProprietarios", icon: Users, label: "Proprietários" },
      { page: "CadastroClientes", icon: UserCheck, label: "Clientes" },
      { page: "CadastroCorretores", icon: UserIcon, label: "Corretores" },
      { page: "LeadManagement", icon: UserCheck, label: "Leads" },
    ],
  },
  {
    group: "GESTÃO",
    items: [
      { page: "GestaoVisitas", icon: Calendar, label: "Agendamento" },
      { page: "FichaVisita", icon: FileSignature, label: "Ficha de Visita" }, // Adicionado
      { page: "GestaoAluguel", icon: FileText, label: "Gestão de Aluguel" },
      { page: "Relatorios", icon: FileText, label: "Relatórios" },
    ],
  },
  {
    group: "SISTEMA",
    items: [
      { page: "GestaoUsuarios", icon: Users, label: "Gestão de Usuários" },
      { page: "AIAgents", icon: Bot, label: "AI Agents" },
      { page: "SystemHealthCheck", icon: HeartPulse, label: "Diagnóstico" },
      { page: "AdminPortalSettings", icon: Globe, label: "Portal Público" },
      { page: "ThemeSettings", icon: Palette, label: "Configuração de Tema" },
      { page: "MarketingSettings", icon: Megaphone, label: "Marketing Digital" },
      { page: "IntegracoesAPI", icon: Settings, label: "Integrações e API" },
      { page: "IntegracaoDados", icon: Database, label: "Integração de Dados" },
      { page: "PortalPublicoSync", icon: RefreshCw, label: "Portal Público Sync" },
    ],
  },
];

const NavLink = ({ page, label, icon: Icon, collapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = currentPath === createPageUrl(page) || currentPath.includes(page);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={createPageUrl(page)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate">{label || page}</span>
            )}
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="bg-gray-800 text-white">
            <p>{label || page}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const AdminSidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`
      hidden lg:flex lg:flex-col 
      bg-gray-900 text-white 
      h-screen sticky top-0
      transition-all duration-300 ease-in-out
      ${collapsed ? "w-20" : "w-64"}
      shadow-xl border-r border-gray-700
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate">ImobiGest</h1>
              <p className="text-xs text-gray-400">Sistema de Gestão</p>
              <p className="text-xs text-gray-400">Imobiliária</p>
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white hover:bg-gray-700 flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation - Scrollable Area */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3 sticky top-0 bg-gray-900 py-1">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink key={item.page} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer - Fixed at bottom */}
      {user && (
        <div className="border-t border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => User.logout()}
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-700 flex-shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MobileSidebar = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-gray-900 text-white border-gray-700 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">ImobiGest</h1>
                <p className="text-xs text-gray-400">Sistema de Gestão Imobiliária</p>
              </div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {navItems.map((group) => (
              <div key={group.group} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3">
                  {group.group}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink key={item.page} {...item} collapsed={false} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Footer */}
          {user && (
            <div className="border-t border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => User.logout()}
                  className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const LoginScreen = () => {
  const handleLogin = () => {
    User.login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ImobiGest</h1>
          <p className="text-lg text-gray-600 mb-1">Sistema de Gestão</p>
          <p className="text-lg text-gray-600">Imobiliária</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acesso ao Sistema</h2>
            <p className="text-gray-600">Faça login para acessar o painel administrativo</p>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Fazer Login
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 ImobiGest. Sistema completo de gestão imobiliária.</p>
        </div>
      </div>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Se não tiver usuário logado, mostra tela de login
  if (!user) {
    return <LoginScreen />;
  }
  
  // Layout do Painel Administrativo
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <AdminSidebar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden shadow-sm">
          <MobileSidebar user={user} />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ImobiGest</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("MinhaConta")}>Minha Conta</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => User.logout()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

{/* Estilos customizados para scrollbar */}
<style jsx global>{`
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280;
  }
`}</style>

