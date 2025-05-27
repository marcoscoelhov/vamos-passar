
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, File, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentImporterProps {
  onContentExtracted: (content: string, suggestedTopics?: SuggestedTopic[]) => void;
}

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

interface ProcessingStatus {
  stage: 'uploading' | 'processing' | 'extracting' | 'complete';
  progress: number;
  message: string;
}

export function DocumentImporter({ onContentExtracted }: DocumentImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Constantes de validação
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const SUPPORTED_EXTENSIONS = ['.docx', '.pdf'];

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return `Tipo de arquivo não suportado. Use: ${SUPPORTED_EXTENSIONS.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'Erro na validação do arquivo',
          description: error,
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const updateProcessingStatus = (stage: ProcessingStatus['stage'], progress: number, message: string) => {
    setProcessingStatus({ stage, progress, message });
  };

  const processWordDocument = async (file: File): Promise<string> => {
    updateProcessingStatus('processing', 25, 'Carregando biblioteca de processamento...');
    
    try {
      // Dynamic import for mammoth
      const mammoth = await import('mammoth');
      
      updateProcessingStatus('processing', 50, 'Extraindo conteúdo do documento...');
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (result.messages.length > 0) {
        console.warn('Avisos durante a conversão:', result.messages);
      }
      
      updateProcessingStatus('processing', 75, 'Processamento concluído');
      
      return result.value;
    } catch (error) {
      console.error('Erro ao processar documento Word:', error);
      throw new Error('Erro ao processar documento Word. Verifique se o arquivo não está corrompido.');
    }
  };

  const processPDFDocument = async (file: File): Promise<string> => {
    updateProcessingStatus('processing', 25, 'Carregando biblioteca PDF...');
    
    try {
      // Dynamic import for pdf-parse
      const pdfParse = await import('pdf-parse');
      
      updateProcessingStatus('processing', 50, 'Extraindo texto do PDF...');
      
      const arrayBuffer = await file.arrayBuffer();
      const data = await pdfParse.default(arrayBuffer);
      
      updateProcessingStatus('processing', 75, 'Formatando conteúdo extraído...');
      
      // Convert plain text to basic HTML structure
      const lines = data.text.split('\n').filter(line => line.trim() !== '');
      let htmlContent = '';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Try to detect headings (lines that are short and possibly all caps or title case)
        if (trimmedLine.length < 100 && 
            (trimmedLine === trimmedLine.toUpperCase() || 
             trimmedLine.match(/^[A-Z][^.]*$/))) {
          htmlContent += `<h2>${trimmedLine}</h2>\n`;
        } else {
          htmlContent += `<p>${trimmedLine}</p>\n`;
        }
      });
      
      return htmlContent;
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      throw new Error('Erro ao processar PDF. Verifique se o arquivo não está corrompido ou protegido por senha.');
    }
  };

  const extractTopicsFromContent = (content: string): SuggestedTopic[] => {
    updateProcessingStatus('extracting', 80, 'Identificando estrutura de tópicos...');
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const topics: SuggestedTopic[] = [];
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1)) - 1;
      let topicContent = '';
      
      // Extrair conteúdo até o próximo cabeçalho
      let nextSibling = heading.nextElementSibling;
      while (nextSibling && !nextSibling.matches('h1, h2, h3, h4, h5, h6')) {
        topicContent += nextSibling.outerHTML || nextSibling.textContent || '';
        nextSibling = nextSibling.nextElementSibling;
      }
      
      if (heading.textContent && topicContent.trim()) {
        topics.push({
          title: heading.textContent.trim(),
          content: topicContent.trim(),
          level: level
        });
      }
    });
    
    // Se não encontrou cabeçalhos estruturados, criar um tópico único
    if (topics.length === 0 && content.trim()) {
      topics.push({
        title: 'Conteúdo Importado',
        content: content.trim(),
        level: 0
      });
    }
    
    return topics;
  };

  const handleProcessDocument = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    updateProcessingStatus('uploading', 10, 'Iniciando processamento...');
    
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
      
      updateProcessingStatus('complete', 100, 'Processamento concluído com sucesso!');
      
      // Small delay to show completion
      setTimeout(() => {
        onContentExtracted(extractedContent, suggestedTopics);
        
        toast({
          title: 'Documento processado com sucesso',
          description: `Conteúdo extraído e ${suggestedTopics.length} tópicos identificados.`,
        });
        
        // Reset form
        setUploadedFile(null);
        setProcessingStatus(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast({
        title: 'Erro ao processar documento',
        description: error instanceof Error ? error.message : 'Erro desconhecido ao processar o documento',
        variant: 'destructive',
      });
      setProcessingStatus(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSupportedFormats = () => {
    return [
      { extension: '.docx', description: 'Documentos do Microsoft Word', status: 'Suportado' },
      { extension: '.pdf', description: 'Documentos PDF', status: 'Suportado' }
    ];
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
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
          Tamanho máximo: {MAX_FILE_SIZE / 1024 / 1024}MB.
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
        
        {/* Processing Status */}
        {processingStatus && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {processingStatus.message}
              </span>
              <span className="text-sm text-blue-700">
                {processingStatus.progress}%
              </span>
            </div>
            <Progress value={processingStatus.progress} className="h-2" />
          </div>
        )}
        
        {uploadedFile && !processingStatus && (
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
                onClick={clearUploadedFile}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
            <CheckCircle className="w-3 h-3 text-green-600" />
            Documentos Word: Formatação preservada com precisão
          </p>
          <p className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            PDFs: Extração de texto com detecção automática de estrutura
          </p>
          <p className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-yellow-600" />
            Arquivos protegidos por senha não são suportados
          </p>
        </div>
      </div>
    </Card>
  );
}
