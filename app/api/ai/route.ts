import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.AI_MODEL || 'z-ai/glm-4.5-air:free';

const SYSTEM_PROMPT = `너는 초등학생을 위한 영어 단어 학습 도우미야.
항상 한국어로 답변하고, 초등학생이 이해할 수 있게 쉽고 친근하게 설명해줘.
답변은 짧고 간결하게 해줘 (3줄 이내).
영어 학습과 관련없는 질문에는 "영어 공부와 관련된 질문을 해줘!" 라고 답해.`;

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const { type, context } = await req.json();

    let userPrompt = '';
    let maxTokens = 1024;

    switch (type) {
      case 'explain_wrong':
        userPrompt = `학생이 "${context.meaning}"의 영어 단어를 묻는 문제에서 틀렸어.
정답은 "${context.correctAnswer}"야.
왜 이 단어가 어려울 수 있는지, 어떻게 외우면 좋을지 초등학생에게 설명해줘.`;
        break;

      case 'example_sentence':
        userPrompt = `영어 단어 "${context.word}"(뜻: ${context.meaning})에 대해:
1. 초등학생이 이해할 수 있는 짧은 예문 2개 (영어 + 한국어 해석)
2. 재미있는 기억법 1개
JSON 형식으로 답해줘: {"examples": [{"en": "...", "ko": "..."}], "hint": "..."}`;
        break;

      case 'quiz_feedback':
        userPrompt = `학생의 퀴즈 결과를 분석해줘:
- 점수: ${context.percentage}%
- 맞은 개수: ${context.correct}/${context.total}
- 걸린 시간: ${context.duration}초
- 틀린 단어: ${context.wrongWords?.join(', ') || '없음'}
- 모드: ${context.mode}

2-3줄로 격려하면서 어떤 부분을 더 공부하면 좋을지 조언해줘.`;
        break;

      default:
        return NextResponse.json({ error: 'Unknown request type' }, { status: 400 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://pre-buildup-voc.vercel.app',
        'X-Title': 'Pre-Build Up Voca',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', errorData);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content.trim()) {
      console.error('AI returned empty content. Response:', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
