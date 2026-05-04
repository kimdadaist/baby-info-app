import { openai, MODEL } from '@/lib/openai'

export type GeneratedArticle = {
  title: string
  summary: string
  content: string
  tags: string[]
}

export async function generateArticle(
  category: string,
  weekRange: string | null,
  topic: string
): Promise<GeneratedArticle> {
  const prompt = `당신은 신뢰할 수 있는 육아 정보를 제공하는 전문가입니다.
아래 조건에 맞는 육아 정보 글을 작성해주세요.

카테고리: ${category}${weekRange ? ` (${weekRange})` : ''}
주제: ${topic}

요구사항:
- 제목: 명확하고 검색하기 쉬운 제목 (50자 이내)
- 요약: 2~3줄 핵심 요약
- 본문: 마크다운 형식, 800~1200자, 실용적인 정보 위주
- 태그: 검색에 유용한 키워드 5~8개

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
    temperature: 0.7,
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return result as GeneratedArticle
}
