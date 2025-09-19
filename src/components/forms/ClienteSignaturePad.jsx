import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, RotateCcw, Check } from 'lucide-react';

export default function ClienteSignaturePad({ value, onChange, required = false, error = null }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';

    // Se há valor inicial, desenhar
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event.touches) {
      // Touch events
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse events
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const coordinates = getCoordinates(event);
    setIsDrawing(true);
    setLastPosition(coordinates);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coordinates.x, coordinates.y);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();

    const coordinates = getCoordinates(event);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(coordinates.x, coordinates.y);
    ctx.stroke();
    
    setLastPosition(coordinates);
  };

  const stopDrawing = (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    
    setIsDrawing(false);
    setHasSignature(true);
    
    // Salvar assinatura
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onChange(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PenTool className="w-4 h-4 text-blue-600" />
          Assinatura Digital do Cliente
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="border border-gray-300 rounded bg-white cursor-crosshair w-full"
            style={{ touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasSignature ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                Assinatura capturada
              </div>
            ) : (
              "Assine na área acima com o mouse ou toque"
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {required && !hasSignature && (
          <p className="text-amber-600 text-sm">
            A assinatura do cliente é obrigatória para finalizar a ficha de visita.
          </p>
        )}
      </CardContent>
    </Card>
  );
}