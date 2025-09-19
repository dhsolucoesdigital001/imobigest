import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast';

export default function LogoUploader({ 
  currentImageUrl, 
  onImageChange, 
  label = "Logo", 
  acceptedTypes = ['.png', '.jpg', '.jpeg', '.svg'],
  maxSize = 2, // MB
  showPreview = true 
}) {
  const [isUploading, setIsUploading] = useState(false);
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
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      toast({
        title: "Formato não suportado",
        description: `Formatos aceitos: ${acceptedTypes.join(', ')}`,
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
        description: `${label} enviado com sucesso.`
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: `Não foi possível enviar o ${label.toLowerCase()}. Tente novamente.`,
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
      <Label className="text-base font-medium">{label}</Label>
      
      {/* Preview da Imagem */}
      {currentImageUrl && showPreview && (
        <Card className="relative border border-gray-200">
          <CardContent className="p-4">
            <div className="relative flex items-center justify-center bg-gray-50 rounded-lg h-24">
              <img 
                src={currentImageUrl} 
                alt={`Preview ${label}`} 
                className="max-h-20 max-w-full object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2 truncate">
              {currentImageUrl}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Component */}
      <div className="relative">
        <input
          type="file"
          id={`upload-${label.toLowerCase()}`}
          accept={acceptedTypes.join(',')}
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />
        
        <Card className={`border-2 border-dashed transition-colors ${
          isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <CardContent className="p-6">
            <label 
              htmlFor={`upload-${label.toLowerCase()}`} 
              className="cursor-pointer block text-center"
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
                  <p className="text-blue-600 font-medium">Enviando...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-600 font-medium">
                      {currentImageUrl ? `Substituir ${label}` : `Enviar ${label}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Formatos: {acceptedTypes.join(', ')} • Máx. {maxSize}MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}