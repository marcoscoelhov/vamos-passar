
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Download, Upload, RefreshCw, Clock, CheckCircle, AlertTriangle, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Backup {
  id: string;
  name: string;
  type: 'automatic' | 'manual';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
  includes: string[];
}

export function BackupSystem() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Backup Automático - Dezembro 2024',
      type: 'automatic',
      size: '2.3 MB',
      createdAt: new Date().toISOString(),
      status: 'completed',
      includes: ['Conteúdo', 'Questões', 'Usuários', 'Configurações']
    },
    {
      id: '2',
      name: 'Backup Manual - Antes da Atualização',
      type: 'manual',
      size: '2.1 MB',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      includes: ['Conteúdo', 'Questões']
    },
    {
      id: '3',
      name: 'Backup Automático - Novembro 2024',
      type: 'automatic',
      size: '1.8 MB',
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      status: 'completed',
      includes: ['Conteúdo', 'Questões', 'Usuários', 'Configurações']
    }
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [lastAutoBackup, setLastAutoBackup] = useState(new Date());
  const { toast } = useToast();

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simular processo de backup
    const steps = [
      'Coletando dados do curso...',
      'Exportando conteúdo...',
      'Salvando questões...',
      'Comprimindo arquivos...',
      'Finalizando backup...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackupProgress(((i + 1) / steps.length) * 100);
    }

    const newBackup: Backup = {
      id: Date.now().toString(),
      name: `Backup Manual - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      type: 'manual',
      size: '2.4 MB',
      createdAt: new Date().toISOString(),
      status: 'completed',
      includes: ['Conteúdo', 'Questões', 'Usuários', 'Configurações']
    };

    setBackups(prev => [newBackup, ...prev]);
    setIsCreatingBackup(false);
    setBackupProgress(0);

    toast({
      title: 'Backup criado com sucesso!',
      description: 'Seus dados foram salvos com segurança.',
    });
  };

  const downloadBackup = (backup: Backup) => {
    // Simular download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${backup.name}.zip`;
    link.click();

    toast({
      title: 'Download iniciado',
      description: `O backup "${backup.name}" está sendo baixado.`,
    });
  };

  const restoreBackup = (backup: Backup) => {
    toast({
      title: 'Restauração iniciada',
      description: `Restaurando dados do backup "${backup.name}". Isso pode levar alguns minutos.`,
    });
  };

  const toggleAutoBackup = () => {
    setAutoBackupEnabled(!autoBackupEnabled);
    toast({
      title: autoBackupEnabled ? 'Backup automático desativado' : 'Backup automático ativado',
      description: autoBackupEnabled 
        ? 'Você precisará criar backups manualmente.' 
        : 'Backups serão criados automaticamente a cada 24 horas.',
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'in-progress': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Sistema de Backup</h2>
            <p className="text-gray-600">Proteja seus dados com backups automáticos e manuais</p>
          </div>
        </div>
        <Button onClick={createManualBackup} disabled={isCreatingBackup}>
          <HardDrive className="w-4 h-4 mr-2" />
          {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${autoBackupEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Shield className={`w-6 h-6 ${autoBackupEnabled ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Backup Automático</p>
              <p className="text-lg font-semibold">
                {autoBackupEnabled ? 'Ativado' : 'Desativado'}
              </p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={toggleAutoBackup}
                className="p-0 h-auto text-blue-600"
              >
                {autoBackupEnabled ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Último Backup</p>
              <p className="text-lg font-semibold">
                {format(lastAutoBackup, 'dd/MM HH:mm', { locale: ptBR })}
              </p>
              <p className="text-xs text-gray-500">Há 2 horas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Backups</p>
              <p className="text-lg font-semibold">{backups.length}</p>
              <p className="text-xs text-gray-500">~6.2 MB total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress de backup ativo */}
      {isCreatingBackup && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Criando backup...</h3>
              <span className="text-sm text-gray-600">{Math.round(backupProgress)}%</span>
            </div>
            <Progress value={backupProgress} />
            <p className="text-sm text-gray-600">
              Coletando e comprimindo seus dados. Isso pode levar alguns minutos.
            </p>
          </div>
        </Card>
      )}

      {/* Lista de backups */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Backups</h3>
        
        <div className="space-y-4">
          {backups.map(backup => (
            <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(backup.status)}
                  <div>
                    <h4 className="font-medium">{backup.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📁 {backup.size}</span>
                      <span>🕒 {formatDate(backup.createdAt)}</span>
                      <Badge variant={backup.type === 'automatic' ? 'default' : 'secondary'}>
                        {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                      <Badge className={getStatusColor(backup.status)}>
                        {backup.status === 'completed' ? 'Concluído' : 
                         backup.status === 'failed' ? 'Falhou' : 'Em andamento'}
                      </Badge>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {backup.includes.map(item => (
                        <span key={item} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadBackup(backup)}
                  disabled={backup.status !== 'completed'}
                >
                  <Download className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={backup.status !== 'completed'}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restaurar Backup</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja restaurar este backup? Esta ação irá substituir 
                        todos os dados atuais pelos dados do backup selecionado.
                        <br /><br />
                        <strong>Backup:</strong> {backup.name}<br />
                        <strong>Data:</strong> {formatDate(backup.createdAt)}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => restoreBackup(backup)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Restaurar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
