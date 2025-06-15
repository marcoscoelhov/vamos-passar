
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { BookOpen, Plus, Upload, FileText, HelpCircle, Users, BarChart, Lightbulb } from 'lucide-react';
import { Course } from '@/types/course';
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor';
import { DocumentImporter } from './DocumentImporter';
import { useTopics } from '@/hooks/useTopics';
import { useQuestions } from '@/hooks/useQuestions';
import { Question } from '@/types/course';

interface SimplifiedContentManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

export function SimplifiedContentManagement({ course, isAdmin, onContentAdded }: SimplifiedContentManagementProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'import' | 'organize'>('create');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { addTopic } = useTopics();
  const { addQuestion } = useQuestions();

  const handleCreateTopic = async () => {
    if (!topicTitle.trim() || !topicContent.trim()) return;
    
    setIsCreating(true);
    try {
      await addTopic(course.id, { title: topicTitle, content: topicContent }, isAdmin);
      setTopicTitle('');
      setTopicContent('');
      onContentAdded();
    } catch (error) {
      console.error('Error creating topic:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuestionInsert = async (question: Omit<Question, 'id'>, position: number) => {
    // For now, we'll add the question marker to the content
    const questionMarker = `\n\n[QUESTÃO: ${question.question}]\n\n`;
    const newContent = topicContent.slice(0, position) + questionMarker + topicContent.slice(position);
    setTopicContent(newContent);
  };

  const tabs = [
    { id: 'create', label: 'Criar Conteúdo', icon: Plus, description: 'Crie novos tópicos e adicione questões' },
    { id: 'import', label: 'Importar Arquivo', icon: Upload, description: 'Importe documentos PDF, Word ou texto' },
    { id: 'organize', label: 'Organizar', icon: BookOpen, description: 'Reorganize e gerencie o conteúdo existente' }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header Simplificado */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Conteúdo</h2>
              <p className="text-gray-600">Crie, importe e organize o material do seu curso de forma simples</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Tópicos</p>
                  <p className="text-2xl font-bold text-gray-900">{course.topics.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Questões</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Criar Novo Tópico</h3>
              </div>
              <p className="text-sm text-gray-600">
                Crie um novo tópico com conteúdo e questões integradas
              </p>
            </div>

            <div className="space-y-6">
              {/* Título do Tópico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Tópico *
                </label>
                <Input
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Ex: Introdução à Programação"
                  className="text-lg"
                />
              </div>

              {/* Editor de Conteúdo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Tópico *
                </label>
                <EnhancedRichTextEditor
                  value={topicContent}
                  onChange={setTopicContent}
                  placeholder="Digite o conteúdo do tópico aqui. Use o botão 'Inserir Questão' para adicionar questões em qualquer parte do texto..."
                  onQuestionInsert={handleQuestionInsert}
                />
              </div>

              {/* Dicas */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-2">Dicas para criar conteúdo eficaz:</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Use títulos e subtítulos para organizar o conteúdo</li>
                      <li>• Adicione questões ao longo do texto para manter o engajamento</li>
                      <li>• Use listas e formatação para facilitar a leitura</li>
                      <li>• Inclua exemplos práticos sempre que possível</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTopicTitle('');
                    setTopicContent('');
                  }}
                  disabled={isCreating}
                >
                  Limpar
                </Button>
                <Button
                  onClick={handleCreateTopic}
                  disabled={!topicTitle.trim() || !topicContent.trim() || isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? 'Criando...' : 'Criar Tópico'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'import' && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Importar Arquivo</h3>
              </div>
              <p className="text-sm text-gray-600">
                Importe documentos PDF, Word ou texto e converta automaticamente em tópicos
              </p>
            </div>

            <DocumentImporter 
              onContentExtracted={(content, suggestions) => {
                // Handle imported content
                console.log('Content imported:', content, suggestions);
                onContentAdded();
              }}
            />
          </Card>
        )}

        {activeTab === 'organize' && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Organizar Conteúdo</h3>
              </div>
              <p className="text-sm text-gray-600">
                Reorganize a estrutura dos tópicos e gerencie a hierarquia do curso
              </p>
            </div>

            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Funcionalidade de organização será implementada aqui</p>
              <p className="text-sm">Arraste e solte tópicos para reorganizar</p>
            </div>
          </Card>
        )}
      </div>

      <ScrollToTop />
    </>
  );
}
