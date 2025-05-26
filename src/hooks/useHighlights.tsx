
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Highlight, DbHighlight } from '@/types/course';

export function useHighlights(topicId?: string, userId?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mapDbHighlightToHighlight = (dbHighlight: DbHighlight): Highlight => ({
    id: dbHighlight.id,
    userId: dbHighlight.user_id,
    topicId: dbHighlight.topic_id,
    highlightedText: dbHighlight.highlighted_text,
    contextBefore: dbHighlight.context_before || undefined,
    contextAfter: dbHighlight.context_after || undefined,
    positionStart: dbHighlight.position_start,
    positionEnd: dbHighlight.position_end,
    note: dbHighlight.note || undefined,
    createdAt: dbHighlight.created_at,
    updatedAt: dbHighlight.updated_at,
  });

  const fetchHighlights = async () => {
    if (!topicId || !userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_highlights')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', userId)
        .order('position_start', { ascending: true });

      if (error) throw error;

      const mappedHighlights = (data || []).map(mapDbHighlightToHighlight);
      setHighlights(mappedHighlights);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os destaques.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHighlight = async (
    highlightedText: string,
    positionStart: number,
    positionEnd: number,
    contextBefore?: string,
    contextAfter?: string,
    note?: string
  ) => {
    if (!topicId || !userId) return;

    try {
      const { data, error } = await supabase
        .from('user_highlights')
        .insert([
          {
            user_id: userId,
            topic_id: topicId,
            highlighted_text: highlightedText,
            context_before: contextBefore,
            context_after: contextAfter,
            position_start: positionStart,
            position_end: positionEnd,
            note,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newHighlight = mapDbHighlightToHighlight(data);
      setHighlights(prev => [...prev, newHighlight].sort((a, b) => a.positionStart - b.positionStart));

      toast({
        title: 'Destaque adicionado',
        description: 'Seu destaque foi salvo com sucesso.',
      });

      return newHighlight;
    } catch (error) {
      console.error('Error adding highlight:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o destaque.',
        variant: 'destructive',
      });
    }
  };

  const updateHighlight = async (highlightId: string, note: string) => {
    try {
      const { data, error } = await supabase
        .from('user_highlights')
        .update({ note, updated_at: new Date().toISOString() })
        .eq('id', highlightId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedHighlight = mapDbHighlightToHighlight(data);
      setHighlights(prev => 
        prev.map(h => h.id === highlightId ? updatedHighlight : h)
      );

      toast({
        title: 'Destaque atualizado',
        description: 'Sua nota foi salva com sucesso.',
      });

      return updatedHighlight;
    } catch (error) {
      console.error('Error updating highlight:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o destaque.',
        variant: 'destructive',
      });
    }
  };

  const deleteHighlight = async (highlightId: string) => {
    try {
      const { error } = await supabase
        .from('user_highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', userId);

      if (error) throw error;

      setHighlights(prev => prev.filter(h => h.id !== highlightId));

      toast({
        title: 'Destaque removido',
        description: 'O destaque foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o destaque.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [topicId, userId]);

  return {
    highlights,
    isLoading,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    fetchHighlights,
  };
}
