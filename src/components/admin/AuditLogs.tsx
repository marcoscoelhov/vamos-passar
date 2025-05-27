
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AuditLogs() {
  const {
    logs,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    filterTable,
    setFilterTable,
    filterAction,
    setFilterAction,
  } = useAuditLogs();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Plus className="w-4 h-4" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'Criação';
      case 'UPDATE':
        return 'Atualização';
      case 'DELETE':
        return 'Exclusão';
      default:
        return action;
    }
  };

  const getTableLabel = (tableName: string) => {
    switch (tableName) {
      case 'topics':
        return 'Tópicos';
      case 'questions':
        return 'Questões';
      case 'profiles':
        return 'Perfis';
      default:
        return tableName || 'Desconhecida';
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Logs de Auditoria</h2>
          <Badge variant="outline">{logs.length} registros</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todas as tabelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tabelas</SelectItem>
              <SelectItem value="topics">Tópicos</SelectItem>
              <SelectItem value="questions">Questões</SelectItem>
              <SelectItem value="profiles">Perfis</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="INSERT">Criação</SelectItem>
              <SelectItem value="UPDATE">Atualização</SelectItem>
              <SelectItem value="DELETE">Exclusão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getActionColor(log.action)}>
                    {getActionIcon(log.action)}
                    <span className="ml-1">{getActionLabel(log.action)}</span>
                  </Badge>
                  
                  <span className="text-sm text-gray-600">
                    em <strong>{getTableLabel(log.table_name || '')}</strong>
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    por <strong>{log.admin_name}</strong>
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Data:</strong> {formatDate(log.created_at)}</p>
                  {log.record_id && (
                    <p><strong>ID do registro:</strong> {log.record_id}</p>
                  )}
                </div>
                
                {/* Mostrar dados alterados para UPDATE */}
                {log.action === 'UPDATE' && log.old_data && log.new_data && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                    <p className="font-medium mb-2">Alterações realizadas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-red-600">Valor anterior:</p>
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(log.old_data, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">Novo valor:</p>
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(log.new_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mostrar dados criados para INSERT */}
                {log.action === 'INSERT' && log.new_data && (
                  <div className="mt-3 p-3 bg-green-50 rounded text-xs">
                    <p className="font-medium mb-2">Dados criados:</p>
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {/* Mostrar dados excluídos para DELETE */}
                {log.action === 'DELETE' && log.old_data && (
                  <div className="mt-3 p-3 bg-red-50 rounded text-xs">
                    <p className="font-medium mb-2">Dados excluídos:</p>
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(log.old_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      {logs.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
          <p className="text-gray-600">
            {filterTable && filterTable !== 'all' || filterAction && filterAction !== 'all'
              ? 'Nenhum log corresponde aos filtros aplicados.' 
              : 'Ainda não há logs de auditoria registrados.'
            }
          </p>
        </Card>
      )}
    </div>
  );
}
