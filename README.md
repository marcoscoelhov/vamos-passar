
# Learning Management System

Uma plataforma moderna de aprendizagem desenvolvida com React, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest, Testing Library
- **Build**: Vite

## 📋 Funcionalidades

### 🎯 Core Features
- ✅ **Autenticação**: Login/logout com Supabase Auth
- ✅ **Cursos e Tópicos**: Navegação hierárquica de conteúdo
- ✅ **Sistema de Destaques**: Marcação de texto com notas
- ✅ **Progresso do Usuário**: Acompanhamento de conclusão
- ✅ **Questões e Avaliações**: Sistema de perguntas e respostas
- ✅ **Downloads em PDF**: Exportação de conteúdo
- ✅ **Favoritos**: Sistema de bookmarks
- ✅ **Busca Global**: Pesquisa em todo o conteúdo

### 🛡️ Otimizações Implementadas
- ✅ **Cache Inteligente**: Cache com TTL de 5 minutos
- ✅ **Deduplicação**: Evita requisições duplicadas
- ✅ **Loading States**: Estados de carregamento granulares
- ✅ **Error Boundaries**: Tratamento robusto de erros
- ✅ **Real-time Updates**: Atualizações em tempo real
- ✅ **Lazy Loading**: Carregamento sob demanda
- ✅ **Memoização**: Otimização de re-renders

### 👨‍💼 Painel Administrativo
- ✅ **Gestão de Cursos**: CRUD completo
- ✅ **Gestão de Tópicos**: Hierarquia e ordenação
- ✅ **Gestão de Questões**: Editor rico
- ✅ **Analytics**: Dashboard de métricas
- ✅ **Logs de Auditoria**: Rastreamento de ações
- ✅ **Importação**: Upload de documentos

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── admin/           # Componentes do admin
│   ├── course-content/  # Componentes do curso
│   └── sidebar/         # Componentes da sidebar
├── hooks/               # Custom hooks
├── contexts/            # React contexts
├── pages/               # Páginas da aplicação
├── types/               # Definições TypeScript
├── utils/               # Utilitários
├── integrations/        # Integrações (Supabase)
└── data/               # Dados estáticos
```

### Hooks Principais

#### `useOptimizedHighlights`
Gerencia destaques com cache e otimizações:
- Cache com TTL de 5 minutos
- Updates otimistas
- Real-time via Supabase
- Deduplicação de requests

#### `useOptimizedCourseData`
Gerencia dados de cursos com performance:
- Batch fetching
- Request deduplication
- Granular loading states
- Cache management

#### `useMemoryOptimizedProgress`
Acompanha progresso com eficiência:
- Memoized lookups
- Optimistic updates
- Stats calculation
- Memory optimization

### Componentes Principais

#### `HighlightableContent`
Componente para marcar texto:
- Seleção de texto intuitiva
- Sistema de notas
- Real-time sync
- Error handling

#### `CourseContent`
Container principal do curso:
- Lazy loading
- Error boundaries
- Keyboard shortcuts
- Download functionality

## 🧪 Testes

### Executar Testes
```bash
# Executar todos os testes
npm run test

# Executar com coverage
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

### Coverage Atual
- **Hooks**: useOptimizedHighlights, useCacheManager
- **Components**: HighlightableContent, OptimizedEmptyState
- **Utils**: logger

### Estrutura de Testes
```
src/
├── hooks/__tests__/
├── components/__tests__/
├── utils/__tests__/
├── types/testing.ts     # Tipos e mocks para testes
└── test-setup.ts        # Configuração global
```

## 🎨 UI/UX

### Design System
- **Cores**: Baseado em Tailwind CSS
- **Tipografia**: Inter font family
- **Espaçamento**: Sistema consistente 4px base
- **Componentes**: Shadcn/ui + customizações

### Responsividade
- **Mobile**: ≥ 320px
- **Tablet**: ≥ 768px
- **Desktop**: ≥ 1024px
- **Large**: ≥ 1280px

### Acessibilidade
- ARIA labels e roles
- Navegação por teclado
- Contraste adequado
- Screen reader friendly

## 📦 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Setup
```bash
# Clone o repositório
git clone <repo-url>

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy Recomendado
- **Frontend**: Vercel, Netlify
- **Backend**: Supabase (já configurado)

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas possuem políticas RLS:
- `user_highlights`: Acesso apenas aos próprios destaques
- `user_progress`: Progresso individual protegido
- `user_question_attempts`: Tentativas privadas

### Validação
- Input sanitization
- SQL injection protection (via Supabase)
- XSS prevention

## 📈 Performance

### Métricas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Otimizações
- Code splitting automático (Vite)
- Lazy loading de componentes
- Image optimization
- Cache inteligente

## 🤝 Contribuição

### Padrões de Código
- ESLint + Prettier configurados
- Conventional Commits
- TypeScript strict mode
- Testes obrigatórios para novos features

### Workflow
1. Fork do repositório
2. Crie uma branch feature
3. Implemente com testes
4. Abra um Pull Request

## 📝 Licença

MIT License - veja LICENSE.md para detalhes.

## 🆘 Suporte

- **Documentação**: [docs/](./docs/)
- **Issues**: GitHub Issues
- **Discord**: Link do servidor
- **Email**: support@example.com

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024
