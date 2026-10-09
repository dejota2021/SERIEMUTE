import React from 'react';
import { Sparkles, Download } from 'lucide-react';

interface NavbarProps {
  onOpenAiAssistant: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAiAssistant,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/60 bg-stone-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        {/* Zone 1: Artist Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-stone-100 hover:text-amber-300 transition-colors whitespace-nowrap">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 text-xs font-mono font-bold text-amber-300 border border-amber-500/20">
              M
            </span>
            <span>dejota2021 · MUTE</span>
          </a>
          <span className="hidden text-stone-600 text-xs sm:inline" aria-hidden="true">/</span>
          <span className="hidden text-xs text-stone-400 font-sans sm:inline font-normal">
            Estrategia de 30 Días
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean, comfortable, unboxed) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-400">
          <a href="#calendario" className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0">
            Calendario
          </a>
          <a href="#formula" className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0">
            Fórmula Orgánica
          </a>
          <a href="#vault" className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0">
            Material de Apoyo
          </a>
        </nav>

        {/* Zone 3: Primary Actions & Studio Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Asistente de guiones y comunicación con Gemini IA"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Estudio IA</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-300 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Exportar plan de 30 días para tu manager o copias de seguridad"
          >
            <Download className="h-3.5 w-3.5 text-stone-400" />
            <span className="hidden sm:inline">Exportar Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
