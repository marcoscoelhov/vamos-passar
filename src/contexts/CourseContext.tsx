
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course, Topic, Question, User } from '@/types/course';

interface CourseContextType {
  courses: Course[];
  currentCourse: Course | null;
  currentTopic: Topic | null;
  user: User | null;
  setCurrentCourse: (course: Course) => void;
  setCurrentTopic: (topic: Topic) => void;
  updateTopicProgress: (topicId: string, completed: boolean) => void;
  addQuestion: (topicId: string, question: Question) => void;
  addTopic: (courseId: string, topic: Omit<Topic, 'id'>) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Dados mockados para demonstração
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Direito Constitucional',
    description: 'Curso completo de Direito Constitucional para concursos',
    progress: 0,
    topics: [
      {
        id: '1',
        title: 'Introdução ao Direito Constitucional',
        content: `# Introdução ao Direito Constitucional

O Direito Constitucional é o ramo do direito público que estuda e regula a organização e o funcionamento do Estado, bem como os direitos e garantias fundamentais dos cidadãos.

## Conceito e Objeto

O Direito Constitucional tem como objeto principal o estudo da **Constituição**, que é a lei fundamental de um Estado. A Constituição estabelece:

- A estrutura do Estado
- A organização dos poderes
- Os direitos e deveres fundamentais
- As regras básicas de funcionamento da sociedade

## Características da Constituição

### 1. Supremacia Constitucional
A Constituição é a norma suprema do ordenamento jurídico. Todas as demais normas devem estar em conformidade com ela.

### 2. Rigidez Constitucional
A Constituição brasileira é rígida, ou seja, seu processo de alteração é mais complexo que o das leis ordinárias.

### 3. Aplicabilidade Imediata
As normas constitucionais têm aplicabilidade imediata, conforme estabelece o art. 5º, § 1º da CF/88.

## Princípios Fundamentais

A Constituição Federal de 1988 estabelece os seguintes princípios fundamentais:

1. **Soberania**
2. **Cidadania**
3. **Dignidade da pessoa humana**
4. **Valores sociais do trabalho e da livre iniciativa**
5. **Pluralismo político**

> "A dignidade da pessoa humana é o princípio fundamental que orienta toda a interpretação constitucional."

Estes princípios são os alicerces sobre os quais se constrói todo o ordenamento jurídico brasileiro.`,
        completed: false,
        order: 1,
        questions: [
          {
            id: '1',
            question: 'Qual é o objeto principal do Direito Constitucional?',
            options: [
              'O estudo das leis ordinárias',
              'O estudo da Constituição',
              'O estudo do direito civil',
              'O estudo do direito penal'
            ],
            correctAnswer: 1,
            explanation: 'O Direito Constitucional tem como objeto principal o estudo da Constituição, que é a lei fundamental do Estado.',
            type: 'multiple-choice',
            difficulty: 'easy'
          }
        ]
      },
      {
        id: '2',
        title: 'Direitos e Garantias Fundamentais',
        content: `# Direitos e Garantias Fundamentais

Os direitos e garantias fundamentais constituem o núcleo básico de proteção da dignidade humana no ordenamento constitucional brasileiro.

## Classificação dos Direitos Fundamentais

### 1. Direitos Individuais e Coletivos (Art. 5º)
Os direitos individuais são aqueles que protegem a pessoa humana em sua individualidade. Exemplos:
- Direito à vida
- Direito à liberdade
- Direito à igualdade
- Direito à segurança
- Direito à propriedade

### 2. Direitos Sociais (Art. 6º)
São direitos que visam assegurar condições mínimas de vida digna. Incluem:
- Educação
- Saúde
- Alimentação
- Trabalho
- Moradia
- Transporte
- Lazer
- Segurança
- Previdência social
- Proteção à maternidade e à infância
- Assistência aos desamparados

### 3. Direitos de Nacionalidade (Art. 12)
Regulam a aquisição e perda da nacionalidade brasileira.

### 4. Direitos Políticos (Art. 14 a 16)
Garantem a participação do cidadão na vida política do Estado.

## Características dos Direitos Fundamentais

### Universalidade
Os direitos fundamentais são universais, ou seja, pertencem a todos os seres humanos.

### Indivisibilidade
Os direitos fundamentais formam um conjunto indivisível e interdependente.

### Inalienabilidade
Não podem ser transferidos, vendidos ou renunciados.

### Imprescritibilidade
Não se perdem pelo decurso do tempo.

## Garantias Constitucionais

As garantias são instrumentos processuais que protegem os direitos fundamentais:

- **Habeas Corpus** - proteção da liberdade de locomoção
- **Mandado de Segurança** - proteção de direito líquido e certo
- **Habeas Data** - acesso e retificação de informações pessoais
- **Mandado de Injunção** - suprimento de omissão legislativa
- **Ação Popular** - proteção do patrimônio público`,
        completed: false,
        order: 2,
        questions: [
          {
            id: '2',
            question: 'Os direitos sociais estão previstos em qual artigo da Constituição Federal?',
            options: [
              'Artigo 5º',
              'Artigo 6º',
              'Artigo 12',
              'Artigo 14'
            ],
            correctAnswer: 1,
            explanation: 'Os direitos sociais estão previstos no artigo 6º da Constituição Federal de 1988.',
            type: 'multiple-choice',
            difficulty: 'medium'
          },
          {
            id: '3',
            question: 'Qual garantia constitucional protege a liberdade de locomoção?',
            options: [
              'Mandado de Segurança',
              'Habeas Corpus',
              'Habeas Data',
              'Ação Popular'
            ],
            correctAnswer: 1,
            explanation: 'O Habeas Corpus é a garantia constitucional que protege a liberdade de locomoção.',
            type: 'multiple-choice',
            difficulty: 'easy'
          }
        ]
      },
      {
        id: '3',
        title: 'Organização do Estado',
        content: `# Organização do Estado

A organização do Estado brasileiro segue os princípios federativos e da separação dos poderes.

## Forma e Sistema de Governo

### Forma de Governo: República
- Eletividade dos governantes
- Temporariedade dos mandatos
- Responsabilidade dos governantes

### Sistema de Governo: Presidencialismo
- Concentração das funções de Chefe de Estado e Chefe de Governo
- Eleição direta do Presidente
- Mandato fixo

## Forma de Estado: Federação

O Brasil adota a forma federativa de Estado, caracterizada por:

### Autonomia dos Entes Federativos
- **União**: competências nacionais e internacionais
- **Estados**: competências regionais
- **Municípios**: competências locais
- **Distrito Federal**: competências estaduais e municipais

### Repartição de Competências

#### Competências da União (Art. 21 e 22)
- Competências administrativas exclusivas
- Competências legislativas privativas

#### Competências dos Estados (Art. 25)
- Competências remanescentes
- Competências delegadas pela União

#### Competências dos Municípios (Art. 30)
- Interesse local
- Serviços públicos locais

### Características do Federalismo Brasileiro

1. **Federalismo Cooperativo**
   - Competências comuns (Art. 23)
   - Competências concorrentes (Art. 24)

2. **Indissolubilidade**
   - Vedação ao direito de secessão
   - Cláusula pétrea

3. **Descentralização Política**
   - Autonomia política, administrativa e financeira

## Intervenção Federal

Exceção ao princípio federativo, permite que a União interfira nos Estados em situações específicas previstas no art. 34 da CF.`,
        completed: false,
        order: 3
      }
    ]
  }
];

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses] = useState<Course[]>(mockCourses);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(mockCourses[0]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(mockCourses[0]?.topics[0] || null);
  const [user, setUser] = useState<User | null>(null);

  const updateTopicProgress = (topicId: string, completed: boolean) => {
    if (!currentCourse) return;
    
    const updatedTopics = currentCourse.topics.map(topic => 
      topic.id === topicId ? { ...topic, completed } : topic
    );
    
    const completedCount = updatedTopics.filter(topic => topic.completed).length;
    const progress = (completedCount / updatedTopics.length) * 100;
    
    const updatedCourse = {
      ...currentCourse,
      topics: updatedTopics,
      progress
    };
    
    setCurrentCourse(updatedCourse);
  };

  const addQuestion = (topicId: string, question: Question) => {
    if (!currentCourse) return;
    
    const updatedTopics = currentCourse.topics.map(topic => 
      topic.id === topicId 
        ? { ...topic, questions: [...(topic.questions || []), question] }
        : topic
    );
    
    setCurrentCourse({
      ...currentCourse,
      topics: updatedTopics
    });
  };

  const addTopic = (courseId: string, topic: Omit<Topic, 'id'>) => {
    if (!currentCourse || currentCourse.id !== courseId) return;
    
    const newTopic: Topic = {
      ...topic,
      id: Date.now().toString()
    };
    
    const updatedTopics = [...currentCourse.topics, newTopic];
    
    setCurrentCourse({
      ...currentCourse,
      topics: updatedTopics
    });
  };

  const login = (email: string, password: string): boolean => {
    if (email === 'admin' && password === 'admin') {
      setUser({
        id: '1',
        name: 'Administrador',
        email: 'admin@curso.com',
        isAdmin: true
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <CourseContext.Provider value={{
      courses,
      currentCourse,
      currentTopic,
      user,
      setCurrentCourse,
      setCurrentTopic,
      updateTopicProgress,
      addQuestion,
      addTopic,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
