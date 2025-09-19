import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

export default function PublicFooter({ settings }) {
  const portalName = settings?.nome_imobiliaria || "Lar Imóveis";
  const logoUrl = settings?.logo_url;
  const address = settings?.endereco_completo;
  const social = settings?.redes_sociais || {};

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img className="h-10" src={logoUrl} alt={portalName} />
              ) : (
                <h3 className="text-2xl font-bold">{portalName}</h3>
              )}
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Descubra as melhores oportunidades do mercado imobiliário com a nossa plataforma moderna. Encontre o imóvel dos seus sonhos hoje.
            </p>
            {address && <p className="text-gray-400 text-sm mt-4">{address}</p>}
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white">Início</Link></li>
              <li><Link to={createPageUrl('Imoveis')} className="text-gray-400 hover:text-white">Buscar Imóveis</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Sobre Nós</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Facebook /></a>}
              {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Instagram /></a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Linkedin /></a>}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {portalName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}