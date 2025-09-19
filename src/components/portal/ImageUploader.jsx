import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, X, Link, Loader2 } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast';

export default function ImageUploader({ 
  currentImageUrl, 
  onImageChange, 
  label = "Imagem", 
  maxSize = 2, 
  maxWidth = 1920, 
  maxHeight = 1080 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState(currentImageUrl || '');
  const [useManualUrl, setUseManualUrl] = useState(!currentImageUrl);
  const { toast } = useToast();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB.`,
        variant: "destructive"
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens são permitidas.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Comprimir imagem se necessário
      const compressedFile = await compressImage(file, maxWidth, maxHeight);
      
      // Upload do arquivo
      const { file_url } = await UploadFile({ file: compressedFile });
      
      onImageChange(file_url);
      setManualUrl(file_url);
      setUseManualUrl(false);
      
      toast({
        title: "Sucesso!",
        description: "Imagem enviada com sucesso."
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const compressImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', 0.85);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleManualUrlChange = (url) => {
    setManualUrl(url);
    onImageChange(url);
  };

  const removeImage = () => {
    onImageChange('');
    setManualUrl('');
    setUseManualUrl(true);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      
      {/* Preview da Imagem */}
      {currentImageUrl && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative">
              <img 
                src={currentImageUrl} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2 truncate">
              URL: {currentImageUrl}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload de Arquivo */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-gray-600">Clique para enviar uma imagem</p>
              <p className="text-xs text-gray-500">
                Máximo {maxSize}MB • {maxWidth}x{maxHeight}px • JPG, PNG
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('file-upload').click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* URL Manual */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <Link className="w-4 h-4" />
          Ou insira uma URL externa
        </Label>
        <Input
          value={manualUrl}
          onChange={(e) => handleManualUrlChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={isUploading}
        />
        <p className="text-xs text-gray-500">
          Cole aqui a URL de uma imagem externa como fallback
        </p>
      </div>
    </div>
  );
}