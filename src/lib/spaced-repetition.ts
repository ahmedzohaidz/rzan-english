/**
 * Simplified SM-2 spaced repetition for Rzan's vocabulary.
 * difficulty: 1 (easy) → 5 (hard for student)
 */
export function calculateNextReview(
  correctCount: number,
  difficulty: number,
  wasCorrect: boolean,
): Date {
  const next = new Date()

  if (!wasCorrect) {
    // Wrong → review again tomorrow
    next.setDate(next.getDate() + 1)
    return next
  }

  // Easiness factor: harder words reviewed more often
  const easiness = Math.max(1.3, 2.5 - (difficulty - 3) * 0.15)

  let interval: number
  if      (correctCount === 0) interval = 1
  else if (correctCount === 1) interval = 3
  else                         interval = Math.round(3 * Math.pow(easiness, correctCount - 1))

  // Cap at 30 days
  next.setDate(next.getDate() + Math.min(interval, 30))
  return next
}

export function isDueForReview(nextReview: string | null | undefined): boolean {
  if (!nextReview) return true
  return new Date(nextReview) <= new Date()
}

export type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered'

export function getMasteryLevel(correctCount: number, reviewCount: number): MasteryLevel {
  if (reviewCount === 0)  return 'new'
  const accuracy = correctCount / reviewCount
  if (correctCount >= 5 && accuracy >= 0.8) return 'mastered'
  if (correctCount >= 2)  return 'review'
  return 'learning'
}

export function masteryLabel(level: MasteryLevel): string {
  return { new:'جديدة', learning:'قيد التعلم', review:'للمراجعة', mastered:'محفوظة ✓' }[level]
}

export function masteryColor(level: MasteryLevel): string {
  return { new:'#9B72CF', learning:'#E8A020', review:'#E8789A', mastered:'#4FD8A0' }[level]
}
