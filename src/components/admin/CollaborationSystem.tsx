
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, Clock, Edit, Eye, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface CollaborationActivity {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'professor' | 'editor';
  };
  action: 'edit' | 'view' | 'comment' | 'approve' | 'reject';
  target: {
    type: 'topic' | 'course' | 'question';
    id: string;
    title: string;
  };
  timestamp: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface Comment {
  id: string;
  user: {
    name: string;
    email: string;
  };
  content: string;
  timestamp: string;
  replies: Comment[];
}

export function CollaborationSystem() {
  const [activeUsers, setActiveUsers] = useState([
    { id: '1', name: 'Prof. João', email: 'joao@escola.com', status: 'online', currentPage: 'Tópico: React Hooks' },
    { id: '2', name: 'Prof. Maria', email: 'maria@escola.com', status: 'editing', currentPage: 'Criando questões' },
  ]);

  const [recentActivity, setRecentActivity] = useState<CollaborationActivity[]>([
    {
      id: '1',
      user: { id: '1', name: 'Prof. João', email: 'joao@escola.com', role: 'professor' },
      action: 'edit',
      target: { type: 'topic', id: '1', title: 'Introdução ao React' },
      timestamp: new Date(Date.now() - 300000).toISOString(),
      description: 'Editou o conteúdo do tópico',
      status: 'completed'
    },
    {
      id: '2',
      user: { id: '2', name: 'Prof. Maria', email: 'maria@escola.com', role: 'professor' },
      action: 'comment',
      target: { type: 'topic', id: '2', title: 'Estado no React' },
      timestamp: new Date(Date.now() - 600000).toISOString(),
      description: 'Adicionou um comentário sobre melhorias',
      status: 'pending'
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: { name: 'Prof. Maria', email: 'maria@escola.com' },
      content: 'Este tópico precisa de mais exemplos práticos. Seria bom adicionar um exercício hands-on.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      replies: [
        {
          id: '1-1',
          user: { name: 'Prof. João', email: 'joao@escola.com' },
          content: 'Concordo! Vou adicionar alguns exemplos interativos ainda hoje.',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          replies: []
        }
      ]
    }
  ]);

  const [newComment, setNewComment] = useState('');

  const getStatusIcon = (action: string) => {
    switch (action) {
      case 'edit': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-600" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'approve': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes}m atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return `${Math.floor(diffMinutes / 1440)}d atrás`;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: { name: 'Você', email: 'admin@escola.com' },
      content: newComment,
      timestamp: new Date().toISOString(),
      replies: []
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Colaboração</h2>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-300">
          {activeUsers.length} usuários online
        </Badge>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
          <TabsTrigger value="users">Usuários Online</TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Atividades Recentes</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {activity.description} em "{activity.target.title}"
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      <Badge
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Usuários Ativos</h3>
            <div className="space-y-3">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {user.status === 'online' ? 'Navegando' : 'Editando'}: {user.currentPage}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.status === 'online' ? 'Online' : 'Editando'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Comentários e Discussões</h3>
            
            {/* Formulário para novo comentário */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="Adicione um comentário ou sugestão..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleAddComment}
                    size="sm"
                    disabled={!newComment.trim()}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Comentar
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                        {comment.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      
                      {/* Respostas */}
                      {comment.replies.length > 0 && (
                        <div className="ml-4 mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {reply.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">{reply.user.name}</span>
                                  <span className="text-xs text-gray-400">
                                    {formatTimestamp(reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm" className="mt-2 text-xs h-6">
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
