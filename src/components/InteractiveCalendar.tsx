import React, { useState } from 'react';
import { DayStrategy, PHASES } from '../data/strategyData';
import { InteractiveProgressTracker } from './InteractiveProgressTracker';
import {
  Film,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Trash2,
  Maximize2,
  Minimize2,
  Plus
} from 'lucide-react';

interface InteractiveCalendarProps {
  days: DayStrategy[];
  onToggleRecorded: (dayId: number) => void;
  onToggleReviewed: (dayId: number) => void;
  onTogglePublished: (dayId: number) => void;
  onUpdateNotes: (dayId: number, notes: string) => void;
  onSelectDay: (day: DayStrategy) => void;
  onQuickAiRefine: (day: DayStrategy) => void;
  onDeleteDay: (dayId: number, dayNumber?: number, dayTitle?: string) => void;
  onOpenAddModal: () => void;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  days,
  onToggleRecorded,
  onToggleReviewed,
  onTogglePublished,
  onUpdateNotes,
  onSelectDay,
  onQuickAiRefine,
  onDeleteDay,
  onOpenAddModal,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unrecorded' | 'recorded' | 'reviewed' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHookDayId, setCopiedHookDayId] = useState<number | null>(null);

  // Expand / Collapse state per day card
  const [expandedDayIds, setExpandedDayIds] = useState<Set<number>>(new Set());

