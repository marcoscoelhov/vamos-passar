
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, Search, Play, BookOpen, Users, FileText, Settings, ChevronRight, MessageCircle, Video, Lightbulb } from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'content' | 'users' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  steps: string[];
}

const helpTopics: HelpTopic[] = [
  {
    id: 'first-course',
    title: 'Criando seu primeiro curso',
    description: 'Aprenda a criar e estruturar seu primeiro curso do zero',
    category: 'getting-started',
    difficulty: 'beginner',
    videoUrl: '/videos/first-course.mp4',
    steps: [
      'Acesse a seção "Gerenciar Cursos"',
      'Clique em "Novo Curso"',
      'Preencha as informações básicas',
      'Adicione tópicos e conteúdo',
      'Configure as questões',
      'Publique o curso'
    ]
  },
  {
    id: 'add-content',
    title: 'Adicionando conteúdo e questões',
    description: 'Como adicionar texto, imagens e questões aos seus tópicos',
    category: 'content',
    difficulty: 'beginner',
    steps: [
      'Selecione um tópico existente',
      'Use o editor de texto para adicionar conteúdo',
      'Clique em "Inserir Questão" para adicionar questões',
      'Configure as opções e resposta correta',
      'Salve suas alterações'
    ]
  },
  {
    id: 'import-documents',
    title: 'Importando documentos',
    description: 'Como importar PDFs e documentos Word para criar conteúdo rapidamente',
    category: 'content',
    difficulty: 'intermediate',
    steps: [
      'Vá para "Conteúdo" > "Importar"',
      'Selecione seus arquivos PDF ou Word',
      'Aguarde o processamento automático',
      'Revise o conteúdo gerado',
      'Edite se necessário',
      'Publique os tópicos'
    ]
  },
  {
    id: 'manage-users',
    title: 'Gerenciando usuários',
    description: 'Como adicionar professores e alunos, e gerenciar permissões',
    category: 'users',
    difficulty: 'beginner',
    steps: [
      'Acesse "Gestão de Usuários"',
      'Clique em "Adicionar Usuário"',
      'Escolha o tipo (Professor ou Aluno)',
      'Preencha email e nome',
      'Configure as permissões se necessário',
      'Envie o convite'
    ]
  },
  {
    id: 'analytics',
    title: 'Entendendo os relatórios',
    description: 'Como interpretar e usar os dados de analytics para melhorar seu curso',
    category: 'advanced',
    difficulty: 'intermediate',
    steps: [
      'Acesse a seção "Analytics"',
      'Analise as métricas de engajamento',
      'Verifique a performance dos alunos',
      'Identifique conteúdo problemático',
      'Implemente melhorias baseadas nos dados'
    ]
  }
];

export function IntegratedHelpSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'Todos', icon: BookOpen },
    { id: 'getting-started', label: 'Primeiros Passos', icon: Play },
    { id: 'content', label: 'Conteúdo', icon: FileText },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'advanced', label: 'Avançado', icon: Settings },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Botão de ajuda flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700">
              <HelpCircle className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Central de Ajuda
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="topics" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="topics">Tutoriais</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                  <TabsTrigger value="support">Suporte</TabsTrigger>
                </TabsList>

                <TabsContent value="topics" className="flex-1 overflow-hidden">
                  <div className="space-y-4 h-full">
                    {/* Busca e filtros */}
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar tutoriais..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Categorias */}
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(category => {
                        const Icon = category.icon;
                        return (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className="flex items-center gap-2"
                          >
                            <Icon className="w-4 h-4" />
                            {category.label}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Lista de tópicos */}
                    <div className="grid gap-4 overflow-y-auto max-h-96">
                      {filteredTopics.map(topic => (
                        <Card key={topic.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{topic.title}</h3>
                                <Badge className={getDifficultyColor(topic.difficulty)}>
                                  {topic.difficulty === 'beginner' ? 'Iniciante' : 
                                   topic.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                                </Badge>
                                {topic.videoUrl && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    Vídeo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                              
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">Passos:</p>
                                {topic.steps.slice(0, 3).map((step, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                                      {index + 1}
                                    </span>
                                    {step}
                                  </div>
                                ))}
                                {topic.steps.length > 3 && (
                                  <p className="text-xs text-gray-500">
                                    +{topic.steps.length - 3} passos adicionais...
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Como resetar a senha de um aluno?</h3>
                      <p className="text-sm text-gray-600">
                        Vá em Gestão de Usuários, encontre o aluno, clique nos três pontos e selecione "Resetar senha".
                      </p>
                    </Card>

                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Posso importar questões de um arquivo Excel?</h3>
                      <p className="text-sm text-gray-600">
                        Atualmente suportamos importação de PDFs e documentos Word. Para Excel, você pode copiar e colar o conteúdo.
                      </p>
                    </Card>

                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Como dar permissões específicas para um professor?</h3>
                      <p className="text-sm text-gray-600">
                        Na seção Gestão de Usuários, aba "Permissões de Professores", você pode configurar permissões específicas.
                      </p>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="support" className="space-y-4">
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Precisa de ajuda personalizada?</h3>
                    <p className="text-gray-600 mb-4">
                      Entre em contato conosco para suporte direto
                    </p>
                    
                    <div className="space-y-3">
                      <Button className="w-full" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat ao Vivo
                      </Button>
                      
                      <Button className="w-full" variant="outline">
                        📧 Email: suporte@exemplo.com
                      </Button>
                      
                      <Button className="w-full" variant="outline">
                        📱 WhatsApp: (11) 99999-9999
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Widget de dicas contextuais */}
      <div className="fixed bottom-24 right-6 z-40">
        <Card className="p-3 max-w-sm bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Dica Rápida</span>
          </div>
          <p className="text-xs text-blue-700">
            Use Ctrl+K para busca rápida em qualquer lugar do sistema!
          </p>
        </Card>
      </div>
    </>
  );
}
