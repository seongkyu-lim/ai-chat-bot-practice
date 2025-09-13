/*
  Minimal OpenAI provider. If process.env.OPENAI_API_KEY is present, it will
  call OpenAI Chat Completions API via fetch. Otherwise it returns a mock answer.
*/

import { openaiConstants } from './openai.constans';

export async function generateAnswer(
  prompt: string,
  model?: string,
): Promise<string> {
  const apiKey = openaiConstants.apiKey;
  const finalModel = model || 'gpt-4o-mini';
  if (!apiKey) {
    return `Mock answer to: ${prompt}`;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${text}`);
    }

    type ChoiceMessage = { content?: string };
    type Choice = { message?: ChoiceMessage };
    type ChatCompletionsResponse = { choices?: Choice[] };

    const data: ChatCompletionsResponse =
      (await res.json()) as ChatCompletionsResponse;
    const answer = data?.choices?.[0]?.message?.content ?? '';
    return answer || 'No response generated.';
  } catch (e) {
    return `Failed to generate answer: ${(e as Error).message}`;
  }
}
