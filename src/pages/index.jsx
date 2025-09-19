import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import PesquisaImoveis from "./PesquisaImoveis";

import CadastroImoveis from "./CadastroImoveis";

import CadastroProprietarios from "./CadastroProprietarios";

import CadastroClientes from "./CadastroClientes";

import CadastroCorretores from "./CadastroCorretores";

import Relatorios from "./Relatorios";

import AdminPortalSettings from "./AdminPortalSettings";

import ThemeSettings from "./ThemeSettings";

import GestaoUsuarios from "./GestaoUsuarios";

import MarketingSettings from "./MarketingSettings";

import GestaoVisitas from "./GestaoVisitas";

import MinhaConta from "./MinhaConta";

import ConfiguracoesPessoais from "./ConfiguracoesPessoais";

import GestaoAluguel from "./GestaoAluguel";

import SystemHealthCheck from "./SystemHealthCheck";

import AIAgents from "./AIAgents";

import AIConfig from "./AIConfig";

import ApiDocumentation from "./ApiDocumentation";

import ApiPublicProperties from "./ApiPublicProperties";

import ApiPublicLeads from "./ApiPublicLeads";

import ApiPublicPortalSettings from "./ApiPublicPortalSettings";

import IntegracoesAPI from "./IntegracoesAPI";

import IntegracaoDados from "./IntegracaoDados";

import PortalPublicoSync from "./PortalPublicoSync";

import LeadManagement from "./LeadManagement";

import DocumentacaoIntegracao from "./DocumentacaoIntegracao";

import FichaVisita from "./FichaVisita";

import ImovelImpressao from "./ImovelImpressao";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    PesquisaImoveis: PesquisaImoveis,
    
    CadastroImoveis: CadastroImoveis,
    
    CadastroProprietarios: CadastroProprietarios,
    
    CadastroClientes: CadastroClientes,
    
    CadastroCorretores: CadastroCorretores,
    
    Relatorios: Relatorios,
    
    AdminPortalSettings: AdminPortalSettings,
    
    ThemeSettings: ThemeSettings,
    
    GestaoUsuarios: GestaoUsuarios,
    
    MarketingSettings: MarketingSettings,
    
    GestaoVisitas: GestaoVisitas,
    
    MinhaConta: MinhaConta,
    
    ConfiguracoesPessoais: ConfiguracoesPessoais,
    
    GestaoAluguel: GestaoAluguel,
    
    SystemHealthCheck: SystemHealthCheck,
    
    AIAgents: AIAgents,
    
    AIConfig: AIConfig,
    
    ApiDocumentation: ApiDocumentation,
    
    ApiPublicProperties: ApiPublicProperties,
    
    ApiPublicLeads: ApiPublicLeads,
    
    ApiPublicPortalSettings: ApiPublicPortalSettings,
    
    IntegracoesAPI: IntegracoesAPI,
    
    IntegracaoDados: IntegracaoDados,
    
    PortalPublicoSync: PortalPublicoSync,
    
    LeadManagement: LeadManagement,
    
    DocumentacaoIntegracao: DocumentacaoIntegracao,
    
    FichaVisita: FichaVisita,
    
    ImovelImpressao: ImovelImpressao,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/PesquisaImoveis" element={<PesquisaImoveis />} />
                
                <Route path="/CadastroImoveis" element={<CadastroImoveis />} />
                
                <Route path="/CadastroProprietarios" element={<CadastroProprietarios />} />
                
                <Route path="/CadastroClientes" element={<CadastroClientes />} />
                
                <Route path="/CadastroCorretores" element={<CadastroCorretores />} />
                
                <Route path="/Relatorios" element={<Relatorios />} />
                
                <Route path="/AdminPortalSettings" element={<AdminPortalSettings />} />
                
                <Route path="/ThemeSettings" element={<ThemeSettings />} />
                
                <Route path="/GestaoUsuarios" element={<GestaoUsuarios />} />
                
                <Route path="/MarketingSettings" element={<MarketingSettings />} />
                
                <Route path="/GestaoVisitas" element={<GestaoVisitas />} />
                
                <Route path="/MinhaConta" element={<MinhaConta />} />
                
                <Route path="/ConfiguracoesPessoais" element={<ConfiguracoesPessoais />} />
                
                <Route path="/GestaoAluguel" element={<GestaoAluguel />} />
                
                <Route path="/SystemHealthCheck" element={<SystemHealthCheck />} />
                
                <Route path="/AIAgents" element={<AIAgents />} />
                
                <Route path="/AIConfig" element={<AIConfig />} />
                
                <Route path="/ApiDocumentation" element={<ApiDocumentation />} />
                
                <Route path="/ApiPublicProperties" element={<ApiPublicProperties />} />
                
                <Route path="/ApiPublicLeads" element={<ApiPublicLeads />} />
                
                <Route path="/ApiPublicPortalSettings" element={<ApiPublicPortalSettings />} />
                
                <Route path="/IntegracoesAPI" element={<IntegracoesAPI />} />
                
                <Route path="/IntegracaoDados" element={<IntegracaoDados />} />
                
                <Route path="/PortalPublicoSync" element={<PortalPublicoSync />} />
                
                <Route path="/LeadManagement" element={<LeadManagement />} />
                
                <Route path="/DocumentacaoIntegracao" element={<DocumentacaoIntegracao />} />
                
                <Route path="/FichaVisita" element={<FichaVisita />} />
                
                <Route path="/ImovelImpressao" element={<ImovelImpressao />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}