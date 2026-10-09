import React, { useState, useEffect, useRef } from 'react';
import { DayStrategy } from '../data/strategyData';
import {
  X,
  Check,
  Copy,
  Sparkles,
  Film,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  Save,
  MessageSquare,
  Volume2,
  Trash2
} from 'lucide-react';

interface DayDetailModalProps {
  day: DayStrategy | null;
  onClose: () => void;
  onToggleRecorded: (dayId: number) => void;
  onTogglePublished: (dayId: number) => void;
  onUpdateNotes: (dayId: number, notes: string) => void;
  onRefineWithAi: (day: DayStrategy, userNotes: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  day,
  onClose,
  onToggleRecorded,
  onTogglePublished,
  onUpdateNotes,
  onRefineWithAi,
}) => {
  if (!day) return null;

  const [notesText, setNotesText] = useState(day.notes || '');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [teleprompterActive, setTeleprompterActive] = useState(false);
  const [teleprompterView, setTeleprompterView] = useState<'script' | 'notes'>('script');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [saveStatus, setSaveStatus] = useState<string>('Guardado');

  const timerRef = useRef<number | null>(null);
  const teleprompterScrollRef = useRef<HTMLDivElement | null>(null);
  const isTypingRef = useRef<boolean>(false);

  // Sync internal notes state if day prop changes or updates remotely
  useEffect(() => {
    if (!isTypingRef.current) {
      setNotesText(day.notes || '');
    }
  }, [day.notes, day.id]);

  useEffect(() => {
    setSecondsElapsed(0);
    setIsTimerRunning(false);
  }, [day.id]);

  // Handle ultra-fast auto-save notes with 200ms debounce
  useEffect(() => {
    setSaveStatus('Guardando...');
    const timeout = setTimeout(() => {
      onUpdateNotes(day.id, notesText);
      setSaveStatus('Guardado en la nube ✓');
    }, 200);

    return () => clearTimeout(timeout);
  }, [notesText, day.id]);

  // Timer logic for teleprompter
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl transition-all ${
          teleprompterActive ? 'max-w-5xl h-[92vh] flex flex-col' : 'my-8'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-amber-400 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
              DÍA {day.day < 10 ? `0${day.day}` : day.day}
            </span>
            <span className="text-neutral-600 text-xs" aria-hidden="true">·</span>
            <span className="text-xs text-neutral-400 font-mono">
              Fase {day.phase}: {day.phaseTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeleprompterActive(!teleprompterActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                teleprompterActive
                  ? 'bg-amber-400 text-neutral-950 border-amber-400'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
              title="Modo pantalla completa para leer mientras grabas con tu cámara"
            >
              {teleprompterActive ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Salir de Teleprompter</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Modo Teleprompter</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Cerrar ventana"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Teleprompter Full View Mode */}
        {teleprompterActive ? (
          <div className="flex-1 flex flex-col p-6 overflow-hidden bg-black">
            {/* Teleprompter Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900 text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isTimerRunning
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-neutral-950'
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isTimerRunning ? 'Pausar Ensayo' : 'Iniciar Ensayo'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsElapsed(0);
                  }}
                  className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg border border-neutral-800"
                  title="Reiniciar temporizador"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 font-mono text-lg text-white">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="tabular-nums font-bold">{formatTimer(secondsElapsed)}</span>
                  <span className="text-xs text-neutral-500">/ Meta {day.targetDuration}</span>
                </div>
              </div>

              {/* Toggle View & Font Size */}
              <div className="flex items-center gap-4">
                <div className="flex p-0.5 bg-neutral-900 border border-neutral-800 rounded">
                  <button
                    onClick={() => setTeleprompterView('script')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${teleprompterView === 'script' ? 'bg-amber-600 text-white' : 'text-neutral-400'}`}
                  >
                    Guión
                  </button>
                  <button
                    onClick={() => setTeleprompterView('notes')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${teleprompterView === 'notes' ? 'bg-amber-600 text-white' : 'text-neutral-400'}`}
                  >
                    Anotaciones
                  </button>
                </div>

                <div className="flex items-center p-0.5 bg-neutral-900 border border-neutral-800 rounded">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-1 text-xs rounded ${fontSize === 'normal' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 text-sm font-semibold rounded ${fontSize === 'large' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setFontSize('huge')}
                    className={`px-2 py-1 text-base font-bold rounded ${fontSize === 'huge' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                  >
                    A++
                  </button>
                </div>
              </div>
            </div>

            {/* Scrolling Content */}
            <div
              ref={teleprompterScrollRef}
              className="flex-1 overflow-y-auto py-8 px-4 text-center select-none"
            >
              <div className="max-w-2xl mx-auto space-y-8">
                {teleprompterView === 'script' ? (
                  <>
                    <div className="text-amber-400/80 font-mono text-xs uppercase tracking-widest">
                      GANCHO DE ENTRADA (0-3s)
                    </div>
                    <p className="text-amber-200 font-medium text-xl sm:text-2xl leading-relaxed">
                      "{day.hookOptions[0]}"
                    </p>

                    <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest pt-4">
                      CUERPO DEL VIDEO (VULNERABILIDAD RADICAL)
                    </div>
                    <p
                      className={`text-white leading-relaxed font-light ${
                        fontSize === 'normal'
                          ? 'text-lg sm:text-xl'
                          : fontSize === 'large'
                          ? 'text-xl sm:text-2xl sm:leading-loose'
                          : 'text-2xl sm:text-3xl sm:leading-loose'
                      }`}
                    >
                      {day.scriptDraft}
                    </p>

                    <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest pt-4">
                      LLAMADO A LA COMUNIDAD & AUDIO MUTE
                    </div>
                    <p className="text-neutral-300 italic text-lg sm:text-xl">
                      {day.filmingTip}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-amber-400/80 font-mono text-xs uppercase tracking-widest">
                      ANOTACIONES GUARDADAS
                    </div>
                    <div
                      className={`text-white leading-relaxed font-light whitespace-pre-wrap ${
                        fontSize === 'normal'
                          ? 'text-lg sm:text-xl'
                          : fontSize === 'large'
                          ? 'text-xl sm:text-2xl sm:leading-loose'
                          : 'text-2xl sm:text-3xl sm:leading-loose'
                      }`}
                    >
                      {notesText || <span className="text-neutral-600 italic">No hay anotaciones guardadas para este día.</span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Detail View Mode */
          <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
            {/* Header Title & Status Checkboxes */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Emoción: <span className="text-amber-400 font-semibold">{day.emotion}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                  {day.title}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Eje temático: {day.theme} · Duración recomendada: <strong className="text-neutral-200">{day.targetDuration}</strong>
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => onToggleRecorded(day.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    day.isRecorded
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <Film className="h-4 w-4" />
                  <span>{day.isRecorded ? 'Día Grabado ✓' : 'Marcar como Grabado'}</span>
                </button>

                <button
                  onClick={() => onTogglePublished(day.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    day.isPublished
                      ? 'bg-sky-950 text-sky-300 border-sky-700 shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{day.isPublished ? 'Publicado en Redes ✓' : 'Marcar como Publicado'}</span>
                </button>
              </div>
            </div>

            {/* Section 1: Hook Selector (3 Options) */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    1. Ganchos de Entrada (0 a 3 seg)
                  </span>
                  <span className="text-xs text-neutral-500">· 3 opciones listas para usar</span>
                </div>
              </div>

              <div className="grid gap-2.5">
                {day.hookOptions.map((hook, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                  >
                    <div className="text-xs leading-relaxed text-neutral-200">
                      <span className="font-mono text-amber-400 font-bold mr-2">OPCIÓN {idx + 1}:</span>
                      "{hook}"
                    </div>
                    <button
                      onClick={() => copyToClipboard(hook, `hook-${idx}`)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors shrink-0"
                      title="Copiar gancho"
                    >
                      {copiedSection === `hook-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Material de Apoyo (Pasado vs Presente) */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  2. Material de Apoyo Requerido (El Secreto Orgánico)
                </span>
                <span className="text-xs text-neutral-500">Muestra la pantalla o monta B-roll</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                    <span>⏪ ARCHIVO DEL PASADO (2023 / FRUTAS)</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {day.pastMaterial}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                    <span>⏩ TOMA DEL PRESENTE (2026 / MUTE)</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {day.presentMaterial}
                  </p>
                </div>
              </div>

              <div className="text-xs text-neutral-400 flex items-center gap-2 pt-1">
                <Volume2 className="h-3.5 w-3.5 text-neutral-500" />
                <span>Audio sugerido: <strong className="text-neutral-200">{day.audioSuggestion}</strong></span>
              </div>
            </div>

            {/* Section 3: Guión Completo Palabra por Palabra */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  3. Guión Hablado Palabra por Palabra
                </span>
                <button
                  onClick={() => copyToClipboard(day.scriptDraft, 'full-script')}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors"
                >
                  {copiedSection === 'full-script' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copiado al portapapeles</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Guión Completo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800/80 text-sm leading-relaxed text-neutral-200">
                {day.scriptDraft}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2">
                <Camera className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200">Consejo de rodaje rápido: </strong>
                  {day.filmingTip}
                </div>
              </div>
            </div>

            {/* Section 4: Apartado de Anotaciones Guardadas (User Requested) */}
            <div className="rounded-xl border border-amber-900/30 bg-neutral-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold">
                    Apartado de Anotaciones Guardadas
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                  {notesText && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('¿Eliminar la anotación de este día?')) {
                          setNotesText('');
                          onUpdateNotes(day.id, '');
                        }
                      }}
                      className="text-stone-400 hover:text-rose-400 text-[11px] font-sans flex items-center gap-1 transition-colors"
                      title="Eliminar anotación"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Borrar nota</span>
                    </button>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <Save className="h-3 w-3" />
                    <span>{saveStatus}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                Deja anotaciones de ideas específicas, nombres de archivos de video en tu celular, recuerdos personales que quieras mencionar o apuntes con tu manager. Todo se guarda automáticamente.
              </p>

              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                onFocus={() => {
                  isTypingRef.current = true;
                }}
                onBlur={() => {
                  isTypingRef.current = false;
                  onUpdateNotes(day.id, notesText);
                }}
                rows={3}
                placeholder="Ejemplo: 'Usar la foto de la camisa hawaiana que tengo en favoritos', 'Grabar después de las 6 PM con la guitarra afinada en D', 'Mencionar a mi pareja con amor y respeto'..."
                className="w-full p-3 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
              />

              {/* Botón de Refinar con Gemini IA */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-neutral-500">
                  ¿Quieres personalizar este guión con tu anécdota de hoy?
                </span>
                <button
                  onClick={() => onRefineWithAi(day, notesText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-800 rounded-lg transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Adaptar Guión con Gemini IA</span>
                </button>
              </div>
            </div>

            {/* Section 5: Copy para Redes (Instagram / TikTok) */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Copy / Pie de Foto Sugerido
                </span>
                <button
                  onClick={() => copyToClipboard(`${day.copyInstagram}\n\n${day.tags.join(' ')}`, 'copy-ig')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === 'copy-ig' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copiar Copy</span>
                </button>
              </div>
              <p className="text-xs text-neutral-300 italic">
                "{day.copyInstagram}"
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-neutral-500 font-mono">
                {day.tags.map((t, idx) => (
                  <span key={idx} className="text-neutral-400">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