  const toggleExpand = (dayId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedDayIds((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDayIds(new Set(days.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedDayIds(new Set());
  };

  const handleCopyHook = (e: React.MouseEvent, day: DayStrategy) => {
    e.stopPropagation();
    navigator.clipboard.writeText(day.hookOptions[0]);
    setCopiedHookDayId(day.id);
    setTimeout(() => setCopiedHookDayId(null), 2000);
  };

  const filteredDays = days.filter((d) => {
    if (selectedPhase !== 'all' && d.phase !== selectedPhase) return false;
    if (selectedStatus === 'unrecorded' && d.isRecorded) return false;
    if (selectedStatus === 'recorded' && !d.isRecorded) return false;
    if (selectedStatus === 'reviewed' && !d.isReviewed) return false;
    if (selectedStatus === 'published' && !d.isPublished) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchTheme = d.theme.toLowerCase().includes(q);
      const matchEmotion = d.emotion.toLowerCase().includes(q);
      const matchNotes = d.notes.toLowerCase().includes(q);
      const matchDay = `día ${d.day}`.includes(q) || `dia ${d.day}`.includes(q);
      return matchTitle || matchTheme || matchEmotion || matchNotes || matchDay;
    }
    return true;
  });

  return (
    <section id="calendario" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Interactive Dynamic Progress Tracker */}
      <InteractiveProgressTracker
        days={days}
        activeStatusFilter={selectedStatus}
        onSelectStatusFilter={(status) => setSelectedStatus(status)}
        onSelectDay={onSelectDay}
        onToggleRecorded={onToggleRecorded}
        onToggleReviewed={onToggleReviewed}
        onTogglePublished={onTogglePublished}
      />

      {/* 2. Calendar Section Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 pb-4 border-b border-stone-800/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>PLANILLA DE CONTENIDO</span>
            <span aria-hidden="true">·</span>
            <span>{days.length} DÍAS DE MUTE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
            Calendario de Videos
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Gestiona la narrativa: agrega o elimina tarjetas, despliega u oculta la información, tacha los días grabados y deja tus apuntes guardados.
          </p>
        </div>

        {/* Global Toolbar: Add Card & Expand/Collapse All */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button: Agregar Tarjeta */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
            title="Crear y agregar una nueva tarjeta de video"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Agregar Tarjeta</span>
          </button>

          {/* Expand / Collapse All */}
          <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded-xl text-xs">
            <button
              onClick={expandAll}
              className="flex items-center gap-1 px-3 py-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title="Desplegar todas las tarjetas"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Desplegar todas</span>
            </button>
            <span className="text-stone-700" aria-hidden="true">|</span>
            <button
              onClick={collapseAll}
              className="flex items-center gap-1 px-3 py-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title="Compactar todas las tarjetas"
            >
              <Minimize2 className="h-3 w-3" />
              <span>Compactar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/70 border border-stone-800/80 rounded-xl">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedPhase === 'all'
                ? 'bg-stone-800 text-stone-100 font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Todas las Fases ({days.length})
          </button>
          {PHASES.map((p) => (
            <button
              key={p.phase}
              onClick={() => setSelectedPhase(p.phase)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedPhase === p.phase
                  ? 'bg-stone-800 text-stone-100 font-semibold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Fase {p.phase}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por emoción, tema o día..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900/80 border border-stone-800/80 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/80 transition-colors"
          />
        </div>
      </div>

      {/* Grid View of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDays.map((day) => {
          const isFullyDone = day.isRecorded && day.isReviewed && day.isPublished;
          const isExpanded = expandedDayIds.has(day.id);

          return (
            <div
              key={day.id}
              onClick={() => onSelectDay(day)}
              className={`group relative rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isFullyDone
                  ? 'border-stone-800/60 bg-[#1a1817]/40 opacity-85'
                  : day.isPublished
                  ? 'border-sky-900/40 bg-[#1a1817]/80 hover:border-sky-700/60'
                  : day.isReviewed
                  ? 'border-purple-900/40 bg-[#1a1817]/80 hover:border-purple-700/60'
                  : day.isRecorded
                  ? 'border-emerald-900/30 bg-[#1a1817]/70 hover:border-emerald-800/50'
                  : 'border-stone-800/50 bg-[#1a1817]/60 hover:border-stone-700/50 hover:bg-[#1a1817]/80'
              } p-6`}
            >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-800/60">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        DÍA {day.day < 10 ? `0${day.day}` : day.day}
                      </span>
                      <span className="text-stone-600 text-xs" aria-hidden="true">·</span>
                      <span className="text-[11px] text-stone-400 font-sans">
                        Fase {day.phase}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-stone-500 mr-0.5">
                        {day.targetDuration}
                      </span>

                      {/* Expand / Collapse Individual Card Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(day.id, e)}
                        className="p-1 text-stone-400 hover:text-amber-300 rounded hover:bg-stone-800/80 transition-colors cursor-pointer"
                        title={isExpanded ? 'Ocultar detalles' : 'Desplegar detalles'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {/* Delete Individual Card Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `¿Estás seguro de eliminar la tarjeta del Día ${day.day}: "${day.title}"?`
                            )
                          ) {
                            onDeleteDay(day.id, day.day, day.title);
                          }
                        }}
                        className="p-1 text-stone-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title={`Eliminar tarjeta del Día ${day.day}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Emotion */}
                  <div className="mt-3">
                    <div className="text-[11px] font-mono text-amber-400/80 uppercase tracking-wider">
                      {day.emotion}
                    </div>
                    <h3
                      className={`text-sm font-semibold mt-1 transition-colors leading-snug ${
                        isFullyDone ? 'line-through text-stone-400' : 'text-stone-100 group-hover:text-amber-200'
                      }`}
                    >
                      {day.title}
                    </h3>
                  </div>

                  {/* Collapsed Compact Preview indicator */}
                  {!isExpanded && (
                    <div className="mt-2.5 flex items-center justify-between text-xs text-stone-400 pt-1">
                      {day.notes ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-300/90 italic truncate max-w-[200px]">
                          <FileText className="h-3 w-3 shrink-0 text-amber-400" />
                          "{day.notes}"
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500">
                          {day.theme}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(day.id, e)}
                        className="text-[11px] text-amber-400/90 hover:underline flex items-center gap-0.5 ml-auto shrink-0 cursor-pointer"
                      >
                        Ver hook
                      </button>
                    </div>
                  )}

                  {/* Expandable Body Content (Hooks, Support Material, Notes) */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 pt-2 border-t border-stone-800/60 animate-in fade-in duration-200">
                      {/* Hook Box */}
                      <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                          <span className="text-amber-400 font-semibold">HOOK 01</span>
                          <button
                            onClick={(e) => handleCopyHook(e, day)}
                            className="text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copiar gancho"
                          >
                            {copiedHookDayId === day.id ? (
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <Check className="h-3 w-3" /> Copiado
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy className="h-3 w-3" /> Copiar
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-stone-200 italic leading-relaxed">
                          "{day.hookOptions[0]}"
                        </p>
                      </div>

                      {/* Material de Apoyo (Past vs Present summary) */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/60">
                        <div>
                          <span className="font-mono text-amber-400/90 text-[10px] block">PASADO 2023:</span>
                          <p className="text-stone-300 line-clamp-2 mt-0.5">{day.pastMaterial}</p>
                        </div>
                        <div>
                          <span className="font-mono text-emerald-400/90 text-[10px] block">PRESENTE 2026:</span>
                          <p className="text-stone-300 line-clamp-2 mt-0.5">{day.presentMaterial}</p>
                        </div>
                      </div>

                      {/* Saved Note Block with Clear button */}
                      <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/60 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                          <span className="flex items-center gap-1 text-amber-300/80">
                            <FileText className="h-3 w-3" /> ANOTACIÓN GUARDADA
                          </span>
                          {day.notes && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('¿Eliminar la nota de este día?')) {
                                  onUpdateNotes(day.id, '');
                                }
                              }}
                              className="text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Eliminar anotación de este día"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        {day.notes ? (
                          <p className="text-stone-200 italic leading-relaxed">{day.notes}</p>
                        ) : (
                          <p className="text-stone-500 italic text-[11px]">
                            Sin notas aún. Haz clic en la tarjeta para escribir.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Card Controls: Interactive Checkboxes for Grabación, Revisión & Publicación */}
                <div className="mt-4 pt-3 border-t border-stone-800/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Checkbox Grabado */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRecorded(day.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        day.isRecorded
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-xs'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                      }`}
                      title={day.isRecorded ? 'Desmarcar de grabado' : 'Marcar como grabado'}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                          day.isRecorded
                            ? 'bg-emerald-500 border-emerald-400 text-stone-950'
                            : 'border-stone-600'
                        }`}
                      >
                        {day.isRecorded && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span>Grabado</span>
                    </button>

                    {/* Checkbox Revisado */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleReviewed(day.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        day.isReviewed
                          ? 'bg-purple-950 text-purple-300 border-purple-700 shadow-xs'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                      }`}
                      title={day.isReviewed ? 'Desmarcar de revisado' : 'Marcar como revisado'}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                          day.isReviewed
                            ? 'bg-purple-500 border-purple-400 text-stone-950'
                            : 'border-stone-600'
                        }`}
                      >
                        {day.isReviewed && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span>Revisado</span>
                    </button>

                    {/* Checkbox Publicado */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublished(day.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        day.isPublished
                          ? 'bg-sky-950 text-sky-300 border-sky-700 shadow-xs'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                      }`}
                      title={day.isPublished ? 'Desmarcar de publicado' : 'Marcar como publicado'}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                          day.isPublished
                            ? 'bg-sky-500 border-sky-400 text-stone-950'
                            : 'border-stone-600'
                        }`}
                      >
                        {day.isPublished && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span>Publicado</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAiRefine(day);
                      }}
                      className="p-1.5 text-stone-400 hover:text-amber-300 rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Refinar con Gemini IA"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => toggleExpand(day.id, e)}
                      className="text-xs text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                      title={isExpanded ? 'Ocultar info' : 'Desplegar info'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDays.length === 0 && (
        <div className="text-center py-12 border border-stone-800 rounded-2xl bg-stone-900/30">
          <p className="text-stone-400 text-sm">No hay videos con los filtros seleccionados.</p>
          <button
            onClick={() => {
              setSelectedPhase('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="mt-3 px-3 py-1.5 text-xs text-amber-300 bg-stone-900 border border-stone-800 rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            Mostrar todos los {days.length} días
          </button>
        </div>
      )}
    </section>
  );
};
