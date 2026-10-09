import React, { useState, useEffect } from 'react';
import { CREATION_FORMULA_STEPS, B_ROLL_VAULT_CHECKLIST } from '../data/strategyData';
import {
  subscribeToFirestoreVault,
  syncVaultToFirestore,
  VaultSyncPayload,
} from '../firebase';
import {
  CheckSquare,
  Square,
  ShieldCheck,
  HeartHandshake,
  Eye,
  VolumeX,
  Sparkles,
  FolderArchive,
  ArrowUpRight,
  Cloud
} from 'lucide-react';

export const CreationFormulaSection: React.FC = () => {
  // Synchronized state with Firebase Firestore & localStorage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mute_broll_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Subscribe in real-time to Firestore Vault
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreVault((remotePayload: VaultSyncPayload) => {
      if (remotePayload.vaultChecked) {
        setCheckedItems(remotePayload.vaultChecked);
        try {
          localStorage.setItem('mute_broll_checklist', JSON.stringify(remotePayload.vaultChecked));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const toggleCheck = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    try {
      localStorage.setItem('mute_broll_checklist', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Instant real-time sync with Firebase Firestore
    syncVaultToFirestore({
      vaultChecked: updated,
    });
  };

  const scrollToVault = () => {
    const el = document.getElementById('vault');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalVault = B_ROLL_VAULT_CHECKLIST.length;
  const completedVault = B_ROLL_VAULT_CHECKLIST.filter((i) => !!checkedItems[i.id]).length;

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

      {/* Synchronized Vault Quick View / Link to Top Vault */}
      <div className="mt-14 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <FolderArchive className="h-3.5 w-3.5" />
              <span>CARPETA DE APOYO SINCRONIZADA</span>
              <span className="text-neutral-600">·</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <Cloud className="h-3 w-3" />
                En vivo (planmute)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              B-Roll & Archivo Vault: Álbum &quot;MUTE DOC&quot;
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Este inventario está activo y sincronizado en tiempo real al inicio de la aplicación para acceso inmediato.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono">
              <span className="text-neutral-400">Progreso:</span>
              <span className="text-emerald-400 font-bold tabular-nums">{completedVault}</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-400 tabular-nums">{totalVault}</span>
            </div>

            <button
              onClick={scrollToVault}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <span>Ir al Vault al inicio</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {B_ROLL_VAULT_CHECKLIST.slice(0, 8).map((item) => {
            const isChecked = !!checkedItems[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'border-emerald-800/40 bg-emerald-950/20'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="mt-0.5 text-neutral-400">
                  {isChecked ? (
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Square className="h-4 w-4 text-neutral-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      {item.category}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {item.format}
                    </span>
                  </div>
                  <h4
                    className={`text-xs font-semibold ${
                      isChecked ? 'text-neutral-400 line-through' : 'text-neutral-100'
                    }`}
                  >
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 italic">
                    💡 {item.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
