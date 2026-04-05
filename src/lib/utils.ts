import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long', year: 'numeric',
    month: 'long',  day: 'numeric',
  }).format(new Date(date))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'صباح الخير'
  if (hour < 17) return 'مساء الخير'
  return 'مساء النور'
}

export function levelToArabic(level: string): string {
  const map: Record<string, string> = {
    A1: 'مبتدئ', A2: 'أساسي', B1: 'ما قبل المتوسط'
  }
  return map[level] || level
}

export function calculateSpacedRepetitionDate(
  timesCorrect: number,
  timesSeen: number
): Date {
  const ratio   = timesCorrect / Math.max(timesSeen, 1)
  const daysMap = [1, 2, 4, 7, 14, 30]
  const idx     = Math.min(Math.floor(ratio * daysMap.length), daysMap.length - 1)
  const date    = new Date()
  date.setDate(date.getDate() + daysMap[idx])
  return date
}
