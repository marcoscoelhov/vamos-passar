
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface AnalyticsData {
  totalStudents: number;
  totalTopics: number;
  totalQuestions: number;
  activeStudents: number;
  averageProgress: number;
  completionRate: number;
  topPerformers: Array<{
    id: string;
    name: string;
    email: string;
    progress: number;
  }>;
  difficultyStats: Array<{
    difficulty: string;
    count: number;
    successRate: number;
  }>;
  recentActivity: Array<{
    user_name: string;
    topic_title: string;
    completed_at: string;
  }>;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      logger.debug('Fetching analytics data...');
      
      // Buscar dados básicos
      const [
        { data: students, count: totalStudents },
        { data: topics, count: totalTopics },
        { data: questions, count: totalQuestions },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('topics').select('*', { count: 'exact' }),
        supabase.from('questions').select('*', { count: 'exact' }),
      ]);

      // Calcular estudantes ativos (com atividade nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeStudentsData } = await supabase
        .from('user_progress')
        .select('user_id')
        .gte('updated_at', thirtyDaysAgo.toISOString())
        .neq('user_id', null);

      const activeStudents = new Set(activeStudentsData?.map(p => p.user_id)).size;

      // Calcular progresso médio e taxa de conclusão
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('user_id, completed');

      const progressByUser = new Map();
      allProgress?.forEach(progress => {
        if (!progressByUser.has(progress.user_id)) {
          progressByUser.set(progress.user_id, { completed: 0, total: 0 });
        }
        const userProgress = progressByUser.get(progress.user_id);
        userProgress.total++;
        if (progress.completed) userProgress.completed++;
      });

      const progressPercentages = Array.from(progressByUser.values())
        .map(p => (p.completed / p.total) * 100);
      
      const averageProgress = progressPercentages.length > 0
        ? progressPercentages.reduce((sum, p) => sum + p, 0) / progressPercentages.length
        : 0;

      const completionRate = progressPercentages.length > 0
        ? progressPercentages.filter(p => p === 100).length / progressPercentages.length * 100
        : 0;

      // Top performers
      const topPerformers = await Promise.all(
        Array.from(progressByUser.entries())
          .map(([userId, progress]) => ({
            userId,
            progress: (progress.completed / progress.total) * 100
          }))
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 5)
          .map(async ({ userId, progress }) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', userId)
              .single();

            return {
              id: userId,
              name: profile?.name || 'Nome não informado',
              email: profile?.email || '',
              progress: Math.round(progress),
            };
          })
      );

      // Estatísticas de dificuldade
      const { data: questionsWithAttempts } = await supabase
        .from('questions')
        .select(`
          difficulty,
          user_question_attempts (
            is_correct
          )
        `);

      const difficultyStats = ['easy', 'medium', 'hard'].map(difficulty => {
        const questionsOfDifficulty = questionsWithAttempts?.filter(q => q.difficulty === difficulty) || [];
        const totalAttempts = questionsOfDifficulty.reduce((sum, q) => sum + (q.user_question_attempts?.length || 0), 0);
        const correctAttempts = questionsOfDifficulty.reduce((sum, q) => 
          sum + (q.user_question_attempts?.filter((a: any) => a.is_correct).length || 0), 0);

        return {
          difficulty: difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil',
          count: questionsOfDifficulty.length,
          successRate: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        };
      });

      // Atividade recente
      const { data: recentActivityData } = await supabase
        .from('user_progress')
        .select(`
          completed_at,
          profiles!user_progress_user_id_fkey (name),
          topics!user_progress_topic_id_fkey (title)
        `)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);

      const recentActivity = (recentActivityData || []).map(activity => ({
        user_name: (activity.profiles as any)?.name || 'Usuário desconhecido',
        topic_title: (activity.topics as any)?.title || 'Tópico desconhecido',
        completed_at: activity.completed_at!,
      }));

      setAnalytics({
        totalStudents: totalStudents || 0,
        totalTopics: totalTopics || 0,
        totalQuestions: totalQuestions || 0,
        activeStudents,
        averageProgress: Math.round(averageProgress),
        completionRate: Math.round(completionRate),
        topPerformers,
        difficultyStats,
        recentActivity,
      });

      logger.info('Analytics data fetched successfully', {
        totalStudents: totalStudents || 0,
        totalTopics: totalTopics || 0,
        totalQuestions: totalQuestions || 0,
        activeStudents
      });

    } catch (error) {
      logger.error('Error fetching analytics', error);
      toast({
        title: 'Erro ao carregar analytics',
        description: 'Não foi possível carregar os dados analíticos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    refreshAnalytics: fetchAnalytics,
  };
}
