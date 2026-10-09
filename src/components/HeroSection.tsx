import React from 'react';
import { Calendar, Sparkles, Volume2, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenAiAssistant: () => void;
  onScrollToCalendar: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenAiAssistant,
  onScrollToCalendar,
}) => {
  return (
    <section className="relative border-b border-stone-900 bg-stone-950 overflow-hidden">
      {/* Background Hero Banner Scrim */}
      <div className="absolute inset-0 opacity-20 mix-blend-luminosity pointer-events-none">
        <img
          src="/src/assets/images/mute_album_hero_1791505647843.jpg"
          alt="dejota2021 grabando MUTE en el estudio"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Context, Narrative Pitch, and Mission */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <span className="text-amber-400 font-semibold">ESTRATEGIA DE LANZAMIENTO 2026</span>
              <span aria-hidden="true">·</span>
              <span>ÁLBUM MUTE</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500">dejota2021</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-100 leading-tight text-balance">
              Sonidos nacidos en el silencio. 
              <span className="block text-stone-400 font-normal text-2xl sm:text-3xl lg:text-4xl mt-1">
                La narrativa de 30 días para tocar emociones reales.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              En 2023 defendiste la fiesta de <strong className="text-amber-300 font-medium">FRUTAS</strong> mientras enfrentabas tu peor momento: sin adelanto, sin dinero, sin familia cerca y con la culpa del accidente de tu pareja. De ese quiebre nació <em className="text-white">Alejarme</em> y en 2025 construiste con tu nuevo manager una obra que merece todo el contexto. Aquí tienes la estructura diaria para contar tu verdad con vulnerabilidad radical y cero poses.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToCalendar}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Ver Calendario de 30 Días</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenAiAssistant}
                className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-300 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Generar / Adaptar Guión con IA</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Contrast Card (FRUTAS 2023 vs MUTE 2026) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-5 sm:p-6 backdrop-blur-md shadow-xl shadow-black/40">
              <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/70">
                <span className="text-xs font-mono text-stone-400 uppercase tracking-wider font-medium">
                  El Contraste de tu Historia
                </span>
                <span className="text-xs text-amber-300 font-medium">
                  FRUTAS ➔ MUTE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* 2023 Card */}
                <div className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-800 group shadow-md">
                    <img
                      src="/src/assets/images/frutas_album_art_1791505667628.jpg"
                      alt="Álbum FRUTAS 2023"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-stone-950/85 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-300">
                      2023 · FRUTAS
                    </div>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-stone-200">La Máscara</p>
                    <p className="text-stone-400 text-[11px] leading-relaxed">
                      Color y fiesta por fuera; quiebra, soledad y hospital por dentro.
                    </p>
                  </div>
                </div>

                {/* 2026 Card */}
                <div className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-800 group shadow-md">
                    <img
                      src="/src/assets/images/mute_cover_art_1791505657830.jpg"
                      alt="Álbum MUTE 2026"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-stone-950/85 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-300">
                      2026 · MUTE
                    </div>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-stone-200">La Verdad</p>
                    <p className="text-stone-400 text-[11px] leading-relaxed">
                      Silencio, guitarras íntimas, sanación y paz sin poses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/70 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                  Canción ancla: <strong className="text-stone-200 font-medium">Alejarme</strong>
                </span>
                <span className="text-[11px] text-stone-400">30 días continuos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
