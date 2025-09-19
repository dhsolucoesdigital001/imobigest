import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";

export default function ApiPublicLeads() {
  const [response, setResponse] = useState({ message: "Endpoint de leads funcionando" });
  const [method, setMethod] = useState('GET');

  useEffect(() => {
    // Simular detecção do método HTTP
    const urlParams = new URLSearchParams(window.location.search);
    const methodParam = urlParams.get('method');
    
    if (methodParam === 'POST') {
      handlePostRequest();
    } else {
      handleGetRequest();
    }
  }, []);

  const handleGetRequest = () => {
    setResponse({
      success: true,
      message: "API de Leads ativa. Use POST para enviar novos leads.",
      endpoint: "/api/public/leads",
      methods: ["GET", "POST"],
      timestamp: new Date().toISOString()
    });
  };

  const handlePostRequest = async () => {
    try {
      // Simular recebimento de dados de lead
      const leadData = {
        nome: "Lead de Teste",
        email: "teste@exemplo.com",
        telefone: "(31) 99999-9999",
        mensagem: "Interessado em imóvel para compra",
        origem: "Portal Público",
        interesse: "Venda",
        status: "Novo"
      };

      // Criar lead no sistema
      const newLead = await Lead.create(leadData);
      
      setResponse({
        success: true,
        message: "Lead criado com sucesso!",
        lead_id: newLead.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
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