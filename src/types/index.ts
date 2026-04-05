export type Level        = 'A1' | 'A2' | 'B1'
export type SessionType  = 'diagnostic' | 'chat' | 'writing' | 'vocabulary' | 'mission'
export type Difficulty   = 'easy' | 'medium' | 'hard'
export type StoryStatus  = 'draft' | 'reviewed' | 'published'
export type MissionType  = 'vocabulary' | 'grammar' | 'reading' | 'writing'

export interface RzanProfile {
  id:              string
  name:            string
  level:           Level
  total_points:    number
  current_streak:  number
  longest_streak:  number
  created_at:      string
  last_active:     string
}

export interface RzanSession {
  id:               string
  session_type:     SessionType
  duration_minutes: number
  score?:           number
  notes?:           string
  created_at:       string
}

export interface VocabularyWord {
  id:              string
  word:            string
  meaning_ar:      string
  example_sentence:string
  times_seen:      number
  times_correct:   number
  next_review_at:  string
  difficulty:      Difficulty
  created_at:      string
}

export interface WritingEntry {
  id:               string
  title_ar:         string
  content_ar:       string
  content_en_draft?: string
  content_en_final?: string
  ai_feedback?:     string
  word_count:       number
  status:           StoryStatus
  parent_comment?:  string
  created_at:       string
}

export interface DailyMission {
  id:              string
  date:            string
  mission_type:    MissionType
  description_ar:  string
  target_count:    number
  completed_count: number
  is_completed:    boolean
  points_earned:   number
  created_at:      string
}

export interface DiagnosticAnswer {
  stage:     string
  question:  string
  chosen?:   string
  correct?:  string
  isRight?:  boolean
  textAnswer?: string
}

export interface DiagnosticResult {
  level:           Level
  levelName:       string
  levelNameAr:     string
  overallScore:    number
  strengths:       string[]
  weaknesses:      string[]
  summaryAr:       string
  encouragementAr: string
}

export interface Achievement {
  id:             string
  title_ar:       string
  description_ar: string
  icon:           string
  points:         number
  unlocked_at?:   string
  is_unlocked:    boolean
}
