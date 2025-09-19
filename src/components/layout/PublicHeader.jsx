import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Phone, Mail } from 'lucide-react';

export default function PublicHeader({ settings }) {
  const portalName = settings?.nome_imobiliaria || "Lar Imóveis";
  const logoUrl = settings?.logo_url;
  const phone = settings?.telefone_principal;
  const email = settings?.email_contato;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              {logoUrl ? (
                <img className="h-10 w-auto" src={logoUrl} alt={portalName} />
              ) : (
                <span className="text-2xl font-bold text-blue-600">{portalName}</span>
              )}
            </Link>
          </div>

          {/* Navegação Principal */}
          <nav className="hidden md:flex md:space-x-8">
            <Link to={createPageUrl('Home')} className="font-medium text-gray-500 hover:text-gray-900">Início</Link>
            <Link to={createPageUrl('Imoveis')} className="font-medium text-gray-500 hover:text-gray-900">Imóveis</Link>
            <a href="#" className="font-medium text-gray-500 hover:text-gray-900">Comprar</a>
            <a href="#" className="font-medium text-gray-500 hover:text-gray-900">Alugar</a>
          </nav>

          {/* Contato */}
          <div className="hidden md:flex items-center space-x-4">
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
                <Phone className="w-4 h-4 mr-2" />
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
                <Mail className="w-4 h-4 mr-2" />
                {email}
              </a>
            )}
          </div>
          
          {/* Menu Mobile (Placeholder) */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}