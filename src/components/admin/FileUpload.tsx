
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, File, CheckCircle, X } from 'lucide-react';
import { formatFileSize, getSupportedFormats, MAX_FILE_SIZE } from '@/utils/fileValidation';

interface FileUploadProps {
  uploadedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  isProcessing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function FileUpload({ 
  uploadedFile, 
  onFileSelect, 
  onClearFile, 
  isProcessing, 
  fileInputRef 
}: FileUploadProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Arquivo
          </label>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf"
            onChange={onFileSelect}
            className="cursor-pointer"
            disabled={isProcessing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formatos Suportados
          </label>
          <div className="flex flex-wrap gap-2">
            {getSupportedFormats().map((format) => (
              <Badge key={format.extension} variant="outline" className="text-xs">
                {format.extension}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {uploadedFile && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
          {uploadedFile.name.endsWith('.docx') ? (
            <FileText className="w-8 h-8 text-blue-600" />
          ) : (
            <File className="w-8 h-8 text-red-600" />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{uploadedFile.name}</p>
            <p className="text-xs text-gray-600">
              {formatFileSize(uploadedFile.size)}
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearFile}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          Importe documentos Word (.docx) ou PDF para extrair conteúdo automaticamente com formatação preservada.
          Tamanho máximo: {MAX_FILE_SIZE / 1024 / 1024}MB.
        </p>
      </div>
    </>
  );
}
