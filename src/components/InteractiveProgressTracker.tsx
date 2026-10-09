import React from 'react';
import { DayStrategy } from '../data/strategyData';
import { Film, CheckCircle2, AlertCircle, Sparkles, Filter, Check, Eye } from 'lucide-react';

interface InteractiveProgressTrackerProps {
  days: DayStrategy[];
  activeStatusFilter: 'all' | 'unrecorded' | 'recorded' | 'reviewed' | 'published';
  onSelectStatusFilter: (status: 'all' | 'unrecorded' | 'recorded' | 'reviewed' | 'published') => void;
  onSelectDay: (day: DayStrategy) => void;
  onToggleRecorded: (dayId: number) => void;
  onToggleReviewed?: (dayId: number) => void;
  onTogglePublished: (dayId: number) => void;
}

export const InteractiveProgressTracker: React.FC<InteractiveProgressTrackerProps> = ({
  days,
  activeStatusFilter,
  onSelectStatusFilter,
  onSelectDay,
}) => {
  const totalDays = days.length;
  const recordedCount = days.filter((d) => d.isRecorded).length;
  const reviewedCount = days.filter((d) => d.isReviewed).length;
  const publishedCount = days.filter((d) => d.isPublished).length;
  const pendingCount = totalDays - recordedCount;

  const recordedPct = Math.round((recordedCount / totalDays) * 100);
  const reviewedPct = Math.round((reviewedCount / totalDays) * 100);
  const publishedPct = Math.round((publishedCount / totalDays) * 100);

  return (
    <div className="rounded-3xl border border-stone-800/60 bg-[#1a1817]/60 p-5 sm:p-8 backdrop-blur-md shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SEGUIMIENTO EN VIVO DE TU NARRATIVA</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
            Tablero Dinámico: Grabación, Revisión & Publicación
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Haz clic en los contadores para filtrar la lista al instante, o pulsa cualquier día (1 a 30) para ver su ficha.
          </p>
        </div>

        {/* Reset Filter Button if active */}
        {activeStatusFilter !== 'all' && (
          <button
            onClick={() => onSelectStatusFilter('all')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <Filter className="h-3 w-3" />
            <span>Mostrar los 30 días</span>
          </button>
        )}
      </div>

      {/* 4 Interactive Clickable Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* Card 1: Por Grabar */}
        <button
          type="button"
          onClick={() =>
            onSelectStatusFilter(activeStatusFilter === 'unrecorded' ? 'all' : 'unrecorded')
          }
          className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
            activeStatusFilter === 'unrecorded'
              ? 'border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Por Grabar</span>
            <AlertCircle className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
              {pendingCount}
            </span>
            <span className="text-xs text-stone-500 font-mono">de {totalDays}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>{totalDays - pendingCount} listos</span>
            <span className="text-amber-400/90 font-medium group-hover:underline">
              {activeStatusFilter === 'unrecorded' ? 'Filtro activo ✓' : 'Clic para filtrar'}
            </span>
          </div>
        </button>

        {/* Card 2: Grabados */}
        <button
          type="button"
          onClick={() =>
            onSelectStatusFilter(activeStatusFilter === 'recorded' ? 'all' : 'recorded')
          }
          className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
            activeStatusFilter === 'recorded'
              ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Videos Grabados</span>
            <Film className="h-4 w-4 text-emerald-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
              {recordedCount}
            </span>
            <span className="text-xs text-stone-500 font-mono">/ {totalDays}</span>
            <span className="text-xs font-mono text-emerald-400/80 ml-auto">{recordedPct}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Material grabado</span>
            <span className="text-emerald-400/90 font-medium group-hover:underline">
              {activeStatusFilter === 'recorded' ? 'Filtro activo ✓' : 'Clic para filtrar'}
            </span>
          </div>
        </button>

        {/* Card 3: Revisados */}
        <button
          type="button"
          onClick={() =>
            onSelectStatusFilter(activeStatusFilter === 'reviewed' ? 'all' : 'reviewed')
          }
          className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
            activeStatusFilter === 'reviewed'
              ? 'border-purple-500 bg-purple-950/30 ring-2 ring-purple-500/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Videos Revisados</span>
            <Eye className="h-4 w-4 text-purple-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-purple-400 tabular-nums">
              {reviewedCount}
            </span>
            <span className="text-xs text-stone-500 font-mono">/ {totalDays}</span>
            <span className="text-xs font-mono text-purple-400/80 ml-auto">{reviewedPct}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Edición verificada</span>
            <span className="text-purple-400/90 font-medium group-hover:underline">
              {activeStatusFilter === 'reviewed' ? 'Filtro activo ✓' : 'Clic para filtrar'}
            </span>
          </div>
        </button>

        {/* Card 4: Publicados */}
        <button
          type="button"
          onClick={() =>
            onSelectStatusFilter(activeStatusFilter === 'published' ? 'all' : 'published')
          }
          className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
            activeStatusFilter === 'published'
              ? 'border-sky-500 bg-sky-950/30 ring-2 ring-sky-500/30'
              : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Publicados al Aire</span>
            <CheckCircle2 className="h-4 w-4 text-sky-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-sky-400 tabular-nums">
              {publishedCount}
            </span>
            <span className="text-xs text-stone-500 font-mono">/ {totalDays}</span>
            <span className="text-xs font-mono text-sky-400/80 ml-auto">{publishedPct}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>En TikTok & Instagram</span>
            <span className="text-sky-400/90 font-medium group-hover:underline">
              {activeStatusFilter === 'published' ? 'Filtro activo ✓' : 'Clic para filtrar'}
            </span>
          </div>
        </button>
      </div>

      {/* Progress Bars for Streams */}
      <div className="mt-5 space-y-2.5 pt-4 border-t border-stone-800/70">
        <div>
          <div className="flex justify-between text-xs font-mono text-stone-400 mb-1">
            <span>PROGRESO DE RODAJE:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{recordedCount} de 30 grabados ({recordedPct}%)</span>
          </div>
          <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${recordedPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-stone-400 mb-1">
            <span>PROGRESO DE REVISIÓN:</span>
            <span className="text-purple-400 font-bold tabular-nums">{reviewedCount} de 30 revisados ({reviewedPct}%)</span>
          </div>
          <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${reviewedPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-stone-400 mb-1">
            <span>PROGRESO DE DIFUSIÓN EN REDES:</span>
            <span className="text-sky-400 font-bold tabular-nums">{publishedCount} de 30 publicados ({publishedPct}%)</span>
          </div>
          <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${publishedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive 30-Day Punch-Tape / Micro-Timeline */}
      <div className="mt-6 pt-4 border-t border-stone-800/70">
        <div className="flex items-center justify-between text-xs text-stone-400 mb-2.5">
          <span className="font-mono uppercase text-[11px] text-amber-400/90 font-semibold">
            Tira Interactiva de los 30 Días (Toca un día para abrirlo)
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-stone-700" /> Pendiente
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Grabado
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Revisado
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Publicado
            </span>
          </div>
        </div>

        {/* 30 Interactive Day Buttons */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 sm:gap-2">
          {days.map((day) => {
            const isRecorded = day.isRecorded;
            const isReviewed = day.isReviewed;
            const isPublished = day.isPublished;

            let badgeClass = 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-600';
            if (isPublished) {
              badgeClass = 'bg-sky-950 text-sky-200 border-sky-600 font-bold shadow-sm shadow-sky-950';
            } else if (isReviewed) {
              badgeClass = 'bg-purple-950 text-purple-200 border-purple-600 font-bold shadow-sm shadow-purple-950';
            } else if (isRecorded) {
              badgeClass = 'bg-emerald-950 text-emerald-200 border-emerald-600 font-bold shadow-sm shadow-emerald-950';
            }

            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(day)}
                className={`py-1.5 px-1 rounded-md text-[11px] font-mono border transition-all text-center flex flex-col items-center justify-center gap-0.5 hover:scale-105 cursor-pointer ${badgeClass}`}
                title={`Día ${day.day}: ${day.title} (${isPublished ? 'Publicado' : isReviewed ? 'Revisado' : isRecorded ? 'Grabado' : 'Pendiente'})`}
              >
                <span>{day.day < 10 ? `0${day.day}` : day.day}</span>
                <span className="text-[9px] opacity-75">
                  {isPublished ? 'PUB' : isReviewed ? 'REV' : isRecorded ? 'REC' : '·'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
