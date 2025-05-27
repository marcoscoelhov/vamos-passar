
import { useState, useCallback } from 'react';
import { Topic } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { generatePDFFromTopics } from '@/utils/pdfFormatter';
import { generateTopicHTML, generateTopicsBundle } from '@/utils/htmlFormatter';

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const showSuccessToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
    });
  }, [toast]);

  const showErrorToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const generateTopicsAsPDF = useCallback(async (topics: Topic[], courseName: string) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      
      const pdf = generatePDFFromTopics(topics, courseName);
      
      // Save PDF
      const fileName = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_completo.pdf`;
      pdf.save(fileName);

      showSuccessToast('PDF gerado com sucesso', 'O material completo foi baixado em PDF.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showErrorToast('Erro ao gerar PDF', 'Não foi possível gerar o arquivo PDF.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, showSuccessToast, showErrorToast]);

  const downloadTopic = useCallback(async (topic: Topic, includeQuestions: boolean = true) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      
      const html = generateTopicHTML(topic, includeQuestions);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccessToast('Download concluído', 'O arquivo foi baixado com sucesso. Você pode imprimir ou estudar offline.');
    } catch (error) {
      console.error('Error downloading topic:', error);
      showErrorToast('Erro no download', 'Não foi possível baixar o conteúdo.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, showSuccessToast, showErrorToast]);

  const downloadTopicsAsBundle = useCallback(async (topics: Topic[], courseName: string) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      
      const html = generateTopicsBundle(topics, courseName);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_completo.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccessToast('Download concluído', 'O material completo foi baixado com sucesso.');
    } catch (error) {
      console.error('Error downloading bundle:', error);
      showErrorToast('Erro no download', 'Não foi possível baixar o material completo.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, showSuccessToast, showErrorToast]);

  return {
    isDownloading,
    downloadTopic,
    downloadTopicsAsBundle,
    generateTopicsAsPDF,
  };
}
