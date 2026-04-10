import { anthropic, MODEL }    from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse }        from 'next/server'
import { cookies }             from 'next/headers'

export async function GET() {
  // Parent auth check
  const cookieStore = await cookies()
  const parentAuth  = cookieStore.get('parent_auth')
  if (!parentAuth?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: sessions   },
    { data: vocabulary },
    { data: missions   },
    { data: stories    },
    { data: profile    },
  ] = await Promise.all([
    supabase.from('rzan_sessions').select('*').gte('created_at', weekAgo),
    supabase.from('rzan_vocabulary').select('*').gte('created_at', weekAgo),
    supabase.from('rzan_missions').select('*').gte('created_at', weekAgo),
    supabase.from('rzan_writing_journal').select('*').gte('created_at', weekAgo),
    supabase.from('rzan_profile').select('*').single(),
  ])

  const completedMissions = missions?.filter((m: any) => m.is_completed) ?? []
  const weakWords         = vocabulary?.filter((v: any) =>
    v.times_seen > 0 && v.times_correct < v.times_seen / 2
  ) ?? []

  const statsText = `
تفاصيل أسبوع رزان:
- الجلسات: ${sessions?.length ?? 0} جلسة
- الكلمات الجديدة المتعلمة: ${vocabulary?.length ?? 0} كلمة
- المهام المكتملة: ${completedMissions.length} من ${missions?.length ?? 0}
- القصص المكتوبة: ${stories?.length ?? 0}
- المستوى الحالي: ${profile?.level ? ['','A1','A1+','A2','A2+','B1','B1+'][profile.level] ?? 'A1' : 'A1'}
- مجموع النقاط: ${profile?.points ?? 0}
- أيام السلسلة المتواصلة: ${profile?.streak_days ?? 0} يوم
- الكلمات الصعبة (خطأ فيها أكثر من صح): ${weakWords.slice(0, 5).map((v: any) => v.word).join('، ') || 'لا يوجد'}
`

  try {
    const res = await anthropic.messages.create({
      model:      MODEL,
      max_tokens: 700,
      system:     'أنت محلل تعليمي متخصص. اكتب تقرير أسبوعي بالعربية لأب يراقب تقدم ابنته رزان (12 سنة) في تعلم الإنجليزية. التقرير واضح وودي ومحدد وإيجابي.',
      messages: [{
        role:    'user',
        content: `حلل هذه البيانات واكتب تقرير شامل منسّق جيداً:\n${statsText}\n
يشمل التقرير هذه الأقسام:
١) ملخص الأسبوع (جملتان)
٢) أبرز الإنجازات (نقاط)
٣) مجالات تحتاج دعم (نقاط محددة)
٤) نصيحة عملية للأب هذا الأسبوع
٥) توقع مستوى الأسبوع القادم

استخدم رموز تعبيرية لتجميل التقرير.`,
      }],
    })

    const analysis = res.content.map((b: any) => b.text || '').join('')

    return NextResponse.json({
      analysis,
      stats: {
        sessions:   sessions?.length   ?? 0,
        words:      vocabulary?.length ?? 0,
        missions:   completedMissions.length,
        stories:    stories?.length    ?? 0,
        streak:     profile?.streak_days ?? 0,
        points:     profile?.points    ?? 0,
        level:      profile?.level     ?? 1,
        weakWords:  weakWords.slice(0, 5),
      },
    })
  } catch (err) {
    console.error('Insights error:', err)
    return NextResponse.json({ error: 'فشل التحليل' }, { status: 500 })
  }
}
