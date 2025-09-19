import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Globe, X, Loader2, AlertTriangle } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast';

export default function FaviconUploader({ 
  currentImageUrl, 
  onImageChange
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho (500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O favicon deve ter no máximo 500KB.",
        variant: "destructive"
      });
      return;
    }

    // Validar tipo (.ico)
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (fileExtension !== '.ico') {
      toast({
        title: "Formato inválido",
        description: "O favicon deve estar no formato .ico",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      onImageChange(file_url);
      
      toast({
        title: "Sucesso!",
        description: "Favicon enviado com sucesso."
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o favicon. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Favicon (Ícone da Aba)</Label>
      
      {/* Preview do Favicon */}
      {currentImageUrl && (
        <Card className="relative border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                <img 
                  src={currentImageUrl} 
                  alt="Preview Favicon" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Favicon Atual</p>
                <p className="text-xs text-gray-600 truncate">
                  {currentImageUrl}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Component */}
      <div className="relative">
        <input
          type="file"
          id="upload-favicon"
          accept=".ico"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />
        
        <Card className={`border-2 border-dashed transition-colors ${
          isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <CardContent className="p-6">
            <label 
              htmlFor="upload-favicon" 
              className="cursor-pointer block text-center"
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
                  <p className="text-blue-600 font-medium">Enviando...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Globe className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-600 font-medium">
                      {currentImageUrl ? 'Substituir Favicon' : 'Enviar Favicon'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Formato: .ico • Máx. 500KB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Dica sobre Favicon */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-amber-800 font-medium mb-1">Dica sobre Favicon</p>
            <p className="text-amber-700">
              O favicon aparece na aba do navegador e nos favoritos. 
              Recomendamos usar um ícone simples de 16x16 ou 32x32 pixels no formato .ico
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}