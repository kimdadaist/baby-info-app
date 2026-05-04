import { openai, MODEL } from '@/lib/openai'

export type GeneratedArticle = {
  title: string
  summary: string
  content: string
  tags: string[]
}

type ExistingArticle = {
  title: string
  summary: string
  tags: string[]
}

export async function generateArticle(
  category: string,
  weekRange: string | null,
  topic: string,
  existingArticles: ExistingArticle[] = [],
  hint?: string
): Promise<GeneratedArticle> {
  const avoidSection = existingArticles.length > 0
    ? `\n이미 다룬 글 (아래 내용·관점과 겹치지 않도록 새로운 측면을 다뤄주세요):
${existingArticles.map((a, i) =>
  `${i + 1}. 제목: ${a.title}\n   요약: ${a.summary}\n   키워드: ${a.tags.join(', ')}`
).join('\n')}\n`
    : ''

  const hintSection = hint ? `\n작성 방향 힌트: ${hint}\n` : ''

  const prompt = `당신은 신뢰할 수 있는 육아 정보를 제공하는 전문가입니다.
아래 조건에 맞는 육아 정보 글을 작성해주세요.

카테고리: ${category}${weekRange ? ` (${weekRange})` : ''}
주제: ${topic}
${avoidSection}${hintSection}
요구사항:
- 제목: 명확하고 검색하기 쉬운 제목 (50자 이내)
- 요약: 2~3줄 핵심 요약
- 본문: 마크다운 형식, 800~1200자, 실용적인 정보 위주
- 태그: 검색에 유용한 키워드 5~8개

주의사항:
- 반드시 순수 한국어(한글)로만 작성
- 한자(漢字), 중국어, 일본어 혼용 절대 금지
- 영어는 의학 용어에 한해 괄호 안에만 허용 (예: 태동(fetal movement))

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "...",
  "summary": "...",
  "content": "...",
  "tags": ["...", "..."]
}`

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: existingArticles.length > 0 ? 0.9 : 0.7,
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return result as GeneratedArticle
}
