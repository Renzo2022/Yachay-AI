const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

const PICO_PROMPT = `Eres un metodólogo de investigación experto en revisiones sistemáticas. Genera una estructura PICO precisa para el tema proporcionado.

Tu respuesta DEBE ser un JSON estricto con la siguiente forma exacta:
{
  "population": "...",
  "intervention": "...",
  "comparison": "...",
  "outcome": "...",
  "question": "Pregunta PICO formulada completa"
}

No incluyas texto adicional, comentarios ni explicación fuera del JSON.`;

const SCREENING_PROMPT = `Actúa como un revisor sistemático estricto. Evalúa si el siguiente estudio cumple con los criterios PICO provistos.

Responde SOLO con este JSON exacto:
{
  "decision": "include" | "exclude" | "maybe",
  "confidence": 0-100,
  "reason": "Breve justificación en 1 frase"
}`;

const DEFAULT_EXTRACTION_FIELDS = [
  'Tamaño de Muestra (n)',
  'Edad Promedio',
  'País',
  'Metodología',
  'Resultado Principal (p-value/effect size)',
];

async function callGroq(body) {
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
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en Groq: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('La respuesta de la IA no es válida.');
  }
  return content;
}

export async function generatePICO(topic) {
  const content = await callGroq({
    model: GROQ_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: PICO_PROMPT },
      { role: 'user', content: `Tema de investigación: ${topic}` },
    ],
  });

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('No se pudo parsear la respuesta de la IA', error);
    throw new Error('La IA devolvió un formato inesperado.');
  }
}

export async function runScreeningAgent(paper, picoCriteria = {}) {
  const userContent = `Estudio: ${paper?.title ?? 'Sin título'} - ${paper?.abstract ?? 'Sin resumen'}

Criterios PICO:
Población: ${picoCriteria.population ?? 'N/D'}
Intervención: ${picoCriteria.intervention ?? 'N/D'}
Comparación: ${picoCriteria.comparison ?? 'N/D'}
Resultado: ${picoCriteria.outcome ?? 'N/D'}`;

  const content = await callGroq({
    model: GROQ_MODEL,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SCREENING_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('Respuesta de screening inválida', error);
    throw new Error('La IA devolvió un formato inesperado en el cribado.');
  }
}

export const EXTRACTION_FIELDS = DEFAULT_EXTRACTION_FIELDS;

export async function runExtractionAgent(paperText, fieldsToExtract = DEFAULT_EXTRACTION_FIELDS) {
  const fields = fieldsToExtract?.length ? fieldsToExtract : DEFAULT_EXTRACTION_FIELDS;
  const sanitizedText = (paperText ?? '').slice(0, 18000);
  if (!sanitizedText) {
    throw new Error('No se proporcionó texto del estudio para analizar.');
  }

  const userContent = `Campos a extraer:
${fields.map((field) => `- ${field}`).join('\n')}

Si un campo no aparece de forma explícita, responde "No reportado".

Texto del estudio:
${sanitizedText}`;

  const content = await callGroq({
    model: GROQ_MODEL,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Eres un analista de datos científicos. Lee el siguiente texto académico y extrae los campos solicitados. Si un dato no está claro, responde "No reportado". Devuelve únicamente JSON.',
      },
      { role: 'user', content: userContent },
    ],
  });

  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('Respuesta de extracción inválida', error);
    throw new Error('La IA devolvió un formato inesperado durante la extracción.');
  }
}
