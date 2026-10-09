import React from 'react';
import { CREATION_FORMULA_STEPS } from '../data/strategyData';
import {
  ShieldCheck,
  HeartHandshake,
  Eye,
  VolumeX,
  Sparkles
} from 'lucide-react';

export const CreationFormulaSection: React.FC = () => {
  return (
    <section id="formula" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      {/* Title */}
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
          <span>METODOLOGÍA NARRATIVA</span>
          <span aria-hidden="true">·</span>
          <span>AUTENTICIDAD RADICAL & VULNERABILIDAD</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          La Fórmula de Creación Rápida Orgánica
        </h2>
        <p className="text-base text-neutral-300 mt-2 leading-relaxed">
          Para grabar un video diario durante 30 días sin agotarte mentalmente, necesitas un método repetible de 10 minutos. No necesitas cámaras de cine ni edición compleja: tu mayor arma es la verdad incontestable de tu historia.
        </p>
      </div>

      {/* 4 Steps Formula Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {CREATION_FORMULA_STEPS.map((step, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="font-mono text-xs font-bold text-amber-400">
                  PASO 0{idx + 1}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {idx === 0 ? '0 - 3s' : idx === 1 ? '3 - 12s' : idx === 2 ? '12 - 42s' : '42 - 60s'}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white mt-3 leading-snug">
                {step.title}
              </h3>

              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {step.description}
              </p>

              <div className="mt-4 p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-xs">
                <span className="font-mono text-[10px] text-amber-300/80 block uppercase tracking-wider mb-1">
                  Estructura:
                </span>
                <p className="text-neutral-200 text-xs italic">
                  {step.formula}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400">
              <strong className="text-neutral-300 font-medium">Regla de oro: </strong>
              {step.rule}
            </div>
          </div>
        ))}
      </div>

      {/* Principles of Impeccable Communication */}
      <div className="mt-14 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
            Código Deontológico
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Los 5 Pilares de la Comunicación Impecable de dejota2021
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Lo que debes saber para que tu mensaje nunca suene a marketing barato ni a manipulación emocional:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h4>1. Cero Victimización</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              No culpes a la industria ni al destino. Asume que tú ibas al volante, que tomaste malas decisiones financieras y que caíste. La dignidad radica en hacerse cargo del propio desastre.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <HeartHandshake className="h-4 w-4 text-rose-400" />
              <h4>2. Respeto Sagrado a tu Pareja</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              El accidente de tránsito no es morbo para conseguir views. Es el hecho que te despertó. Habla siempre desde el dolor de haberle causado daño y la gratitud por la recuperación y el perdón.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <VolumeX className="h-4 w-4 text-amber-400" />
              <h4>3. Hablar a Un Solo Amigo</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Nunca digas &quot;¡Hola mi gente de TikTok!&quot;. Habla en singular: &quot;Si alguna vez te pasó esto...&quot;, &quot;Quiero contarte algo que nunca dije&quot;. La intimidad es íntima, no multitudinaria.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Eye className="h-4 w-4 text-sky-400" />
              <h4>4. Respetar los Silencios</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Tu álbum se llama MUTE. Si dices algo doloroso, deja 2 segundos de silencio mirando a cámara. El silencio le da tiempo al cerebro del espectador de asimilar el peso de tus palabras.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h4>5. El Mensaje Universal: Estar bien por compromiso</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Tu historia personal con FRUTAS es la metáfora de lo que millones de personas viven todos los días: empleados sonriendo a sus jefes con depresión, madres aparentando fortaleza frente a sus hijos, amigos que no se atreven a admitir que están en la ruina. Tú estás hablando por todos ellos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
