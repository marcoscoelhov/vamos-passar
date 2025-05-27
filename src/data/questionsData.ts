
export function getQuestionsForTopic(topicId: string) {
  // Banco de questões que será distribuído conforme o tópico
  const allQuestions = [
    // Direitos Fundamentais
    {
      question: "Segundo a Constituição Federal de 1988, qual é o prazo para impetração do habeas corpus?",
      options: [
        "30 dias",
        "60 dias",
        "120 dias",
        "Não há prazo específico"
      ],
      correctAnswer: 3,
      explanation: "O habeas corpus pode ser impetrado a qualquer momento, não havendo prazo específico estabelecido na Constituição Federal.",
      difficulty: "medium" as const
    },
    {
      question: "O mandado de segurança tem por finalidade proteger:",
      options: [
        "Apenas direitos individuais",
        "Direito líquido e certo não amparado por habeas corpus ou habeas data",
        "Qualquer direito fundamental",
        "Apenas direitos coletivos"
      ],
      correctAnswer: 1,
      explanation: "O mandado de segurança protege direito líquido e certo quando não amparado por habeas corpus ou habeas data, conforme art. 5º, LXIX da CF/88.",
      difficulty: "hard" as const
    },
    {
      question: "São direitos sociais, segundo o art. 6º da Constituição Federal:",
      options: [
        "Vida, liberdade e propriedade",
        "Educação, saúde, alimentação, trabalho e moradia",
        "Voto, elegibilidade e associação",
        "Livre manifestação e locomoção"
      ],
      correctAnswer: 1,
      explanation: "O art. 6º da CF/88 estabelece como direitos sociais a educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade e à infância, assistência aos desamparados.",
      difficulty: "easy" as const
    },
    // Organização do Estado
    {
      question: "São características do federalismo brasileiro:",
      options: [
        "Centralização política e administrativa",
        "Autonomia dos entes federativos e repartição de competências",
        "Subordinação dos Estados à União",
        "Uniformidade de legislação em todo território nacional"
      ],
      correctAnswer: 1,
      explanation: "O federalismo brasileiro caracteriza-se pela autonomia política, administrativa e financeira dos entes federativos, com repartição constitucional de competências.",
      difficulty: "medium" as const
    },
    {
      question: "Compete privativamente à União legislar sobre:",
      options: [
        "Direito tributário municipal",
        "Trânsito e transporte intermunicipal",
        "Direito civil, comercial, penal e processual",
        "Ensino fundamental"
      ],
      correctAnswer: 2,
      explanation: "Conforme art. 22 da CF/88, compete privativamente à União legislar sobre direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho.",
      difficulty: "hard" as const
    },
    // Das Pessoas
    {
      question: "A personalidade civil da pessoa natural inicia-se:",
      options: [
        "Com a concepção",
        "Com o nascimento com vida",
        "Com o registro de nascimento",
        "Aos 18 anos de idade"
      ],
      correctAnswer: 1,
      explanation: "Segundo o art. 2º do Código Civil, a personalidade civil da pessoa natural começa do nascimento com vida.",
      difficulty: "easy" as const
    },
    {
      question: "São absolutamente incapazes:",
      options: [
        "Maiores de 16 e menores de 18 anos",
        "Apenas os menores de 16 anos",
        "Os pródigos",
        "Os ébrios habituais"
      ],
      correctAnswer: 1,
      explanation: "Após a alteração do Estatuto da Pessoa com Deficiência (Lei 13.146/2015), são absolutamente incapazes apenas os menores de 16 anos.",
      difficulty: "medium" as const
    },
    // Dos Bens
    {
      question: "São bens imóveis por natureza:",
      options: [
        "Veículos automotores",
        "Direitos reais sobre imóveis",
        "Solo e tudo quanto se lhe incorporar naturalmente",
        "Navios e aeronaves"
      ],
      correctAnswer: 2,
      explanation: "Conforme art. 79 do CC, são bens imóveis o solo e tudo quanto se lhe incorporar natural ou artificialmente.",
      difficulty: "easy" as const
    },
    {
      question: "Os bens públicos de uso comum do povo:",
      options: [
        "Podem ser objeto de usucapião",
        "São inalienáveis enquanto conservarem a qualificação",
        "Pertencem ao patrimônio disponível",
        "Podem ser penhorados"
      ],
      correctAnswer: 1,
      explanation: "Os bens públicos são inalienáveis, impenhoráveis e imprescritíveis enquanto conservarem sua qualificação.",
      difficulty: "medium" as const
    },
    // Crimes em Espécie
    {
      question: "No crime de furto, o agente:",
      options: [
        "Subtrai coisa móvel alheia mediante violência",
        "Subtrai coisa móvel alheia sem violência ou grave ameaça",
        "Apropria-se de coisa achada",
        "Destrói coisa alheia"
      ],
      correctAnswer: 1,
      explanation: "O furto (art. 155 do CP) consiste em subtrair coisa móvel alheia, para si ou para outrem, sem emprego de violência ou grave ameaça.",
      difficulty: "easy" as const
    },
    {
      question: "A diferença entre furto e roubo está:",
      options: [
        "No valor da coisa subtraída",
        "No emprego de violência ou grave ameaça no roubo",
        "Na natureza do bem subtraído",
        "No local onde ocorre o crime"
      ],
      correctAnswer: 1,
      explanation: "O roubo diferencia-se do furto pelo emprego de violência ou grave ameaça à pessoa para a subtração da coisa móvel alheia.",
      difficulty: "medium" as const
    },
    // Atos Administrativos
    {
      question: "São atributos dos atos administrativos:",
      options: [
        "Legalidade, moralidade e eficiência",
        "Presunção de legitimidade, imperatividade e autoexecutoriedade",
        "Competência, objeto e forma",
        "Supremacia e indisponibilidade"
      ],
      correctAnswer: 1,
      explanation: "Os atributos dos atos administrativos são: presunção de legitimidade, imperatividade, autoexecutoriedade e tipicidade.",
      difficulty: "hard" as const
    },
    {
      question: "O vício de desvio de poder ou finalidade ocorre quando:",
      options: [
        "O agente não tem competência para praticar o ato",
        "O ato não observa a forma prescrita em lei",
        "O agente pratica o ato visando finalidade diversa da prevista em lei",
        "O objeto do ato é impossível"
      ],
      correctAnswer: 2,
      explanation: "O desvio de poder ou finalidade ocorre quando o agente pratica o ato administrativo com finalidade diversa daquela prevista em lei.",
      difficulty: "hard" as const
    }
  ];

  // Retorna um subconjunto das questões (3-4 por tópico)
  return allQuestions.slice(0, 4);
}
