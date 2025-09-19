import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Star, GripVertical, Plus, Loader2, Camera } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { UploadFile } from "@/api/integrations";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const MAX_PHOTOS = 25;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1920; // max width/height

// Helper function to convert images to WebP
const convertToWebP = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Falha na conversão para WebP.'));
            return;
          }
          const newFile = new File([blob], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' });
          resolve(newFile);
        }, 'image/webp', 0.9); // 90% quality
      };
      img.onerror = (err) => reject(new Error('Não foi possível carregar a imagem.'));
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
};


export default function PropertyPhotoGallery({ photos = [], onPhotosChange, mainPhoto, onSetMainPhoto }) {
  const [uploading, setUploading] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (files) => {
    const fileList = Array.from(files);

    if (photos.length + fileList.length > MAX_PHOTOS) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${MAX_PHOTOS} fotos por imóvel. Você pode adicionar mais ${MAX_PHOTOS - photos.length} fotos.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const conversionPromises = fileList.map(file => convertToWebP(file));
      const convertedFiles = await Promise.all(conversionPromises);

      const validFiles = [];
      for (const file of convertedFiles) {
        if (file.size > MAX_FILE_SIZE) {
           toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) ultrapassa o limite de 5MB após a otimização.`,
            variant: "destructive",
          });
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      const uploadPromises = validFiles.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return { url: file_url, nome_arquivo: file.name, ordem: photos.length };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      
      onPhotosChange([...photos, ...uploadedPhotos]);
      
      toast({
        title: "Upload concluído",
        description: `${uploadedPhotos.length} foto(s) otimizada(s) e adicionada(s) com sucesso.`,
      });

    } catch (error) {
      console.error("Erro no processamento de imagem:", error);
      toast({
        title: "Erro no Upload",
        description: error.message || "Não foi possível processar uma ou mais imagens.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [photos, onPhotosChange, toast]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const removePhoto = useCallback((indexToRemove) => {
    onPhotosChange(photos.filter((_, index) => index !== indexToRemove));
  }, [photos, onPhotosChange]);

  const setAsMain = useCallback((photoUrl) => {
    onSetMainPhoto(photoUrl);
  }, [onSetMainPhoto]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({ ...item, ordem: index }));
    onPhotosChange(updatedItems);
  }, [photos, onPhotosChange]);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Galeria de Fotos
            <Badge variant="outline">{photos.length}/{MAX_PHOTOS}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            draggedOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${photos.length >= MAX_PHOTOS ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                Otimizando e enviando...
              </p>
              <p className="text-sm text-gray-500">
                Por favor, aguarde. As imagens estão sendo convertidas para WebP.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Arraste fotos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Qualquer formato de imagem • Máx. 5MB por foto • Até {MAX_PHOTOS} fotos
                </p>
              </div>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="photo-upload"
                  ref={fileInputRef}
                  disabled={photos.length >= MAX_PHOTOS || uploading}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="cursor-pointer"
                  disabled={photos.length >= MAX_PHOTOS || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Selecionar Fotos
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery" direction="horizontal">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                  {photos.map((photo, index) => (
                    <Draggable key={photo.url} draggableId={photo.url} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative group border rounded-lg overflow-hidden shadow-sm"
                        >
                          <div {...provided.dragHandleProps} className="absolute top-1 left-1 z-10 p-1 bg-white/50 rounded-full cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-gray-700" />
                          </div>
                          
                          <img 
                            src={photo.url} 
                            alt={`Foto ${index + 1}`} 
                            className="w-full h-32 object-cover" 
                          />
                          
                          {mainPhoto === photo.url && (
                             <Badge className="absolute top-2 right-2 bg-green-600 text-white shadow">
                               <Star className="w-3 h-3 mr-1" />
                               Principal
                             </Badge>
                          )}
                          
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {mainPhoto !== photo.url && (
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => setAsMain(photo.url)}
                                className="h-8"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removePhoto(index)}
                              className="h-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
}