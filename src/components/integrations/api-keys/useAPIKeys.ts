
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { APIKey, NewKeyData } from './types';

export function useAPIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<NewKeyData>({
    name: '',
    permissions: [],
    rate_limit: 1000,
    expires_at: ''
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: APIKey[] = (data || []).map(item => ({
        ...item,
        permissions: Array.isArray(item.permissions) ? item.permissions as string[] : []
      }));
      
      setApiKeys(transformedData);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as chaves API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    try {
      // Generate new API key
      const { data: keyData, error: keyError } = await supabase
        .rpc('generate_api_key');

      if (keyError) throw keyError;

      const fullKey = keyData;
      const keyPrefix = fullKey.substring(0, 8) + '...';
      
      // Hash the key for storage
      const { data: hashData, error: hashError } = await supabase
        .rpc('hash_api_key', { key: fullKey });

      if (hashError) throw hashError;

      // Store in database
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyData.name,
          key_hash: hashData,
          key_prefix: keyPrefix,
          permissions: newKeyData.permissions,
          rate_limit: newKeyData.rate_limit,
          expires_at: newKeyData.expires_at || null
        });

      if (insertError) throw insertError;

      setGeneratedKey(fullKey);
      setNewKeyData({ name: '', permissions: [], rate_limit: 1000, expires_at: '' });
      loadAPIKeys();

      toast({
        title: "Sucesso",
        description: "Chave API criada com sucesso!"
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a chave API",
        variant: "destructive"
      });
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadAPIKeys();
      toast({
        title: "Sucesso",
        description: "Chave API removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a chave API",
        variant: "destructive"
      });
    }
  };

  const toggleAPIKey = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      loadAPIKeys();
      toast({
        title: "Sucesso",
        description: `Chave API ${!isActive ? 'ativada' : 'desativada'} com sucesso`
      });
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da chave API",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave API copiada para a área de transferência"
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadAPIKeys();
  }, []);

  return {
    apiKeys,
    loading,
    showCreateDialog,
    setShowCreateDialog,
    newKeyData,
    setNewKeyData,
    generatedKey,
    setGeneratedKey,
    createAPIKey,
    deleteAPIKey,
    toggleAPIKey,
    copyToClipboard,
    formatDate
  };
}
