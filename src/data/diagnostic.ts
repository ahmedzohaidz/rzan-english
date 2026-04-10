// Diagnostic test — 4 stages, story-themed questions for Rzan (grade 7, age 12)

export interface MCQQuestion {
  id:       string
  question: string
  options:  string[]
  correct:  string
  stage:    'vocabulary' | 'grammar'
}

export interface ReadingQuestion {
  id:      string
  question: string
  options:  string[]
  correct:  string
}

export interface ReadingStage {
  passage: string
  title:   string
  questions: ReadingQuestion[]
}

// ── Stage 1: Vocabulary ──────────────────────────────────────
export const VOCABULARY_QUESTIONS: MCQQuestion[] = [
  {
    id: 'v1', stage: 'vocabulary',
    question: 'What does "mysterious" mean?',
    options: ['A. Very funny', 'B. Strange and hard to explain', 'C. Very loud', 'D. Easy to understand'],
    correct: 'B. Strange and hard to explain',
  },
  {
    id: 'v2', stage: 'vocabulary',
    question: 'What does "adventure" mean?',
    options: ['A. A boring day', 'B. A sad memory', 'C. An exciting and unusual experience', 'D. A type of food'],
    correct: 'C. An exciting and unusual experience',
  },
  {
    id: 'v3', stage: 'vocabulary',
    question: 'What does "whispered" mean?',
    options: ['A. Shouted very loudly', 'B. Spoke very softly', 'C. Laughed happily', 'D. Ran quickly'],
    correct: 'B. Spoke very softly',
  },
  {
    id: 'v4', stage: 'vocabulary',
    question: 'What does "ancient" mean?',
    options: ['A. Very new', 'B. Very expensive', 'C. Very old', 'D. Very small'],
    correct: 'C. Very old',
  },
  {
    id: 'v5', stage: 'vocabulary',
    question: 'What does "brave" mean?',
    options: ['A. Afraid of everything', 'B. Ready to face danger without fear', 'C. Very tired', 'D. Quiet and shy'],
    correct: 'B. Ready to face danger without fear',
  },
]

// ── Stage 2: Grammar ─────────────────────────────────────────
export const GRAMMAR_QUESTIONS: MCQQuestion[] = [
  {
    id: 'g1', stage: 'grammar',
    question: 'She ___ to school every day.',
    options: ['A. go', 'B. goes', 'C. going', 'D. gone'],
    correct: 'B. goes',
  },
  {
    id: 'g2', stage: 'grammar',
    question: 'I ___ reading a novel right now.',
    options: ['A. am', 'B. is', 'C. are', 'D. be'],
    correct: 'A. am',
  },
  {
    id: 'g3', stage: 'grammar',
    question: 'Yesterday, the hero ___ the dragon.',
    options: ['A. defeat', 'B. defeats', 'C. defeated', 'D. defeating'],
    correct: 'C. defeated',
  },
  {
    id: 'g4', stage: 'grammar',
    question: 'There ___ many books on the shelf.',
    options: ['A. is', 'B. are', 'C. was', 'D. am'],
    correct: 'B. are',
  },
  {
    id: 'g5', stage: 'grammar',
    question: 'The princess ___ never seen the ocean before.',
    options: ['A. have', 'B. has', 'C. had', 'D. having'],
    correct: 'B. has',
  },
]

// ── Stage 3: Reading ─────────────────────────────────────────
export const READING_STAGE: ReadingStage = {
  title:   'The Lost Library',
  passage: `Deep in the forest, there was an ancient library that no one had visited for a hundred years.
One afternoon, a girl named Layla discovered its hidden door behind a waterfall.
Inside, thousands of glowing books floated in the air.
Each book whispered the name of the person it belonged to.
Layla walked slowly between the shelves, her heart beating fast.
Suddenly, one golden book flew directly into her hands.
On the cover, in shining letters, was her name.`,
  questions: [
    {
      id: 'r1',
      question: 'Where was the ancient library?',
      options: ['A. In a city', 'B. Deep in the forest', 'C. Under the sea', 'D. On a mountain'],
      correct: 'B. Deep in the forest',
    },
    {
      id: 'r2',
      question: 'How did Layla find the library?',
      options: ['A. Someone told her about it', 'B. She read a map', 'C. She found a hidden door behind a waterfall', 'D. She followed a bird'],
      correct: 'C. She found a hidden door behind a waterfall',
    },
    {
      id: 'r3',
      question: 'What was written on the golden book?',
      options: ['A. The name of the library', 'B. Layla\'s name', 'C. A magic spell', 'D. A warning'],
      correct: 'B. Layla\'s name',
    },
  ],
}

// ── Stage 4: Writing prompt ──────────────────────────────────
export const WRITING_PROMPT =
  'Imagine you found a magical book with YOUR name on the cover. ' +
  'Write 2–3 sentences about what happens when you open it. ' +
  'Use your imagination! 🌟'
