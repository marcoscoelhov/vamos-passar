import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, BookOpen, Target, Users, Plus, Minus } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';

export function AdminPanel() {
  const { currentCourse, addQuestion, addTopic } = useCourse();

  // Estados para criar novo tópico
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // Estados para criar nova questão
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const handleAddTopic = async () => {
    if (!currentCourse || !newTopicTitle || !newTopicContent) {
      return;
    }

    setIsAddingTopic(true);
    try {
      await addTopic(currentCourse.id, {
        title: newTopicTitle,
        content: newTopicContent,
      });
      
      setNewTopicTitle('');
      setNewTopicContent('');
    } catch (error) {
      console.error('Error adding topic:', error);
    } finally {
      setIsAddingTopic(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedTopicId || !questionText || options.some(opt => !opt.trim()) || !explanation) {
      return;
    }

    setIsAddingQuestion(true);
    try {
      await addQuestion(selectedTopicId, {
        question: questionText,
        options: options.filter(opt => opt.trim()),
        correctAnswer: correctAnswer,
        explanation: explanation,
        difficulty: difficulty,
        type: 'multiple-choice' as const,
      });
      
      // Reset form
      setSelectedTopicId('');
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setExplanation('');
      setDifficulty('medium');
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Ajustar resposta correta se necessário
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Nenhum curso selecionado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie conteúdo e questões do curso</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="topics">Tópicos</TabsTrigger>
            <TabsTrigger value="questions">Questões</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Tópicos</p>
                    <p className="text-2xl font-bold text-gray-900">{currentCourse.topics.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Questões</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentCourse.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(currentCourse.progress)}%</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
            </div>

            <Card className="mt-6 p-6">
              <h3 className="text-lg font-semibold mb-4">Curso Atual: {currentCourse.title}</h3>
              <p className="text-gray-600 mb-4">{currentCourse.description}</p>
              
              <div className="space-y-2">
                {currentCourse.topics.map((topic, index) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{index + 1}. {topic.title}</span>
                      {topic.questions && topic.questions.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {topic.questions.length} questão(ões)
                        </Badge>
                      )}
                    </div>
                    <Badge variant={topic.completed ? "default" : "secondary"}>
                      {topic.completed ? 'Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <PlusCircle className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Adicionar Novo Tópico</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic-title">Título do Tópico</Label>
                  <Input
                    id="topic-title"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Digite o título do tópico"
                    disabled={isAddingTopic}
                  />
                </div>

                <div>
                  <Label htmlFor="topic-content">Conteúdo (Markdown suportado)</Label>
                  <Textarea
                    id="topic-content"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    placeholder="Digite o conteúdo do tópico usando markdown..."
                    rows={10}
                    disabled={isAddingTopic}
                  />
                </div>

                <Button 
                  onClick={handleAddTopic} 
                  className="w-full"
                  disabled={isAddingTopic || !newTopicTitle || !newTopicContent}
                >
                  {isAddingTopic ? 'Adicionando...' : 'Adicionar Tópico'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Adicionar Nova Questão</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic-select">Tópico</Label>
                  <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={isAddingQuestion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tópico" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCourse.topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="question-text">Enunciado da Questão</Label>
                  <Textarea
                    id="question-text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Digite o enunciado da questão..."
                    rows={3}
                    disabled={isAddingQuestion}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Alternativas</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        disabled={options.length >= 6 || isAddingQuestion}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                          disabled={isAddingQuestion}
                        />
                        <Button
                          type="button"
                          variant={index === correctAnswer ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCorrectAnswer(index)}
                          disabled={isAddingQuestion}
                        >
                          ✓
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          disabled={options.length <= 2 || isAddingQuestion}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select 
                    value={difficulty} 
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}
                    disabled={isAddingQuestion}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="explanation">Explicação</Label>
                  <Textarea
                    id="explanation"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Digite a explicação da questão..."
                    rows={3}
                    disabled={isAddingQuestion}
                  />
                </div>

                <Button 
                  onClick={handleAddQuestion} 
                  className="w-full"
                  disabled={
                    isAddingQuestion ||
                    !selectedTopicId ||
                    !questionText ||
                    options.some(opt => !opt.trim()) ||
                    !explanation
                  }
                >
                  {isAddingQuestion ? 'Adicionando...' : 'Adicionar Questão'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestão de Alunos</h3>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento. Aqui você poderá gerenciar alunos, 
                ver relatórios de progresso e estatísticas de uso.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
