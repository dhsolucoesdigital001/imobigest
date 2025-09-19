import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export default function CaptadorSelector({ captadores = [], onCaptatoresChange, corretores = [] }) {
  const [selectedCaptador, setSelectedCaptador] = useState("");
  const [comissao, setComissao] = useState("");

  const handleAddCaptador = () => {
    if (!selectedCaptador || !comissao) return;
    
    const corretor = corretores.find(c => c.id === selectedCaptador);
    if (!corretor) return;

    const novoCaptador = {
      user_id: selectedCaptador,
      nome: corretor.full_name || corretor.nome,
      comissao: parseFloat(comissao) || 0
    };

    // Evita duplicatas
    const jaExiste = captadores.some(c => c.user_id === selectedCaptador);
    if (!jaExiste) {
      onCaptatoresChange([...captadores, novoCaptador]);
      setSelectedCaptador("");
      setComissao("");
    }
  };

  const handleRemoveCaptador = (userIdToRemove) => {
    onCaptatoresChange(captadores.filter(c => c.user_id !== userIdToRemove));
  };

  return (
    <div className="space-y-4">
      <Label>Captadores/Corretores</Label>
      
      {/* Lista de captadores selecionados */}
      {captadores && captadores.length > 0 && (
        <div className="space-y-2">
          {captadores.map((captador, index) => (
            <div key={captador.user_id || index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div>
                <span className="font-medium">{captador.nome}</span>
                <span className="text-sm text-gray-500 ml-2">
                  Comissão: {captador.comissao || 0}%
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCaptador(captador.user_id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário para adicionar novo captador */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Select value={selectedCaptador} onValueChange={setSelectedCaptador}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um corretor" />
            </SelectTrigger>
            <SelectContent>
              {corretores.map(corretor => (
                <SelectItem key={corretor.id} value={corretor.id}>
                  {corretor.full_name || corretor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder="% Comissão"
            value={comissao}
            onChange={(e) => setComissao(e.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={handleAddCaptador}
          disabled={!selectedCaptador || !comissao}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}