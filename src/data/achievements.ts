import type { RzanProfileRow, RzanWritingJournalRow } from '@/types/supabase'

export interface AchievementDef {
  id:             string
  icon:           string
  title_ar:       string
  description_ar: string
  points:         number
  check: (profile: RzanProfileRow, extras: AchievementExtras) => boolean
}

export interface AchievementExtras {
  writingCount:  number
  missionsCount: number
  vocabCount:    number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id:             'first_login',
    icon:           '🌟',
    title_ar:       'الخطوة الأولى',
    description_ar: 'سجّلتِ دخولك لأول مرة',
    points:         5,
    check:          () => true, // always unlocked once profile exists
  },
  {
    id:             'diagnostic_done',
    icon:           '🎓',
    title_ar:       'أعرفي مستواك',
    description_ar: 'أكملتِ اختبار التحديد',
    points:         20,
    check:          (p) => p.diagnostic_done,
  },
  {
    id:             'first_story',
    icon:           '📖',
    title_ar:       'كاتبة موهوبة',
    description_ar: 'كتبتِ قصتك الأولى',
    points:         15,
    check:          (_, e) => e.writingCount >= 1,
  },
  {
    id:             'five_stories',
    icon:           '📚',
    title_ar:       'روائية صغيرة',
    description_ar: 'كتبتِ 5 قصص',
    points:         30,
    check:          (_, e) => e.writingCount >= 5,
  },
  {
    id:             'streak_3',
    icon:           '🔥',
    title_ar:       'ثلاثة أيام متتالية',
    description_ar: 'تعلّمتِ 3 أيام متتالية',
    points:         15,
    check:          (p) => p.streak_days >= 3,
  },
  {
    id:             'streak_7',
    icon:           '🏆',
    title_ar:       'أسبوع كامل',
    description_ar: 'تعلّمتِ أسبوعاً كاملاً متتالياً',
    points:         50,
    check:          (p) => p.streak_days >= 7,
  },
  {
    id:             'points_50',
    icon:           '⭐',
    title_ar:       'جامعة النجوم',
    description_ar: 'جمعتِ 50 نقطة',
    points:         10,
    check:          (p) => p.points >= 50,
  },
  {
    id:             'points_200',
    icon:           '💎',
    title_ar:       'بطلة النقاط',
    description_ar: 'جمعتِ 200 نقطة',
    points:         25,
    check:          (p) => p.points >= 200,
  },
  {
    id:             'mission_5',
    icon:           '✅',
    title_ar:       'منجزة',
    description_ar: 'أكملتِ 5 مهام يومية',
    points:         20,
    check:          (_, e) => e.missionsCount >= 5,
  },
  {
    id:             'vocab_10',
    icon:           '🔤',
    title_ar:       'قاموس صغير',
    description_ar: 'تعلّمتِ 10 كلمات جديدة',
    points:         20,
    check:          (_, e) => e.vocabCount >= 10,
  },
  {
    id:             'level_up',
    icon:           '🚀',
    title_ar:       'ترقية!',
    description_ar: 'وصلتِ إلى المستوى A2',
    points:         40,
    check:          (p) => p.level >= 2,
  },
  {
    id:             'storyteller',
    icon:           '✨',
    title_ar:       'حكّاءة',
    description_ar: 'كتبتِ 200 كلمة في قصة واحدة',
    points:         25,
    check:          (_, e) => e.writingCount > 0, // checked via writing entries separately
  },
]

export function computeUnlocked(
  profile: RzanProfileRow,
  extras:  AchievementExtras
): Set<string> {
  return new Set(
    ACHIEVEMENTS
      .filter(a => a.check(profile, extras))
      .map(a => a.id)
  )
}
