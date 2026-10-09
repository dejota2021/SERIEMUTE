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
Contexto vital real del artista:
- Álbum "FRUTAS" (hace aprox. 4 años): todo colorido, tropical, con temas como maracuyá, mango, melocotón, piña, borojó, uva. Pero en la realidad dejota estaba sin un peso en la cuenta, familia lejos, una culpa gigante por decisiones personales y a duras penas pagando la renta después de haber tenido tanto. Tenía que salir a defender la felicidad del álbum casi por compromiso comercial. El silencio duele menos que una sonrisa fingida.
- El accidente en la moto: A finales de ese año ocurrió el punto de quiebre. Iban en la moto, dejota iba manejando desconcentrado, abrumado por las deudas y decisiones personales no gestionadas. Accidente en la vía: responsabilidad de que su ex pareja sufriera fracturas en la pelvis.
- Ruptura y proceso delicado: En ese momento ya no eran pareja, estaban muy mal y él la había terminado; fue la peor decepción de su vida y él estaba decepcionado de sí mismo. Fue abrumante que ella no quisiera que él la acompañara en el proceso médico. Aceptar con madurez que ella necesitaba sanar lejos de él.
- El libro "Los cuatro acuerdos": Fue el libro que lo salvó del limbo mental, le dio enfoque, fe y la estructura mental para no caerse, asumir responsabilidad y entender que el perdón empieza por no mentirse. Asumir la vida con madurez exige silencio, no excusas. Hoy ella está bien, sana y recuperada con una pareja saludable, pero esa fractura de pelvis que le tomó tiempo recuperarse fue inolvidable para ambos.
- Regreso a Colombia: Con mucho miedo y culpa, se encerró a hacer música como loco y a crear transmisiones en vivo (lives) de madrugada para distraerse de los pensamientos y la soledad.
- "Alejarme": En su soledad más oscura crea "Alejarme", que habla de sus sentimientos más hondos y su obsesión por estar solo y crear.
- 2025 - Conocer a Marcelo (su manager): Empezaron a soñar juntos a partir de una canción llamada "De Todo".
- Las 3 canciones ancla de MUTE:
  1. "El Fondo": la primera canción del álbum, tocar fondo como base sólida de verdad.
  2. "Si Me Baila": la discoteca como contradicción humana (bailar con el dolor por dentro para anestesiar el caos).
  3. "De Todo": cuando una persona entrega absolutamente todo por ti y tú solo estás confundido de hacia dónde ir con tu vida, el arte, el dinero, la estabilidad y la claridad mental.
- Tono fundamental: SIEMPRE elegante, con factos, actual, cercano, sin victimizaciones baratas ni clickbait falso, que meta a la audiencia en sus propios sentimientos a través de la historia de dejota y dé ganas de conocer al artista, a la persona y su música.

Petición actual:
- Día: ${params.dayNumber ? `Día ${params.dayNumber}` : 'Video complementario'}
- Tema / Emoción: ${params.topic || params.emotion || 'Autenticidad y superación de la máscara'}
- Material de apoyo disponible: ${params.pastMaterial || 'Fotos/videos de archivo de Frutas/moto/Colombia vs estudio actual'}
- Notas o ideas del artista: ${params.userThoughts || 'Ninguna especificada'}

Genera una estructura de video vertical (TikTok / Reels / Shorts) completa en español con este formato:
1. Título conceptual del video (elegante y actual)
2. Emoción núcleo (ej. Culpa contenida, Contradicción en la fiesta, Gratitud incondicional)
3. 3 Opciones de Hook verbal para los primeros 3 segundos (directos, sin clickbait barato, con alto contraste y factos)
4. Dirección visual de cámara & B-Roll (Qué mostrar del pasado: portada Frutas, moto, Los cuatro acuerdos, libreta, audios vs Qué mostrar en el presente: rostro sobrio, estudio con Marcelo, guitarra acústica)
5. Guión hablado palabra por palabra (directo, natural, elegante, como si le hablara a un amigo a las 2 AM, 45 a 60 segundos de duración)
6. Llamado a la acción reflexivo (CTA que meta a la audiencia en sus propios sentimientos o invite a escuchar la canción)
7. Pie de foto / Copy recomendado para TikTok e Instagram con hashtags estratégicos
8. Consejo de filmación rápida (para grabarlo con el celular en 10 minutos sin complicaciones)
`;

  return await generatePrompt(prompt);
}

export async function answerStrategyQuestion(question: string) {
  const prompt = `
Eres el estratega creativo y confidente de marketing del artista musical "dejota2021".
Conoces a fondo su historia auténtica:
- Álbum "FRUTAS" (hace 4 años): todo colorido (maracuyá, mango, etc.), pero sin un peso en la cuenta, defendiendo felicidad por compromiso comercial.
- Accidente en la moto: manejaba desconcentrado por deudas; su ex pareja sufrió fracturas en la pelvis. Ya no eran pareja en ese momento, fue devastador que ella necesitara sanar lejos de él.
- "Los cuatro acuerdos": el libro que lo salvó del limbo mental, le dio fe, enfoque y estructura para asumir la verdad.
- Regreso a Colombia: miedo, culpa, hacer música obsesivamente y lives nocturnos para distraerse.
- "Alejarme": nacida en su soledad más oscura, sobre la obsesión por estar solo y crear.
- Marcelo (su manager desde 2025): empezaron a soñar con "De Todo".
- Trío conceptual de MUTE: "El Fondo" (track 1, tocar fondo), "Si Me Baila" (la discoteca como contradicción humana), y "De Todo" (cuando dan todo por ti y tú estás confundido de hacia dónde ir con tu vida, el arte y el dinero).
- Tono: elegante, con factos, actual, cercano, humano.

Pregunta o duda del artista:
"${question}"

Responde con empatía, precisión táctica de creador musical y consejos accionables de comunicación impecable y directa.
`;

  return await generatePrompt(prompt);
}
