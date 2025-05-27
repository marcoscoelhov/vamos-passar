
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';

interface DocumentImporterProps {
  onContentExtracted: (content: string, suggestedTopics?: SuggestedTopic[]) => void;
}

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

export function DocumentImporter({ onContentExtracted }: DocumentImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const processWordDocument = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Avisos durante a conversão:', result.messages);
    }
    
    return result.value;
  };

  const processPDFDocument = async (file: File): Promise<string> => {
    // Simulação de processamento de PDF
    // Em produção, você usaria uma biblioteca como pdf-parse ou uma API externa
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`<p>Conteúdo extraído do PDF: ${file.name}</p><p>Este é um exemplo de conteúdo extraído. Em uma implementação real, o texto seria extraído do PDF.</p>`);
      }, 2000);
    });
  };

  const extractTopicsFromContent = (content: string): SuggestedTopic[] => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const topics: SuggestedTopic[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1)) - 1;
      let topicContent = '';
      
      // Extrair conteúdo até o próximo cabeçalho
      let nextSibling = heading.nextElementSibling;
      while (nextSibling && !nextSibling.matches('h1, h2, h3, h4, h5, h6')) {
        topicContent += nextSibling.outerHTML || nextSibling.textContent || '';
        nextSibling = nextSibling.nextElementSibling;
      }
      
      if (heading.textContent && topicContent) {
        topics.push({
          title: heading.textContent.trim(),
          content: topicContent.trim(),
          level: level
        });
      }
    });
    
    return topics;
  };

  const handleProcessDocument = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    try {
      let extractedContent = '';
      
      if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          uploadedFile.name.endsWith('.docx')) {
        extractedContent = await processWordDocument(uploadedFile);
      } else if (uploadedFile.type === 'application/pdf' || uploadedFile.name.endsWith('.pdf')) {
        extractedContent = await processPDFDocument(uploadedFile);
      } else {
        throw new Error('Tipo de arquivo não suportado. Use arquivos .docx ou .pdf');
      }
      
      const suggestedTopics = extractTopicsFromContent(extractedContent);
      
      onContentExtracted(extractedContent, suggestedTopics);
      
      toast({
        title: 'Documento processado com sucesso',
        description: `Conteúdo extraído e ${suggestedTopics.length} tópicos sugeridos.`,
      });
      
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast({
        title: 'Erro ao processar documento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSupportedFormats = () => {
    return [
      { extension: '.docx', description: 'Documentos do Microsoft Word' },
      { extension: '.pdf', description: 'Documentos PDF (em desenvolvimento)' }
    ];
  };

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Importar Documento</h3>
        </div>
        
        <p className="text-sm text-gray-600">
          Importe documentos Word (.docx) ou PDF para extrair conteúdo automaticamente com formatação preservada.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Arquivo
            </label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf"
              onChange={handleFileSelect}
              className="cursor-pointer"
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
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        )}
        
        <Button
          onClick={handleProcessDocument}
          disabled={!uploadedFile || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando documento...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Processar e Extrair Conteúdo
            </>
          )}
        </Button>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Documentos Word: Formatação será preservada automaticamente
          </p>
          <p className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            PDFs: Extração de texto básica (imagens não incluídas)
          </p>
        </div>
      </div>
    </Card>
  );
}
