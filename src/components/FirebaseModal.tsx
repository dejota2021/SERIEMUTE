import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  FirebaseConfig,
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  initFirebase,
  syncAllDaysToFirestore,
  FOOLPROOF_FIRESTORE_RULES,
  DEFAULT_FIREBASE_CONFIG
} from '../firebase';
import { DayStrategy } from '../data/strategyData';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayStrategy[];
  onConfigUpdated: (connected: boolean) => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  days,
  onConfigUpdated,
}) => {
  if (!isOpen) return null;

  const [configInput, setConfigInput] = useState('');
  const [currentConfig, setCurrentConfig] = useState<FirebaseConfig | null>(getStoredFirebaseConfig());
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const existing = getStoredFirebaseConfig();
    setCurrentConfig(existing);
    if (existing) {
      setConfigInput(JSON.stringify(existing, null, 2));
    }
  }, [isOpen]);

  const firestoreRulesSnippet = FOOLPROOF_FIRESTORE_RULES;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSnippet);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleSaveAndConnect = async () => {
    setStatusMsg(null);
    setIsSyncing(true);

    try {
      let parsed: any;
      // Handle JS object paste like apiKey: "..." or JSON
      const cleaned = configInput
        .replace(/const firebaseConfig =/, '')
        .replace(/let firebaseConfig =/, '')
        .replace(/var firebaseConfig =/, '')
        .replace(/;/g, '')
        .trim();

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Evaluate simple object syntax safely
        // eslint-disable-next-line no-eval
        const fn = new Function(`return (${cleaned})`);
        parsed = fn();
      }

      if (!parsed || !parsed.projectId) {
        throw new Error('La configuración debe incluir al menos "projectId".');
      }

      const newConfig: FirebaseConfig = {
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket,
        messagingSenderId: parsed.messagingSenderId,
        appId: parsed.appId,
        measurementId: parsed.measurementId,
      };

      saveFirebaseConfig(newConfig);
      setCurrentConfig(newConfig);

      const initResult = initFirebase(newConfig);
      if (!initResult) {
        throw new Error('No se pudo inicializar Firebase con estos parámetros.');
      }

      // Sync current 30 days to Firestore
      const syncOk = await syncAllDaysToFirestore(days);
      if (syncOk) {
        setStatusMsg({
          type: 'success',
          text: `¡Conexión exitosa con el proyecto "${newConfig.projectId}"! Se han sincronizado los 30 días y tus notas en Firestore.`,
        });
        onConfigUpdated(true);
      } else {
        setStatusMsg({
          type: 'success',
          text: `Conectado a "${newConfig.projectId}". Revisa las reglas en Firebase si deseas habilitar escritura inmediata.`,
        });
        onConfigUpdated(true);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: `Error de configuración: ${err?.message || 'Verifica el formato del objeto de credenciales'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('¿Desconectar Firebase y volver al almacenamiento local de este navegador?')) {
      clearFirebaseConfig();
      setCurrentConfig(null);
      setConfigInput('');
      setStatusMsg(null);
      onConfigUpdated(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-950 text-stone-100 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4 bg-stone-900/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-500/20">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Conexión Firebase Firestore
              </h3>
              <p className="text-xs text-stone-400">
                Guarda tus avances, checks de grabación y notas en la nube de forma persistente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Active status indicator */}
          {currentConfig ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Check className="h-4 w-4" />
                <span>
                  Conectado a Firestore: <strong>{currentConfig.projectId}</strong>
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Desconectar Firebase"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Desconectar</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300/90 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Actualmente tus datos se guardan en el navegador. Pega tu configuración de Firebase abajo para sincronizar con la nube.
              </span>
            </div>
          )}

          {/* Section 1: Paste Firebase Credentials */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-stone-300 uppercase tracking-wider font-semibold">
              1. Pega aquí tu Objeto de Configuración de Firebase
            </label>
            <p className="text-xs text-stone-400">
              Copia el bloque <code>const firebaseConfig = &#123; ... &#125;;</code> desde la consola de Firebase (Configuración del Proyecto ➔ General ➔ Tus apps ➔ Web):
            </p>
            <textarea
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              rows={6}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "tu-proyecto.firebaseapp.com",\n  "projectId": "tu-proyecto",\n  "storageBucket": "tu-proyecto.appspot.com",\n  "messagingSenderId": "123456789",\n  "appId": "1:123456789:web:abcdef"\n}`}
              className="w-full p-3 text-xs bg-stone-900 border border-stone-800 rounded-xl text-stone-100 font-mono placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
            />

            <button
              onClick={handleSaveAndConnect}
              disabled={isSyncing || !configInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sincronizando con Firestore...</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  <span>Guardar y Sincronizar Cambios Ahora</span>
                </>
              )}
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Section 2: Firestore Security Rules (User Requested) */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-mono text-stone-200 uppercase tracking-wider font-semibold">
                  2. Reglas Requeridas para Firestore
                </span>
              </div>

              <button
                onClick={handleCopyRules}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-300 hover:text-white bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                {copiedRules ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar Reglas</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              En tu <strong>Consola de Firebase ➔ Firestore Database ➔ Pestaña Reglas</strong>, reemplaza todo el contenido por estas líneas y pulsa <strong>Publicar</strong>:
            </p>

            <pre className="p-3 bg-stone-950 rounded-lg border border-stone-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto leading-relaxed">
              {firestoreRulesSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
