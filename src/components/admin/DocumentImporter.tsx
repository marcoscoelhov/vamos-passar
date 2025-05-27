
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProcessingStatus } from './ProcessingStatus';
import { FileUpload } from './FileUpload';
import { validateFile } from '@/utils/fileValidation';
import { 
  processWordDocument, 
  processPDFDocument, 
  extractTopicsFromContent,
  type SuggestedTopic,
  type ProcessingStatus as ProcessingStatusType 
} from '@/utils/documentProcessing';

interface DocumentImporterProps {
  onContentExtracted: (content: string, suggestedTopics?: SuggestedTopic[]) => void;
}

export function DocumentImporter({ onContentExtracted }: DocumentImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast({
          title: 'Erro na validação do arquivo',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const updateProcessingStatus = (stage: ProcessingStatusType['stage'], progress: number, message: string) => {
    setProcessingStatus({ stage, progress, message });
  };

  const handleProcessDocument = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    updateProcessingStatus('uploading', 10, 'Iniciando processamento...');
    
    try {
      let extractedContent = '';
      
      if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          uploadedFile.name.endsWith('.docx')) {
        extractedContent = await processWordDocument(uploadedFile, updateProcessingStatus);
      } else if (uploadedFile.type === 'application/pdf' || uploadedFile.name.endsWith('.pdf')) {
        extractedContent = await processPDFDocument(uploadedFile, updateProcessingStatus);
      } else {
        throw new Error('Tipo de arquivo não suportado. Use arquivos .docx ou .pdf');
      }
      
      // Passar o nome do arquivo para a extração de tópicos
      const suggestedTopics = extractTopicsFromContent(extractedContent, updateProcessingStatus, uploadedFile.name);
      
      updateProcessingStatus('complete', 100, 'Processamento concluído com sucesso!');
      
      setTimeout(() => {
        onContentExtracted(extractedContent, suggestedTopics);
        
        toast({
          title: 'Documento processado com sucesso',
          description: `Conteúdo extraído e ${suggestedTopics.length} tópicos identificados.`,
        });
        
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

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Importar Documento</h3>
        </div>
        
        <FileUpload
          uploadedFile={uploadedFile}
          onFileSelect={handleFileSelect}
          onClearFile={clearUploadedFile}
          isProcessing={isProcessing}
          fileInputRef={fileInputRef}
        />
        
        {processingStatus && (
          <ProcessingStatus
            stage={processingStatus.stage}
            progress={processingStatus.progress}
            message={processingStatus.message}
          />
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
