import React, { useState, useEffect } from "react";
import { Imovel } from "@/api/entities";

export default function ApiPublicProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const allProperties = await Imovel.list("-created_date");
      // Filtrar apenas imóveis ativos para o portal público
      const activeProperties = allProperties
        .filter(property => property.ativo === true)
        .map(property => ({
          id: property.id,
          codigo: property.codigo,
          tipo: property.tipo,
          situacao: property.situacao,
          endereco: property.mostrar_endereco_completo ? property.endereco : 'Endereço sob consulta',
          bairro: property.bairro,
          cidade: property.cidade,
          estado: property.estado,
          valor: property.valor,
          valor_condominio: property.valor_condominio,
          valor_iptu: property.valor_iptu,
          quartos: property.quartos,
          suites: property.suites,
          banheiros: property.banheiros,
          vagas: property.vagas,
          area_util_total: property.area_util_total,
          descricao: property.descricao,
          caracteristicas_extras: property.caracteristicas_extras || [],
          foto_principal: property.foto_principal,
          fotos: property.fotos || [],
          video_url: property.video_url,
          estagio: property.estagio,
          created_date: property.created_date,
          updated_date: property.updated_date
        }));
      
      setProperties(activeProperties);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const response = {
    success: true,
    total: properties.length,
    data: properties,
    timestamp: new Date().toISOString()
  };

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap', 
      padding: '20px', 
      backgroundColor: '#1e1e1e', 
      color: '#50e3c2',
      minHeight: '100vh',
      fontSize: '14px'
    }}>
      {JSON.stringify(response, null, 2)}
    </div>
  );
}