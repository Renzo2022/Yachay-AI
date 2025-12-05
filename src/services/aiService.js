const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `Eres un metodólogo de investigación experto en revisiones sistemáticas. Genera una estructura PICO precisa para el tema proporcionado.

Tu respuesta DEBE ser un JSON estricto con la siguiente forma exacta:
{
  "population": "...",
  "intervention": "...",
  "comparison": "...",
  "outcome": "...",
  "question": "Pregunta PICO formulada completa"
}

No incluyas texto adicional, comentarios ni explicación fuera del JSON.`;

export async function generatePICO(topic) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Falta VITE_GROQ_API_KEY en el entorno.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Tema de investigación: ${topic}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al generar PICO: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('La respuesta de la IA no es válida.');
  }

  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('No se pudo parsear la respuesta de la IA', error);
    throw new Error('La IA devolvió un formato inesperado.');
  }
}
