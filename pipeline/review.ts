import { openai, MODEL } from '@/lib/openai'
import type { GeneratedArticle } from './generate'

export type ReviewResult = {
  accuracy: number       // 정확성 (0~20)
  completeness: number   // 완성도 (0~20)
  practicality: number   // 실용성 (0~20)
  safety: number         // 안전성 (0~20, 높을수록 안전)
  readability: number    // 가독성 (0~20)
  total: number          // 합계 (0~100)
  notes: string          // 검수 의견
}

export async function reviewArticle(
  article: GeneratedArticle,
  category: string,
  topic: string
): Promise<ReviewResult> {
  const prompt = `당신은 소아과 전문의 겸 육아 콘텐츠 검수 전문가입니다.
아래 육아 정보 글을 5가지 기준으로 각 20점 만점으로 평가해주세요.

카테고리: ${category} / 주제: ${topic}
제목: ${article.title}
내용: ${article.content}

평가 기준:
- accuracy(정확성): 의학적/과학적으로 신뢰할 수 있는가
- completeness(완성도): 내용이 충분하고 구체적인가
- practicality(실용성): 실제 육아에 바로 적용 가능한가
- safety(안전성): 잘못된 정보로 위험을 줄 수 있는가 (위험하면 낮게, 안전하면 높게)
- readability(가독성): 이해하기 쉽고 구조화되어 있는가

반드시 아래 JSON 형식으로만 응답하세요:
{
  "accuracy": 0~20,
  "completeness": 0~20,
  "practicality": 0~20,
  "safety": 0~20,
  "readability": 0~20,
  "notes": "검수 의견 (한 문장)"
}`

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(response.choices[0].message.content!)
  result.total = result.accuracy + result.completeness + result.practicality + result.safety + result.readability
  return result as ReviewResult
}
