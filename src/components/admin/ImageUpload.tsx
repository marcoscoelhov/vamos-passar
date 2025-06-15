
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro no upload',
        description: 'Por favor, selecione um arquivo de imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro no upload',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // For now, we'll create a local URL. In a real app, this would upload to Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      onChange(imageUrl);
      
      toast({
        title: 'Upload realizado',
        description: 'Imagem carregada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value ? (
        <Card className="relative aspect-video overflow-hidden">
          <img 
            src={value} 
            alt="Course thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="aspect-video border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Image className="h-12 w-12 mb-4" />
            <p className="text-sm font-medium mb-2">Adicionar imagem do curso</p>
            <p className="text-xs text-center mb-4">PNG, JPG até 5MB</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Enviando...' : 'Selecionar imagem'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
