import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Format any API error into a friendly Spanish explanation
 */
function cleanErrorMessage(err: any): string {
  if (!err) return 'Error desconocido al invocar Gemini.';
  const rawMsg = err?.message || String(err);
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error?.message) {
      if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
        return 'El servicio de IA está experimentando alta demanda momentánea. Por favor, intenta de nuevo en unos segundos.';
      }
      return parsed.error.message;
    }
  } catch {
    // Not JSON, continue
  }
  return rawMsg;
}

/**
 * Execute Gemini prompt with primary model (gemini-3.1-flash-lite)
 * and fallback to gemini-3.8-flash if needed.
 */
async function generatePrompt(prompt: string): Promise<string> {
  const ai = getGeminiClient();

  // First try gemini-3.1-flash-lite (fastest, robust against 503 spikes)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    return response.text || 'Sin respuesta generada por el modelo.';
  } catch (primaryErr: any) {
    console.warn('[Gemini] gemini-3.1-flash-lite error, attempting gemini-3.8-flash:', primaryErr?.message);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      return response.text || 'Sin respuesta generada por el modelo.';
    } catch (fallbackErr: any) {
      console.error('[Gemini] Fallback also failed:', fallbackErr?.message);
      throw new Error(cleanErrorMessage(primaryErr || fallbackErr));
    }
  }
}

export async function generateContentScript(params: {
  dayNumber?: number;
  topic?: string;
  emotion?: string;
  pastMaterial?: string;
  userThoughts?: string;
}) {
  const prompt = `
Eres el asesor narrativo y director creativo del artista musical "dejota2021".
Contexto vital del artista:
- En 2023 lanzó su álbum "FRUTAS": era un álbum muy colorido y festivo, pero en la realidad dejota estaba en el peor momento de su vida (sin dinero, sin adelanto discográfico, sin familia cerca, y sufrió un grave accidente de tránsito donde fue responsable de la fractura de su pareja). Tuvo que defender una sonrisa y una felicidad forzada por compromiso comercial.
- En ese quiebre empezó a componer canciones tristes y honestas, comenzando con "Alejarme".
- En 2025, junto a un nuevo amigo y project manager, comenzó a construir su nuevo álbum: "MUTE", una colección de sonidos nacidos en el silencio.
- Hoy en 2026, dejota está en un mejor momento de su vida, pero "MUTE" está por salir y merece todo el contexto emocional en redes sociales para conectar de forma profunda y humana con la audiencia.
- Su estrategia consiste en 30 días de contenido diario (1 video al día) basado en la VULNERABILIDAD RADICAL, AUTENTICIDAD ORGÁNICA y CONTRASTE PASADO VS PRESENTE.

Petición actual:
- Día: ${params.dayNumber ? `Día ${params.dayNumber}` : 'Video complementario'}
- Tema / Emoción: ${params.topic || params.emotion || 'Autenticidad y superación de la máscara'}
- Material de apoyo disponible: ${params.pastMaterial || 'Fotos/videos de archivo de 2023 vs estudio actual'}
- Notas o ideas del artista: ${params.userThoughts || 'Ninguna especificada'}

Genera una estructura de video vertical (TikTok / Reels / Shorts) completa en español con este formato:
1. Título conceptual del video
2. Emoción núcleo (ej. Culpa contenida, Catarsis, Sanación honesta)
3. 3 Opciones de Hook verbal para los primeros 3 segundos (claros, sin clickbait barato, con alto contraste emocional)
4. Dirección visual de cámara & B-Roll (Qué mostrar del pasado: archivos, fotos, audios vs Qué mostrar en el presente: rostro sin cortes, guitarra, estudio)
5. Guión hablado palabra por palabra (directo, natural, como si le hablara a un amigo a las 2 AM, 45 a 65 segundos de duración)
6. Llamado a la acción reflexivo (CTA que invite a la gente a comentar su propia historia o escuchar el adelanto)
7. Pie de foto / Copy recomendado para TikTok e Instagram con hashtags estratégicos
8. Consejo de filmación rápida (para grabarlo con el celular en 10 minutos sin complicarse)
`;

  return await generatePrompt(prompt);
}

export async function answerStrategyQuestion(question: string) {
  const prompt = `
Eres el estratega creativo y confidente de marketing del artista musical "dejota2021".
Conoces a fondo su historia:
- Álbum 2023: "FRUTAS" (colorido pero escondía su quiebre financiero, familiar y el accidente de auto donde su pareja se fracturó mientras él fingía sonrisas).
- Canción puente: "Alejarme".
- Nuevo álbum 2026: "MUTE" (creado en 2025 con su nuevo project manager, "sonidos nacidos en el silencio").
- Filosofía: Vulnerabilidad radical, no fingir nunca más, contenido orgánico rápido con material de apoyo del pasado y presente.

Pregunta o duda del artista:
"${question}"

Responde con empatía, precisión táctica de creador musical y consejos accionables de comunicación impecable y directa.
`;

  return await generatePrompt(prompt);
}
