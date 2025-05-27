
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getQuestionsForTopic } from '@/data/questionsData';

interface UseBulkContentProps {
  addTopic: (courseId: string, title: string, content: string, parentTopicId?: string) => Promise<any>;
  addQuestion: (topicId: string, question: string, options: string[], correctAnswer: number, explanation: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<any>;
}

export function useBulkContent({ addTopic, addQuestion }: UseBulkContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addQuestionsForTopic = async (topicId: string) => {
    const questionsData = getQuestionsForTopic(topicId);
    
    for (const questionData of questionsData) {
      await addQuestion(
        topicId,
        questionData.question,
        questionData.options,
        questionData.correctAnswer,
        questionData.explanation,
        questionData.difficulty
      );
    }
  };

  const addBulkContent = async (courseId: string) => {
    try {
      setIsLoading(true);
      
      // Direito Constitucional
      const constitucionalTopic = await addTopic(courseId, 'Direito Constitucional', `
# Direito Constitucional

O Direito Constitucional é o ramo do direito público que estuda a Constituição, suas normas e princípios fundamentais que organizam o Estado e garantem os direitos fundamentais dos cidadãos.

## Conceitos Fundamentais

A Constituição é a lei fundamental de um Estado, que estabelece a organização política, os direitos e garantias fundamentais, e os limites do poder estatal.

### Características da Constituição

- **Supremacia**: A Constituição está no topo da hierarquia normativa
- **Rigidez**: Processo especial para alteração
- **Estabilidade**: Permanência e durabilidade
- **Aplicabilidade**: Normas de eficácia imediata

## Princípios Constitucionais

Os princípios constitucionais são diretrizes fundamentais que orientam todo o ordenamento jurídico:

1. **Dignidade da Pessoa Humana**: Fundamento da República
2. **Legalidade**: Ninguém é obrigado a fazer ou deixar de fazer algo senão em virtude de lei
3. **Igualdade**: Todos são iguais perante a lei
4. **Separação dos Poderes**: Divisão tripartite do poder estatal
      `);

      // Subtópicos de Direito Constitucional
      const direitosFundamentaisTopic = await addTopic(courseId, 'Direitos Fundamentais', `
# Direitos Fundamentais

Os direitos fundamentais são direitos básicos e essenciais garantidos pela Constituição a todos os cidadãos.

## Classificação dos Direitos Fundamentais

### Direitos Individuais e Coletivos (Art. 5º)
- Direito à vida, liberdade, igualdade, segurança e propriedade
- Inviolabilidade do domicílio
- Liberdade de expressão e manifestação do pensamento
- Direito ao devido processo legal

### Direitos Sociais (Art. 6º)
- Educação, saúde, alimentação, trabalho, moradia
- Transporte, lazer, segurança, previdência social
- Proteção à maternidade e à infância
- Assistência aos desamparados

## Remédios Constitucionais

Instrumentos para proteção dos direitos fundamentais:
- **Habeas Corpus**: Protege a liberdade de locomoção
- **Mandado de Segurança**: Protege direito líquido e certo
- **Habeas Data**: Acesso a informações pessoais
- **Mandado de Injunção**: Supre ausência de norma regulamentadora
      `, constitucionalTopic.id);

      const organizacaoEstadoTopic = await addTopic(courseId, 'Organização do Estado', `
# Organização do Estado

A organização do Estado brasileiro segue o modelo federativo, com divisão em União, Estados, Distrito Federal e Municípios.

## Federalismo Brasileiro

### Características
- **Autonomia**: Cada ente federativo possui autonomia política, administrativa e financeira
- **Descentralização**: Distribuição de competências entre os entes
- **Participação**: Representação no Senado Federal

### Competências
- **União**: Competências exclusivas e privativas
- **Estados**: Competências remanescentes
- **Municípios**: Assuntos de interesse local
- **Competências Comuns**: Saúde, educação, meio ambiente

## Tripartição dos Poderes

### Poder Executivo
- Chefia do Estado e do Governo
- Execução das leis
- Administração pública

### Poder Legislativo
- Elaboração das leis
- Fiscalização dos demais poderes
- Representação popular

### Poder Judiciário
- Aplicação da lei aos casos concretos
- Controle de constitucionalidade
- Garantia dos direitos
      `, constitucionalTopic.id);

      // Direito Civil
      const civilTopic = await addTopic(courseId, 'Direito Civil', `
# Direito Civil

O Direito Civil regula as relações entre particulares, estabelecendo direitos e obrigações nas relações privadas.

## Princípios do Direito Civil

### Autonomia da Vontade
Os particulares podem autorregular seus interesses, estabelecendo negócios jurídicos conforme sua vontade, respeitados os limites legais.

### Boa-fé Objetiva
Padrão de conduta que impõe às partes comportamento honesto, leal e cooperativo em todas as fases da relação jurídica.

### Função Social dos Institutos
Os direitos devem ser exercidos em conformidade com sua função social, não apenas para satisfação individual.

## Parte Geral do Código Civil

A Parte Geral trata dos elementos fundamentais de todas as relações jurídicas:
- **Pessoas**: Naturais e jurídicas
- **Bens**: Classificação e regime jurídico
- **Fatos Jurídicos**: Atos, negócios jurídicos e prescrição
      `);

      const pessoasTopic = await addTopic(courseId, 'Das Pessoas', `
# Das Pessoas

As pessoas são os sujeitos de direito, dividindo-se em pessoas naturais (físicas) e pessoas jurídicas.

## Pessoa Natural

### Início da Personalidade
A personalidade civil inicia-se com o nascimento com vida (art. 2º do CC).

### Capacidade Civil
- **Capacidade de Direito**: Aptidão para ser titular de direitos
- **Capacidade de Fato**: Aptidão para exercer pessoalmente os direitos

### Incapacidades
- **Absoluta**: Menores de 16 anos
- **Relativa**: Maiores de 16 e menores de 18 anos, ébrios habituais, etc.

## Pessoa Jurídica

### Conceito
Entidade abstrata com personalidade jurídica própria, distinta dos seus membros.

### Classificação
- **Direito Público**: União, Estados, Municípios, autarquias
- **Direito Privado**: Associações, sociedades, fundações

### Desconsideração da Personalidade Jurídica
Possibilidade de responsabilizar diretamente os sócios quando houver:
- Abuso da personalidade jurídica
- Confusão patrimonial
- Desvio de finalidade
      `, civilTopic.id);

      const bensTopic = await addTopic(courseId, 'Dos Bens', `
# Dos Bens

Os bens são objeto de direito, ou seja, tudo aquilo que pode ser objeto de uma relação jurídica.

## Classificação dos Bens

### Quanto à Corporeidade
- **Corpóreos**: Possuem existência física (casa, carro)
- **Incorpóreos**: Não possuem existência física (direitos autorais, marcas)

### Quanto à Mobilidade
- **Imóveis**: Não podem ser transportados (terrenos, edifícios)
- **Móveis**: Podem ser transportados (veículos, joias)

### Quanto à Fungibilidade
- **Fungíveis**: Podem ser substituídos por outros da mesma espécie
- **Infungíveis**: Únicos, insubstituíveis

### Quanto ao Titular
- **Públicos**: Pertencem ao Estado
- **Particulares**: Pertencem a pessoas privadas

## Bens Públicos

### Classificação
- **Uso Comum do Povo**: Ruas, praças, mares
- **Uso Especial**: Repartições públicas, museus
- **Dominicais**: Patrimônio disponível do Estado

### Características
- **Inalienabilidade**: Não podem ser vendidos (regra geral)
- **Impenhorabilidade**: Não podem ser penhorados
- **Imprescritibilidade**: Não se adquirem por usucapião
      `, civilTopic.id);

      // Direito Penal
      const penalTopic = await addTopic(courseId, 'Direito Penal', `
# Direito Penal

O Direito Penal é o ramo do direito que define os crimes e estabelece as penas correspondentes, protegendo os bens jurídicos mais importantes da sociedade.

## Princípios do Direito Penal

### Legalidade (Nullum crimen, nulla poena sine lege)
Não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal.

### Anterioridade
A lei penal não retroage, salvo para beneficiar o réu.

### Intervenção Mínima
O Direito Penal deve ser a última ratio, intervindo apenas quando outros ramos do direito forem insuficientes.

### Fragmentariedade
O Direito Penal protege apenas os bens jurídicos mais importantes.

### Humanidade
As penas não podem ser cruéis, degradantes ou desumanas.

## Teoria Geral do Crime

Para que haja crime, são necessários três elementos:

### Tipicidade
Adequação da conduta ao tipo penal descrito em lei.

### Antijuridicidade
Contrariedade da conduta ao ordenamento jurídico.

### Culpabilidade
Reprovabilidade da conduta, considerando a capacidade do agente.
      `);

      const crimesEspecieTopic = await addTopic(courseId, 'Crimes em Espécie', `
# Crimes em Espécie

Os crimes estão organizados na Parte Especial do Código Penal, divididos por bem jurídico protegido.

## Crimes Contra a Pessoa

### Homicídio (Art. 121)
- **Simples**: Matar alguém (6 a 20 anos)
- **Qualificado**: Com circunstâncias agravantes (12 a 30 anos)
- **Culposo**: Por imprudência, negligência ou imperícia (1 a 3 anos)

### Lesão Corporal (Art. 129)
- **Leve**: Ofensa à integridade corporal ou saúde
- **Grave**: Resulta em incapacidade, enfermidade incurável, etc.
- **Gravíssima**: Resulta em incapacidade permanente, deformidade, etc.

## Crimes Contra o Patrimônio

### Furto (Art. 155)
Subtrair coisa móvel alheia, para si ou para outrem.

### Roubo (Art. 157)
Subtrair coisa móvel alheia, mediante grave ameaça ou violência.

### Estelionato (Art. 171)
Obter vantagem ilícita em prejuízo alheio, induzindo ou mantendo alguém em erro.

## Crimes Contra a Administração Pública

### Peculato (Art. 312)
Apropriar-se funcionário público de dinheiro, valor ou bem móvel público.

### Corrupção Passiva (Art. 317)
Solicitar ou receber vantagem indevida em razão da função pública.

### Prevaricação (Art. 319)
Retardar ou deixar de praticar ato de ofício por interesse pessoal.
      `, penalTopic.id);

      // Direito Administrativo
      const administrativoTopic = await addTopic(courseId, 'Direito Administrativo', `
# Direito Administrativo

O Direito Administrativo regula a organização e o funcionamento da Administração Pública e suas relações com os particulares.

## Princípios da Administração Pública

### Princípios Expressos (Art. 37, CF/88)

#### Legalidade
A Administração só pode fazer o que a lei permite ou autoriza.

#### Impessoalidade
A Administração deve tratar todos de forma igual, sem favorecimentos ou perseguições.

#### Moralidade
A Administração deve pautar-se pela ética, probidade e boa-fé.

#### Publicidade
Os atos administrativos devem ser públicos, transparentes.

#### Eficiência
A Administração deve buscar o melhor resultado com o menor custo.

### Princípios Implícitos

- **Supremacia do Interesse Público**: Prevalência do interesse coletivo
- **Indisponibilidade do Interesse Público**: Administrador não é dono da coisa pública
- **Autotutela**: Poder de rever seus próprios atos
- **Continuidade**: Serviços públicos não podem parar

## Organização Administrativa

### Administração Direta
Órgãos ligados diretamente ao Poder Executivo:
- Presidência da República
- Ministérios
- Secretarias

### Administração Indireta
Entidades com personalidade jurídica própria:
- **Autarquias**: Pessoas jurídicas de direito público
- **Fundações Públicas**: Patrimônio destinado a finalidade específica
- **Empresas Públicas**: Capital exclusivamente público
- **Sociedades de Economia Mista**: Capital público e privado
      `);

      const atoAdministrativoTopic = await addTopic(courseId, 'Atos Administrativos', `
# Atos Administrativos

Ato administrativo é toda manifestação unilateral de vontade da Administração Pública que produz efeitos jurídicos.

## Elementos do Ato Administrativo

### Sujeito (Competência)
Poder legal conferido ao agente público para praticar o ato.

### Objeto
Aquilo sobre o que o ato dispõe, o conteúdo do ato.

### Forma
Modo pelo qual o ato se exterioriza (escrita, oral, gestos).

### Motivo
Situação de fato e de direito que justifica a prática do ato.

### Finalidade
Resultado que a Administração quer alcançar com o ato.

## Atributos dos Atos Administrativos

### Presunção de Legitimidade
Os atos presumem-se legítimos até prova em contrário.

### Imperatividade
Possibilidade de criar obrigações unilateralmente.

### Autoexecutoriedade
Possibilidade de executar o ato sem intervenção judicial.

### Tipicidade
Correspondência entre o ato e a previsão legal.

## Vícios dos Atos Administrativos

### Quanto à Competência
- Excesso de poder
- Função de fato

### Quanto ao Objeto
- Impossibilidade jurídica ou material
- Indeterminação

### Quanto à Forma
- Vício na forma prescrita em lei

### Quanto ao Motivo
- Inexistência dos fatos
- Inadequação entre motivos e finalidade

### Quanto à Finalidade
- Desvio de poder ou finalidade
      `, administrativoTopic.id);

      // Adicionar questões para cada tópico
      await addQuestionsForTopic(direitosFundamentaisTopic.id);
      await addQuestionsForTopic(organizacaoEstadoTopic.id);
      await addQuestionsForTopic(pessoasTopic.id);
      await addQuestionsForTopic(bensTopic.id);
      await addQuestionsForTopic(crimesEspecieTopic.id);
      await addQuestionsForTopic(atoAdministrativoTopic.id);

      toast({
        title: 'Sucesso',
        description: 'Conteúdo de direito adicionado com sucesso!',
      });

    } catch (error) {
      console.error('Error adding bulk content:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar conteúdo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBulkContent,
    isLoading,
  };
}
