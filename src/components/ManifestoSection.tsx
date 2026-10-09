import React from 'react';
import { Volume2, ShieldCheck, Heart, Sparkles, Disc, Music } from 'lucide-react';

export const ManifestoSection: React.FC = () => {
  return (
    <section id="manifiesto" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
          <span>HISTORIA & MANIFIESTO</span>
          <span aria-hidden="true">·</span>
          <span>EL ARTE COMO TESTIMONIO DE RESILIENCIA</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          De la Máscara de FRUTAS al Silencio de MUTE
        </h2>
        <p className="text-base text-neutral-300 mt-2 leading-relaxed">
          El viaje cronológico de dejota2021: por qué este álbum no es solo música, sino el documento vivo de haber sobrevivido al propio naufragio y haber aprendido a no fingir jamás.
        </p>
      </div>

      {/* 4-Year Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {/* 2023 */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
            <span className="font-mono text-sm font-bold text-amber-400">2023</span>
            <span className="text-[11px] font-mono text-amber-300/80">FRUTAS & EL COLAPSO</span>
          </div>
          <h3 className="text-sm font-semibold text-white">La Sonrisa Forzada</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Lanzamiento de un disco brillante y festivo mientras por dentro se agotaba el adelanto, no quedaba dinero para vivir y la familia estaba lejos. La noche del accidente de tránsito y la fractura de su pareja marcaron el punto de no retorno: la imposibilidad moral de seguir fingiendo felicidad.
          </p>
        </div>

        {/* 2024 */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/10 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-900/30">
            <span className="font-mono text-sm font-bold text-rose-400">2024</span>
            <span className="text-[11px] font-mono text-rose-300/80">EL FONDO & 'ALEJARME'</span>
          </div>
          <h3 className="text-sm font-semibold text-white">El Quiebre de la Máscara</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Meses de aislamiento voluntario, cuidar las heridas físicas y del espíritu, asumir la culpa total del accidente y desarmar el personaje de discoteca. Nacimiento de la canción <em>Alejarme</em>: la primera vez que dejota compuso desde la tristeza cruda, sin pensar en números ni tendencias.
          </p>
        </div>

        {/* 2025 */}
        <div className="rounded-xl border border-sky-900/40 bg-sky-950/10 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-900/30">
            <span className="font-mono text-sm font-bold text-sky-400">2025</span>
            <span className="text-[11px] font-mono text-sky-300/80">EL PACTO & EL MANAGER</span>
          </div>
          <h3 className="text-sm font-semibold text-white">La Alianza en el Silencio</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Llegada de un nuevo amigo y project manager que no pidió resultados superficiales, sino honestidad. Nace formalmente el concepto de MUTE: <em>"una colección de sonidos nacidos en el silencio"</em>. Sesiones nocturnas de guitarras de palo, sin autotune robótico y con el respeto de podar lo comercial para dejar lo verdadero.
          </p>
        </div>

        {/* 2026 */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/30">
            <span className="font-mono text-sm font-bold text-emerald-400">2026</span>
            <span className="text-[11px] font-mono text-emerald-300/80">MUTE · EL DESPEGUE</span>
          </div>
          <h3 className="text-sm font-semibold text-white">La Libertad Radical</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            dejota está en un mejor momento de vida, en paz y recuperado, pero entiende que MUTE se merece cada gramo de contexto en redes para conectar con millones de personas que hoy están callando su dolor por compromiso. 30 días de entrega total y honesta antes del lanzamiento.
          </p>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-lg sm:text-xl font-light italic text-neutral-200 leading-relaxed">
            "MUTE no es estar callado por miedo. Es apagar el ruido de las expectativas de los demás para que por fin puedas escuchar tu propia voz."
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-400 pt-2">
            <span>dejota2021</span>
            <span aria-hidden="true">·</span>
            <span>Álbum MUTE (2026)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
