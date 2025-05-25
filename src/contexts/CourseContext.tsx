
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course, Topic, Question, User } from '@/types/course';

interface CourseContextType {
  currentCourse: Course | null;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  updateTopicProgress: (topicId: string, completed: boolean) => void;
  addQuestion: (topicId: string, question: Question) => void;
  addTopic: (courseId: string, topic: Omit<Topic, 'id'>) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

interface CourseProviderProps {
  children: ReactNode;
}

// Mock admin user
const mockAdmin: User = {
  id: '1',
  name: 'Administrador',
  email: 'admin@vamospassar.com',
  isAdmin: true,
};

// Dados de exemplo mais ricos
const mockCourse: Course = {
  id: '1',
  title: 'Direito Constitucional',
  description: 'Curso completo de Direito Constitucional para concursos públicos',
  progress: 45,
  topics: [
    {
      id: '1',
      title: 'Princípios Fundamentais',
      order: 1,
      completed: true,
      content: `
## Introdução aos Princípios Fundamentais

Os princípios fundamentais representam a **base estrutural** do Estado brasileiro, estabelecendo os valores e diretrizes que orientam toda a organização política e social do país.

### Fundamentos da República

A República Federativa do Brasil constitui-se em Estado Democrático de Direito e tem como fundamentos:

**Soberania** - O poder supremo do Estado, que não reconhece, na ordem interna, poder que lhe seja superior, e, na ordem internacional, coloca-se em posição de igualdade com os poderes supremos dos outros Estados.

**Cidadania** - Qualidade de quem participa da vida política do Estado, exercendo direitos políticos e civis. É o vínculo jurídico-político que liga o indivíduo ao Estado.

**Dignidade da pessoa humana** - Princípio máximo do Estado Democrático de Direito, fonte de todos os demais direitos fundamentais.

> A dignidade da pessoa humana é um valor supremo que atrai o conteúdo de todos os direitos fundamentais do homem.

### Objetivos Fundamentais

São objetivos fundamentais da República Federativa do Brasil:

- Construir uma sociedade livre, justa e solidária
- Garantir o desenvolvimento nacional
- Erradicar a pobreza e a marginalização
- Promover o bem de todos, sem preconceitos

### Princípios das Relações Internacionais

O Brasil rege-se nas suas relações internacionais pelos seguintes princípios:

- Independência nacional
- Prevalência dos direitos humanos
- Autodeterminação dos povos
- Não-intervenção
- Igualdade entre os Estados
- Defesa da paz
- Solução pacífica dos conflitos
- Cooperação entre os povos para o progresso da humanidade
      `,
      questions: [
        {
          id: '1',
          question: 'São fundamentos da República Federativa do Brasil, EXCETO:',
          options: [
            'Soberania',
            'Cidadania', 
            'Dignidade da pessoa humana',
            'Separação dos poderes'
          ],
          correctAnswer: 3,
          explanation: 'A separação dos poderes não é um fundamento da República, mas sim um princípio organizativo do Estado previsto no art. 2º da CF/88.',
          type: 'multiple-choice',
          difficulty: 'medium'
        },
        {
          id: '2',
          question: 'Qual dos princípios abaixo NÃO está entre os que regem o Brasil nas relações internacionais?',
          options: [
            'Independência nacional',
            'Prevalência dos direitos humanos',
            'Soberania popular',
            'Autodeterminação dos povos',
            'Não-intervenção',
            'Defesa da paz'
          ],
          correctAnswer: 2,
          explanation: 'A soberania popular é um princípio do regime democrático, mas não está listada entre os princípios das relações internacionais do art. 4º da CF/88.',
          type: 'multiple-choice',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: '2',
      title: 'Direitos e Garantias Fundamentais',
      order: 2,
      completed: false,
      content: `
## Direitos e Garantias Fundamentais

Os direitos fundamentais constituem o núcleo básico do sistema constitucional, representando as posições jurídicas que reconhecem ao indivíduo possibilidades de ação e abstenções do Estado.

### Características dos Direitos Fundamentais

**Universalidade** - São direitos de todos os seres humanos, sem distinção de qualquer natureza.

**Inalienabilidade** - Não podem ser transferidos, seja a título gratuito ou oneroso.

**Imprescritibilidade** - Não se perdem pelo decurso do tempo.

**Irrenunciabilidade** - Não se pode renunciar aos direitos fundamentais.

### Classificação dos Direitos Fundamentais

#### Direitos de Primeira Geração
Direitos civis e políticos, que traduzem o valor liberdade:
- Direito à vida
- Direito à liberdade
- Direito à propriedade
- Direitos políticos

#### Direitos de Segunda Geração  
Direitos sociais, econômicos e culturais, que traduzem o valor igualdade:
- Direito à saúde
- Direito à educação
- Direito ao trabalho
- Direito à previdência social

#### Direitos de Terceira Geração
Direitos de solidariedade ou fraternidade:
- Direito ao meio ambiente
- Direito ao desenvolvimento
- Direito à paz
- Direito ao patrimônio comum da humanidade

> Os direitos fundamentais são cláusulas pétreas, não podendo ser abolidos nem mesmo por emenda constitucional.

### Aplicabilidade dos Direitos Fundamentais

As normas definidoras dos direitos e garantias fundamentais têm **aplicação imediata**, conforme estabelece o § 1º do art. 5º da Constituição Federal.

### Garantias Fundamentais

As garantias são instrumentos que asseguram o exercício dos direitos fundamentais:

- **Habeas Corpus** - Protege a liberdade de locomoção
- **Habeas Data** - Protege o direito à informação pessoal
- **Mandado de Segurança** - Protege direito líquido e certo
- **Mandado de Injunção** - Supre omissão legislativa
- **Ação Popular** - Protege o patrimônio público
      `,
      questions: [
        {
          id: '3',
          question: 'Quanto às características dos direitos fundamentais, é correto afirmar que:',
          options: [
            'São prescritíveis, podendo ser perdidos pelo decurso do tempo',
            'São renunciáveis, podendo o titular abrir mão de seu exercício',
            'Têm aplicação imediata, conforme previsto na Constituição Federal'
          ],
          correctAnswer: 2,
          explanation: 'Os direitos fundamentais têm aplicação imediata, conforme dispõe expressamente o § 1º do art. 5º da CF/88.',
          type: 'multiple-choice',
          difficulty: 'easy'
        }
      ]
    },
    {
      id: '3',
      title: 'Organização do Estado',
      order: 3,
      completed: false,
      content: `
## Organização do Estado Brasileiro

A organização do Estado brasileiro baseia-se na **forma federativa**, na **forma republicana de governo** e no **regime democrático**.

### Forma de Estado: Federação

O Brasil adota a forma federativa de Estado, caracterizada pela descentralização político-administrativa.

**Características da Federação Brasileira:**

- União indissolúvel de Estados, Municípios e Distrito Federal
- Autonomia dos entes federativos
- Repartição de competências
- Supremacia da Constituição Federal

### Forma de Governo: República

A República caracteriza-se pela **eletividade** e **temporariedade** dos mandatos dos governantes.

### Regime de Governo: Democrático

O regime democrático brasileiro combina:
- **Democracia direta** - Plebiscito, referendo e iniciativa popular
- **Democracia representativa** - Eleições para escolha de representantes

### Divisão Político-Administrativa

O território nacional divide-se em:

**União** - Pessoa jurídica de direito público interno, entidade federativa autônoma em relação aos Estados e Municípios.

**Estados** - Entidades federativas autônomas, dotadas de capacidade de auto-organização, autogoverno e autoadministração.

**Municípios** - Entidades federativas de âmbito local, com autonomia política, administrativa e financeira.

**Distrito Federal** - Entidade federativa especial, que acumula competências estaduais e municipais.

### Competências na Federação

#### Competência da União
- Exclusiva (art. 21)
- Privativa (art. 22)

#### Competência dos Estados
- Competência residual (§ 1º do art. 25)
- Competência expressa

#### Competência dos Municípios  
- Interesse local (art. 30)

#### Competência do Distrito Federal
- Competências estaduais e municipais (art. 32, § 1º)

> A repartição de competências é um dos elementos essenciais do federalismo brasileiro.
      `,
      questions: [
        {
          id: '4',
          question: 'Sobre a organização do Estado brasileiro, analise as afirmativas:',
          options: [
            'O Brasil adota a forma unitária de Estado',
            'A forma de governo é a monarquia constitucional',
            'O regime de governo é democrático',
            'Todas as anteriores estão corretas',
            'Apenas a alternativa C está correta'
          ],
          correctAnswer: 4,
          explanation: 'Apenas a alternativa C está correta. O Brasil adota forma federativa (não unitária), forma republicana de governo (não monarquia) e regime democrático.',
          type: 'multiple-choice',
          difficulty: 'medium'
        }
      ]
    }
  ]
};

export function CourseProvider({ children }: CourseProviderProps) {
  const [currentCourse, setCurrentCourse] = useState<Course>(mockCourse);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(mockCourse.topics[0]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string, password: string): boolean => {
    // Simple mock authentication
    if (email === 'admin' && password === 'admin') {
      setUser(mockAdmin);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateTopicProgress = (topicId: string, completed: boolean) => {
    if (currentCourse) {
      setCurrentCourse(prevCourse => {
        const updatedCourse = { ...prevCourse };
        const topic = updatedCourse.topics.find(t => t.id === topicId);
        if (topic) {
          topic.completed = completed;
          
          // Recalcular progresso
          const completedTopics = updatedCourse.topics.filter(t => t.completed).length;
          updatedCourse.progress = (completedTopics / updatedCourse.topics.length) * 100;
        }
        return updatedCourse;
      });
    }
  };

  const addQuestion = (topicId: string, question: Question) => {
    if (currentCourse) {
      setCurrentCourse(prevCourse => {
        const updatedCourse = { ...prevCourse };
        const topic = updatedCourse.topics.find(t => t.id === topicId);
        if (topic) {
          if (!topic.questions) {
            topic.questions = [];
          }
          topic.questions.push(question);
        }
        return updatedCourse;
      });
    }
  };

  const addTopic = (courseId: string, topicData: Omit<Topic, 'id'>) => {
    if (currentCourse && currentCourse.id === courseId) {
      const newTopic: Topic = {
        ...topicData,
        id: Date.now().toString(),
      };
      
      setCurrentCourse(prevCourse => {
        const updatedCourse = { ...prevCourse };
        updatedCourse.topics.push(newTopic);
        return updatedCourse;
      });
    }
  };

  return (
    <CourseContext.Provider value={{
      currentCourse,
      currentTopic,
      setCurrentTopic,
      updateTopicProgress,
      addQuestion,
      addTopic,
      user,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </CourseContext.Provider>
  );
}
