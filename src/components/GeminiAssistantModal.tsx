import React, { useState } from 'react';
import { DayStrategy } from '../data/strategyData';
import { Sparkles, X, Send, Copy, Check, MessageSquare, Bot, HelpCircle, Loader2 } from 'lucide-react';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDay?: DayStrategy | null;
  initialNote?: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  preselectedDay,
  initialNote = '',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'script' | 'qa'>('script');
  const [dayNumber, setDayNumber] = useState<number>(preselectedDay?.day || 1);
  const [emotionInput, setEmotionInput] = useState<string>(preselectedDay?.emotion || '');
  const [pastMaterialInput, setPastMaterialInput] = useState<string>(preselectedDay?.pastMaterial || '');
  const [userThoughts, setUserThoughts] = useState<string>(initialNote || preselectedDay?.notes || '');
  const [qaQuestion, setQaQuestion] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getApiEndpoint = (path: string) => {
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const parseErrorMessage = (err: any) => {
    if (!err) return 'Hubo un error inesperado al consultar la IA.';
    const msg = err.message || String(err);
    if (msg.includes('high demand') || msg.includes('503') || msg.includes('UNAVAILABLE')) {
      return 'El servidor de IA está procesando varias solicitudes. Por favor, pulsa el botón nuevamente para reintentar.';
    }
    if (msg.includes('pattern') || msg.includes('TypeError') || msg.includes('Failed to fetch')) {
      return 'No se pudo conectar con el servicio local de IA. Verificando conexión...';
    }
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) return parsed.error.message;
    } catch {
      // not json
    }
    return msg;
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResultText('');

    try {
      const response = await fetch(getApiEndpoint('/api/generate-script'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber,
          emotion: emotionInput,
          pastMaterial: pastMaterialInput,
          userThoughts,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al conectar con el asistente Gemini');
      }

      setResultText(data.script);
    } catch (err: any) {
      setErrorMsg(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (customQ?: string) => {
    const q = customQ || qaQuestion;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResultText('');

    try {
      const response = await fetch(getApiEndpoint('/api/strategy-assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al conectar con el asistente Gemini');
      }

      setResultText(data.answer);
    } catch (err: any) {
      setErrorMsg(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickQuestions = [
    '¿Cómo responder con altura si alguien dice que extraño el estilo alegre de FRUTAS?',
    '¿Cómo hablar del accidente respetando la privacidad de mi pareja sin perder honestidad?',
    'Dame 3 hooks demoledores para alguien que tiene que sonreír en el trabajo estando deprimido.',
    '¿Qué hacer si un día me da ansiedad y no me siento con ánimo de grabar?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Estudio Creativo Gemini · dejota2021
              </h3>
              <p className="text-xs text-neutral-400">
                Generador de guiones auténticos y asesor de comunicación directa para MUTE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-800/80 bg-neutral-950">
          <button
            onClick={() => {
              setMode('script');
              setResultText('');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'script'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Generar / Adaptar Guión de un Día</span>
          </button>

          <button
            onClick={() => {
              setMode('qa');
              setResultText('');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'qa'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Consultar Estrategia & Respuestas</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {mode === 'script' ? (
            /* Script Generator Form */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    NÚMERO DE DÍA (1 A 30):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={dayNumber}
                    onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    EMOCIÓN O TEMA CENTRAL:
                  </label>
                  <input
                    type="text"
                    value={emotionInput}
                    onChange={(e) => setEmotionInput(e.target.value)}
                    placeholder="Ej: Culpa, Reconciliación con la guitarra, Soledad..."
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  MATERIAL DE APOYO QUE TIENES A MANO HOY:
                </label>
                <input
                  type="text"
                  value={pastMaterialInput}
                  onChange={(e) => setPastMaterialInput(e.target.value)}
                  placeholder="Ej: Foto en el celular de la camisa hawaiana de 2023, audio de nota de voz..."
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  ANOTACIÓN O IDEA QUE SE TE OCURRIÓ HOY (OPCIONAL):
                </label>
                <textarea
                  value={userThoughts}
                  onChange={(e) => setUserThoughts(e.target.value)}
                  rows={3}
                  placeholder="Ej: 'Amanecí pensando en la llamada de mi mamá de ayer', 'Quiero mencionar que estuve a punto de vender la guitarra'..."
                  className="w-full p-3 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Construyendo guión orgánico con Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generar Estructura Completa de Video (Día {dayNumber})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Q&A Strategy Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  PREGUNTAS RÁPIDAS FRECUENTES:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQaQuestion(q);
                        handleAskQuestion(q);
                      }}
                      className="text-left p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 hover:text-amber-300 hover:border-neutral-700 transition-colors"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  O HAZ TU PROPIA PREGUNTA DE ESTRATEGIA:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="Escribe tu duda sobre comunicación, cómo encarar a la cámara..."
                    className="flex-1 px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskQuestion();
                    }}
                  />
                  <button
                    onClick={() => handleAskQuestion()}
                    disabled={loading || !qaQuestion.trim()}
                    className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Consultar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {/* Result Output Display */}
          {resultText && (
            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Respuesta de Gemini 3.8 Flash
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar al portapapeles</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs leading-relaxed text-neutral-200 whitespace-pre-wrap font-sans max-h-96 overflow-y-auto pr-2">
                {resultText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
