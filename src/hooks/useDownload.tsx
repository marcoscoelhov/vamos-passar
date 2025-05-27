
import { useState } from 'react';
import { Topic } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { generatePDFFromTopics } from '@/utils/pdfFormatter';
import { generateTopicHTML, generateTopicsBundle } from '@/utils/htmlFormatter';

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const generateTopicsAsPDF = async (topics: Topic[], courseName: string) => {
    try {
      setIsDownloading(true);
      
      const pdf = generatePDFFromTopics(topics, courseName);
      
      // Salvar PDF
      const fileName = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_completo.pdf`;
      pdf.save(fileName);

      toast({
        title: 'PDF gerado com sucesso',
        description: 'O material completo foi baixado em PDF.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTopic = async (topic: Topic, includeQuestions: boolean = true) => {
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

      toast({
        title: 'Download concluído',
        description: 'O arquivo foi baixado com sucesso. Você pode imprimir ou estudar offline.',
      });
    } catch (error) {
      console.error('Error downloading topic:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o conteúdo.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTopicsAsBundle = async (topics: Topic[], courseName: string) => {
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

      toast({
        title: 'Download concluído',
        description: 'O material completo foi baixado com sucesso.',
      });
    } catch (error) {
      console.error('Error downloading bundle:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o material completo.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    downloadTopic,
    downloadTopicsAsBundle,
    generateTopicsAsPDF,
  };
}
