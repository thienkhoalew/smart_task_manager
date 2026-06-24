/**
 * AI Task Breakdown Service
 * Requires GEMINI_API_KEY. No fallback.
 */

interface BreakdownResponse {
  subtasks: string[];
  source: 'gemini';
}

export async function suggestSubtasks(title: string, description: string): Promise<BreakdownResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert project manager. Break down the following task into a list of 3-6 clear, actionable, concise subtasks (in the same language as the task title/description, preferably Vietnamese if it is in Vietnamese).
Task Title: "${title}"
Task Description: "${description || 'No description provided'}"

Return ONLY a JSON array of strings, for example: ["Subtask 1", "Subtask 2", "Subtask 3"]. Do not include markdown code block formatting (like \`\`\`json) or any explanation.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const subtasks = JSON.parse(text.trim());

  if (!Array.isArray(subtasks) || subtasks.length === 0 || !subtasks.every(item => typeof item === 'string')) {
    throw new Error('Gemini returned invalid subtasks');
  }

  return { subtasks, source: 'gemini' };
}
