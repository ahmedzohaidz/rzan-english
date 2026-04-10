// Re-export Supabase-generated row types
export type {
  Database,
  RzanProfileRow,
  RzanSessionRow,
  RzanVocabularyRow,
  RzanWritingJournalRow,
  RzanMissionRow,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './supabase'

// ── App-level types ──────────────────────────────────────────

export type Difficulty  = 'easy' | 'medium' | 'hard'
export type MissionType = 'vocabulary' | 'reading' | 'writing' | 'chat'
export type Genre       = 'story' | 'poem' | 'dialogue' | 'description' | 'other'

// English level derived from diagnostic score (stored as integer level 1–6)
export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export function levelToString(level: number): EnglishLevel {
  const map: Record<number, EnglishLevel> = { 1:'A1', 2:'A2', 3:'B1', 4:'B2', 5:'C1', 6:'C2' }
  return map[level] ?? 'A1'
}

// Diagnostic
export interface DiagnosticAnswer {
  stage:       string
  question:    string
  chosen?:     string
  correct?:    string
  isRight?:    boolean
  textAnswer?: string
}

export interface DiagnosticResult {
  level:           EnglishLevel
  levelName:       string
  levelNameAr:     string
  overallScore:    number
  strengths:       string[]
  weaknesses:      string[]
  summaryAr:       string
  encouragementAr: string
}

// Achievements (client-side only — not in DB yet)
export interface Achievement {
  id:             string
  title_ar:       string
  description_ar: string
  icon:           string
  points:         number
  unlocked_at?:   string
  is_unlocked:    boolean
}

// Chat
export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}
