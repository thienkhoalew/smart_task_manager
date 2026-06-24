interface BreakdownResponse {
  subtasks: string[];
  source: 'openrouter';
}

export async function suggestSubtasks(title: string, description: string): Promise<BreakdownResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Smart Task Manager',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: `Break down the following task into 3-6 clear, actionable, concise subtasks in the same language as the task title/description, preferably Vietnamese if it is in Vietnamese.
Task Title: "${title}"
Task Description: "${description || 'No description provided'}"

Return ONLY a JSON array of strings, for example: ["Subtask 1", "Subtask 2", "Subtask 3"]. Do not include markdown code block formatting or any explanation.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const parsed = JSON.parse(text.trim());
  const subtasks = Array.isArray(parsed) ? parsed : parsed.subtasks;

  if (!Array.isArray(subtasks) || subtasks.length === 0 || !subtasks.every(item => typeof item === 'string')) {
    throw new Error('OpenRouter returned invalid subtasks');
  }

  return { subtasks, source: 'openrouter' };
}
