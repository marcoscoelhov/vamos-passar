
# API Documentation

## Hooks API

### useOptimizedHighlights

Hook otimizado para gerenciamento de destaques de texto.

#### Parâmetros
```typescript
interface OptimizedHighlightsOptions {
  topicId?: string;           // ID do tópico
  userId?: string;            // ID do usuário
  enableRealTimeUpdates?: boolean; // Ativar updates em tempo real
}
```

#### Retorno
```typescript
{
  highlights: Highlight[];              // Lista de destaques
  isLoading: boolean;                   // Estado de carregamento geral
  isAdding: boolean;                    // Estado de adição
  isUpdating: boolean;                  // Estado de atualização
  isDeleting: boolean;                  // Estado de exclusão
  addHighlight: (params) => Promise<Highlight>;
  updateHighlight: (id, note) => Promise<Highlight>;
  deleteHighlight: (id) => Promise<void>;
  fetchHighlights: (forceRefresh?) => Promise<Highlight[]>;
  invalidateCache: () => void;
}
```

#### Exemplo de Uso
```typescript
const {
  highlights,
  addHighlight,
  isLoading
} = useOptimizedHighlights({
  topicId: 'topic-123',
  userId: 'user-456',
  enableRealTimeUpdates: true
});

// Adicionar destaque
await addHighlight(
  'Texto destacado',
  0,
  15,
  'contexto antes',
  'contexto depois',
  'minha nota'
);
```

### useOptimizedCourseData

Hook para gerenciamento otimizado de dados de cursos.

#### Retorno
```typescript
{
  courses: Course[];
  topics: DbTopic[];
  questions: DbQuestion[];
  loadingStates: {
    courses: boolean;
    topics: boolean;
    questions: boolean;
    batchQuestions: boolean;
  };
  fetchCourses: (forceRefresh?) => Promise<Course[]>;
  fetchTopics: (courseId, forceRefresh?) => Promise<DbTopic[]>;
  fetchQuestions: (topicId, forceRefresh?) => Promise<DbQuestion[]>;
  batchFetchQuestions: (topicIds, options?) => Promise<DbQuestion[][]>;
  prefetchTopicQuestions: (topicId) => Promise<void>;
  invalidateCache: (type, id?) => void;
}
```

#### Exemplo de Uso
```typescript
const {
  courses,
  topics,
  fetchCourses,
  fetchTopics,
  loadingStates
} = useOptimizedCourseData();

// Carregar cursos
await fetchCourses();

// Carregar tópicos de um curso
await fetchTopics('course-123');

// Verificar estados de loading
if (loadingStates.courses) {
  return <LoadingSpinner />;
}
```

### useMemoryOptimizedProgress

Hook para gerenciamento otimizado de progresso do usuário.

#### Parâmetros
```typescript
userId?: string; // ID do usuário
```

#### Retorno
```typescript
{
  progress: UserProgress[];
  attempts: QuestionAttempt[];
  stats: ProgressStats;
  isLoading: boolean;
  isUpdating: boolean;
  isSavingAttempt: boolean;
  fetchProgress: (courseId?, forceRefresh?) => Promise<UserProgress[]>;
  markTopicCompleted: (topicId, completed?) => Promise<UserProgress>;
  saveQuestionAttempt: (questionId, answer, isCorrect) => Promise<QuestionAttempt>;
  getTopicProgress: (topicId) => UserProgress | undefined;
  isTopicCompleted: (topicId) => boolean;
  getQuestionAttempts: (questionId) => QuestionAttempt[];
  getLastAttempt: (questionId) => QuestionAttempt | null;
}
```

#### Exemplo de Uso
```typescript
const {
  progress,
  stats,
  markTopicCompleted,
  isTopicCompleted
} = useMemoryOptimizedProgress('user-123');

// Marcar tópico como concluído
await markTopicCompleted('topic-456', true);

// Verificar se tópico foi concluído
const completed = isTopicCompleted('topic-456');

// Acessar estatísticas
console.log(`Progresso: ${stats.progressPercentage}%`);
```

### useCacheManager

Hook genérico para gerenciamento de cache.

#### Retorno
```typescript
{
  getCacheEntry: (key: string) => T | null;
  setCacheEntry: (key: string, data: T) => void;
  invalidateCache: (key?: string) => void;
}
```

#### Configuração
- **TTL**: 5 minutos por padrão
- **Armazenamento**: Em memória (Map)
- **Limpeza**: Automática na expiração

#### Exemplo de Uso
```typescript
const cache = useCacheManager<User[]>();

// Armazenar dados
cache.setCacheEntry('users', usersData);

// Recuperar dados
const cachedUsers = cache.getCacheEntry('users');

// Invalidar cache específico
cache.invalidateCache('users');

// Limpar todo o cache
cache.invalidateCache();
```

### useOptimizedLoadingStates

Hook para gerenciamento granular de estados de loading.

#### Retorno
```typescript
{
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: boolean;
  loadingKeys: string[];
  resetAll: () => void;
  withLoading: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T>;
  batchSetLoading: (updates: Record<string, boolean>) => void;
}
```

#### Exemplo de Uso
```typescript
const {
  setLoading,
  isLoading,
  withLoading,
  isAnyLoading
} = useOptimizedLoadingStates();

// Controle manual
setLoading('fetchUsers', true);
// ... operação assíncrona
setLoading('fetchUsers', false);

// Controle automático
const users = await withLoading('fetchUsers', async () => {
  return await api.getUsers();
});

// Verificar estados
if (isLoading('fetchUsers')) {
  return <Spinner />;
}

// Verificar se há qualquer loading ativo
if (isAnyLoading) {
  // Mostrar indicador global
}
```

## Tipos TypeScript

### Highlight
```typescript
interface Highlight {
  id: string;
  userId: string;
  topicId: string;
  highlightedText: string;
  contextBefore?: string;
  contextAfter?: string;
  positionStart: number;
  positionEnd: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ProgressStats
```typescript
interface ProgressStats {
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  streakDays: number;
  lastActivity: string | null;
}
```

### BatchFetchOptions
```typescript
interface BatchFetchOptions {
  batchSize?: number;    // Padrão: 5
  parallel?: boolean;    // Padrão: true
}
```

## Utilitários

### logger
```typescript
logger.debug(message: string, data?: any): void;
logger.info(message: string, data?: any): void;
logger.warn(message: string, data?: any): void;
logger.error(message: string, data?: any): void;
```

### Cache Constants
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
```

## Error Handling

Todos os hooks implementam tratamento robusto de erros:

1. **Try/Catch**: Envolvem operações async
2. **Toast Notifications**: Feedback visual para o usuário
3. **Logging**: Registro detalhado de erros
4. **Fallbacks**: Estados de erro graceful
5. **Retry Logic**: Possibilidade de tentar novamente

### Exemplo de Error Handling
```typescript
try {
  await addHighlight(text, start, end);
  toast({
    title: 'Sucesso',
    description: 'Destaque adicionado com sucesso.',
  });
} catch (error) {
  logger.error('Erro ao adicionar destaque', error);
  toast({
    title: 'Erro',
    description: 'Não foi possível adicionar o destaque.',
    variant: 'destructive',
  });
}
```
