import React, { useState } from 'react';
import { DayStrategy, PHASES } from '../data/strategyData';
import { X, Plus, Sparkles, Film, FileText, Check } from 'lucide-react';

interface AddDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDay: (newDay: DayStrategy) => void;
  existingDays: DayStrategy[];
}

export const AddDayModal: React.FC<AddDayModalProps> = ({
  isOpen,
  onClose,
  onAddDay,
  existingDays,
}) => {
  if (!isOpen) return null;

  const nextDayNumber =
    existingDays.length > 0
      ? Math.max(...existingDays.map((d) => d.day)) + 1
      : 1;

  const [dayNumber, setDayNumber] = useState<number>(nextDayNumber);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(
    nextDayNumber <= 8 ? 1 : nextDayNumber <= 16 ? 2 : nextDayNumber <= 23 ? 3 : 4
  );
  const [title, setTitle] = useState('');
  const [emotion, setEmotion] = useState('');
  const [theme, setTheme] = useState('');
  const [hook1, setHook1] = useState('');
  const [hook2, setHook2] = useState('');
  const [hook3, setHook3] = useState('');
  const [pastMaterial, setPastMaterial] = useState('');
  const [presentMaterial, setPresentMaterial] = useState('');
  const [scriptDraft, setScriptDraft] = useState('');
  const [targetDuration, setTargetDuration] = useState('50s');
  const [filmingTip, setFilmingTip] = useState('');
  const [audioSuggestion, setAudioSuggestion] = useState('');
  const [copyInstagram, setCopyInstagram] = useState('');
  const [tagsInput, setTagsInput] = useState('#dejota2021, #MUTE, #autenticidad');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPhaseObj = PHASES.find((p) => p.phase === phase) || PHASES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor escribe un título para la tarjeta.');
      return;
    }
    if (!hook1.trim()) {
      setErrorMsg('Por favor escribe al menos el primer Gancho (Hook 1).');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newDay: DayStrategy = {
      id: Date.now(),
      day: Number(dayNumber) || nextDayNumber,
      phase,
      phaseTitle: selectedPhaseObj.title.replace(/^Fase \d+:\s*/, ''),
      phaseSubtitle: selectedPhaseObj.subtitle,
      title: title.trim(),
      emotion: emotion.trim() || 'Vulnerabilidad y Verdad',
      theme: theme.trim() || 'Contraste y Autenticidad',
      hookOptions: [
        hook1.trim(),
        hook2.trim() || hook1.trim(),
        hook3.trim() || hook1.trim(),
      ],
      pastMaterial: pastMaterial.trim() || 'Archivo fotográfico o video del pasado.',
      presentMaterial: presentMaterial.trim() || 'dejota en el estudio con luz natural.',
      scriptDraft: scriptDraft.trim() || `${title.trim()}.\n\n(Relato sincero y pausado hacia la cámara sin poses ni filtros).`,
      audioSuggestion: audioSuggestion.trim() || 'Guitarra acústica suave con respiración cercana.',
      targetDuration: targetDuration.trim() || '50s',
      filmingTip: filmingTip.trim() || 'Grabación en una sola toma con luz natural y voz pausada.',
      copyInstagram: copyInstagram.trim() || `${title.trim()}. Rumbo a MUTE.`,
      tags: tags.length > 0 ? tags : ['#dejota2021', '#MUTE'],
      isRecorded: false,
      isReviewed: false,
      isPublished: false,
      notes: notes.trim(),
    };

    onAddDay(newDay);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#181615] border border-stone-800 text-stone-200 shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-xs uppercase text-amber-400 font-semibold tracking-wider">
                Nueva Pieza Narrativa
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
                Agregar Tarjeta al Calendario
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 py-4 space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Row 1: Day Number & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1.5">
                NÚMERO DE DÍA:
              </label>
              <input
                type="number"
                min={1}
                value={dayNumber}
                onChange={(e) => setDayNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-stone-400 mb-1.5">
                FASE NARRATIVA:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([1, 2, 3, 4] as const).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPhase(pNum)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      phase === pNum
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    Fase {pNum}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 truncate">
                {selectedPhaseObj.title} · {selectedPhaseObj.subtitle}
              </p>
            </div>
          </div>

          {/* Row 2: Title & Emotion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-stone-400 mb-1.5">
                TÍTULO CONCEPTUAL DEL VIDEO: *
              </label>
              <input
                type="text"
                placeholder="Ej. El día que entendí la diferencia entre éxito y paz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1.5">
                EMOCIÓN NÚCLEO:
              </label>
              <input
                type="text"
                placeholder="Ej. Contradicción / Gratitud"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 3: Theme */}
          <div>
            <label className="block text-xs font-mono text-stone-400 mb-1.5">
              TEMA ESTRATÉGICO:
            </label>
            <input
              type="text"
              placeholder="Ej. Tocar fondo para encontrar la primera verdad sin pretensiones"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Row 4: Hook Options */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-amber-400 font-semibold">
                GANCHOS VERBALES (PRIMEROS 3 SEGUNDOS):
              </label>
              <span className="text-[11px] text-stone-500">Hook 1 obligatorio</span>
            </div>

            <div>
              <input
                type="text"
                placeholder="Hook 1 (Principal): 'Si alguna vez tuviste que sonreír en la oficina con el corazón roto...'"
                value={hook1}
                onChange={(e) => setHook1(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Hook 2 (Alternativa): 'Hay errores que te parten la vida en dos...'"
                value={hook2}
                onChange={(e) => setHook2(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Hook 3 (Alternativa): 'Esta es la canción que casi no me atrevo a publicar...'"
                value={hook3}
                onChange={(e) => setHook3(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 5: Material de Apoyo (Past vs Present) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-amber-400/90 mb-1.5">
                MATERIAL DE APOYO PASADO (2023):
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Portada de Frutas en el celular, captura de saldo $0, audio antiguo..."
                value={pastMaterial}
                onChange={(e) => setPastMaterial(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-emerald-400/90 mb-1.5">
                MATERIAL DE APOYO PRESENTE (2026):
              </label>
              <textarea
                rows={2}
                placeholder="Ej. dejota en el estudio con luz natural, guitarra acústica limpia, junto a Marcelo..."
                value={presentMaterial}
                onChange={(e) => setPresentMaterial(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Row 6: Script Draft */}
          <div>
            <label className="block text-xs font-mono text-stone-400 mb-1.5">
              GUIÓN HABLADO / BORRADOR DE LECTURA (TELEPROMPTER):
            </label>
            <textarea
              rows={4}
              placeholder="Escribe el guión palabra por palabra como si hablaras a un amigo a las 2 AM..."
              value={scriptDraft}
              onChange={(e) => setScriptDraft(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
            />
          </div>

          {/* Row 7: Details (Duration, Tip, Audio) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">
                DURACIÓN:
              </label>
              <input
                type="text"
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">
                CONSEJO DE RODAJE:
              </label>
              <input
                type="text"
                placeholder="Plano secuencia de 1 toma..."
                value={filmingTip}
                onChange={(e) => setFilmingTip(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">
                SUGERENCIA DE AUDIO:
              </label>
              <input
                type="text"
                placeholder="Guitarra limpia a -14dB..."
                value={audioSuggestion}
                onChange={(e) => setAudioSuggestion(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 8: Copy Instagram & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">
                COPY / PIE DE FOTO:
              </label>
              <textarea
                rows={2}
                placeholder="Texto para acompañar en Instagram y TikTok..."
                value={copyInstagram}
                onChange={(e) => setCopyInstagram(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">
                NOTAS PERSONALES / APUNTES:
              </label>
              <textarea
                rows={2}
                placeholder="Tener lista la camisa negra, buscar el audio en WhatsApp..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>Guardar y Agregar Tarjeta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
