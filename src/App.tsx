import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_30_DAYS, DayStrategy } from './data/strategyData';
import { InteractiveCalendar } from './components/InteractiveCalendar';
import { BRollVaultSection } from './components/BRollVaultSection';
import { DayDetailModal } from './components/DayDetailModal';
import { CreationFormulaSection } from './components/CreationFormulaSection';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { ExportModal } from './components/ExportModal';
import { FirebaseModal } from './components/FirebaseModal';
import {
  syncDayToFirestore,
  syncAllDaysToFirestore,
  subscribeToFirestoreDays,
  getStoredFirebaseConfig,
  initFirebase,
  testFirestoreConnection,
  setOnSyncError,
  FOOLPROOF_FIRESTORE_RULES
} from './firebase';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Database
} from 'lucide-react';

const STORAGE_KEY = 'mute_strategy_days_v1';

export default function App() {
  const [days, setDays] = useState<DayStrategy[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 30) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return INITIAL_30_DAYS;
  });

  const [selectedDay, setSelectedDay] = useState<DayStrategy | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPreselectedDay, setAiPreselectedDay] = useState<DayStrategy | null>(null);
  const [aiInitialNote, setAiInitialNote] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'connected' | 'syncing' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep a ref to latest days to prevent stale closures during initial Firestore seed
  const daysRef = useRef<DayStrategy[]>(days);
  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  // Sync to localStorage as local fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [days]);

  // Handle global write errors from Firestore (e.g. permission-denied)
  useEffect(() => {
    setOnSyncError((err: any) => {
      console.error('[App] Error de escritura capturado:', err);
      const code = err?.code || '';
      if (code.includes('permission-denied') || String(err).includes('permission')) {
        setSyncStatus('error');
        setErrorMessage(
          'Permiso denegado por las Reglas de Firebase Firestore en el proyecto planmute. Debes permitir lectura/escritura en la consola.'
        );
      } else {
        setSyncStatus('error');
        setErrorMessage(err?.message || 'Error al sincronizar con Firebase.');
      }
    });

    return () => setOnSyncError(null);
  }, []);

  // 1. Initial check on mount: Initialize Firebase with built-in or stored config
  useEffect(() => {
    console.log('[App] Inicializando Firebase planmute...');
    const config = getStoredFirebaseConfig();
    const init = initFirebase(config);
    if (init) {
      console.log('[App] Firebase inicializado con éxito. Conectado a:', config.projectId);
      setIsFirebaseConnected(true);
      setSyncStatus('connected');
    } else {
      console.error('[App] Falló la inicialización de Firebase.');
      setSyncStatus('error');
      setErrorMessage('No se pudo inicializar la conexión con el proyecto Firebase planmute.');
    }
  }, []);

  // 2. Handle Firebase real-time subscription
  useEffect(() => {
    if (!isFirebaseConnected) return;

    setSyncStatus('connecting');
    console.log('[App] Activando listener en tiempo real de Firestore...');

    const unsubscribe = subscribeToFirestoreDays(
      (remoteUpdates, count) => {
        console.log(`[App] Actualización recibida de Firestore. Documentos encontrados: ${count}`);
        setSyncStatus('connected');
        setErrorMessage(null); // Clear errors once data flows

        if (count > 0) {
          // Firestore has data: sync remote changes to local state
          setDays((prev) =>
            prev.map((d) => {
              const remote = remoteUpdates[d.id];
              if (remote) {
                return {
                  ...d,
                  isRecorded: remote.isRecorded,
                  isReviewed: remote.isReviewed ?? false,
                  isPublished: remote.isPublished,
                  notes: remote.notes,
                };
              }
              return d;
            })
          );
        } else {
          // If Firestore is empty (first time connecting), seed current days to initialize database
          const hasAnyLocalProgress = daysRef.current.some(
            (d) => d.isRecorded || d.isPublished || (d.notes && d.notes.trim())
          );
          if (hasAnyLocalProgress) {
            console.log('[App] Colección vacía en Firestore. Sembrando progreso local a planmute...');
            syncAllDaysToFirestore(daysRef.current);
          }
        }
      },
      (error: any) => {
        console.error('[App] Error en listener de Firestore:', error);
        setSyncStatus('error');
        const code = error?.code || '';
        if (code.includes('permission-denied') || String(error).includes('permission')) {
          setErrorMessage(
            'Tu base de datos Firebase "planmute" está bloqueando el acceso debido a las Reglas de Seguridad de Firestore.'
          );
        } else {
          setErrorMessage(error?.message || 'Error de conexión con Firestore en tiempo real.');
        }
      }
    );

    return () => {
      if (unsubscribe) {
        console.log('[App] Desuscribiendo listener de Firestore');
        unsubscribe();
      }
    };
  }, [isFirebaseConnected]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FOOLPROOF_FIRESTORE_RULES);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    const res = await testFirestoreConnection();
    setIsTestingConnection(false);
    setTestResult(res);
    if (res.success) {
      setSyncStatus('connected');
      setErrorMessage(null);
      showToast('¡Conexión verificada exitosamente!');
    } else {
      setSyncStatus('error');
      setErrorMessage(res.message);
    }
  };

  // Immediate synchronous handling of "Grabado"
  const handleToggleRecorded = (dayId: number) => {
    const current = daysRef.current.find((d) => d.id === dayId);
    if (!current) return;
    const nextState = !current.isRecorded;
    const updatedDay: DayStrategy = { ...current, isRecorded: nextState };

    setDays((prev) => prev.map((d) => (d.id === dayId ? updatedDay : d)));
    showToast(nextState ? `Día ${updatedDay.day} marcado como Grabado ✓` : `Día ${updatedDay.day} desmarcado de Grabado`);

    // Synchronous immediate push to Firestore
    syncDayToFirestore(updatedDay);

    if (selectedDay && selectedDay.id === dayId) {
      setSelectedDay((prev) => (prev ? { ...prev, isRecorded: nextState } : null));
    }
  };

  // Immediate synchronous handling of "Revisado"
  const handleToggleReviewed = (dayId: number) => {
    const current = daysRef.current.find((d) => d.id === dayId);
    if (!current) return;
    const nextState = !current.isReviewed;
    const updatedDay: DayStrategy = { ...current, isReviewed: nextState };

    setDays((prev) => prev.map((d) => (d.id === dayId ? updatedDay : d)));
    showToast(nextState ? `Día ${updatedDay.day} marcado como Revisado ✓` : `Día ${updatedDay.day} desmarcado de Revisado`);

    // Synchronous immediate push to Firestore
    syncDayToFirestore(updatedDay);

    if (selectedDay && selectedDay.id === dayId) {
      setSelectedDay((prev) => (prev ? { ...prev, isReviewed: nextState } : null));
    }
  };

  // Immediate synchronous handling of "Publicado"
  const handleTogglePublished = (dayId: number) => {
    const current = daysRef.current.find((d) => d.id === dayId);
    if (!current) return;
    const nextState = !current.isPublished;
    const updatedDay: DayStrategy = { ...current, isPublished: nextState };

    setDays((prev) => prev.map((d) => (d.id === dayId ? updatedDay : d)));
    showToast(nextState ? `Día ${updatedDay.day} marcado como Publicado en Redes ✓` : `Día ${updatedDay.day} desmarcado de Publicado`);

    // Synchronous immediate push to Firestore
    syncDayToFirestore(updatedDay);

    if (selectedDay && selectedDay.id === dayId) {
      setSelectedDay((prev) => (prev ? { ...prev, isPublished: nextState } : null));
    }
  };

  // Immediate synchronous handling of Notes
  const handleUpdateNotes = (dayId: number, notes: string) => {
    const current = daysRef.current.find((d) => d.id === dayId);
    if (!current) return;
    const updatedDay: DayStrategy = { ...current, notes };

    setDays((prev) => prev.map((d) => (d.id === dayId ? updatedDay : d)));

    // Synchronous immediate push to Firestore
    syncDayToFirestore(updatedDay);

    if (selectedDay && selectedDay.id === dayId) {
      setSelectedDay((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleOpenAiForDay = (day: DayStrategy, notes?: string) => {
    setAiPreselectedDay(day);
    setAiInitialNote(notes || day.notes || '');
    setIsAiModalOpen(true);
  };

  const handleImportDays = (newDays: DayStrategy[]) => {
    setDays(newDays);
    syncAllDaysToFirestore(newDays);
    showToast('¡Estrategia y notas restauradas con éxito!');
  };

  return (
    <div className="min-h-screen bg-[#121110] text-stone-200 flex flex-col font-sans selection:bg-amber-500/25 selection:text-amber-200 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-stone-900/95 border border-amber-600/50 text-xs font-medium text-amber-300 shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Critical Diagnostics Banner for Firebase Rules (Hidden as requested: 'ocultar componente seleccionado textos') */}
      {syncStatus === 'error' && (
        <div className="hidden sticky top-0 z-50 bg-rose-950/95 border-b border-rose-800 text-rose-200 px-4 py-3 sm:px-6 shadow-2xl backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-100">
                  ⚠️ Atención: La base de datos "planmute" está bloqueando la sincronización en tiempo real.
                </p>
                <p className="text-rose-300/90 mt-0.5">
                  {errorMessage || 'Tus Reglas de Seguridad en Firebase Console no permiten lectura o escritura.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={handleCopyRules}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-700 text-rose-100 font-medium cursor-pointer transition-colors"
                title="Copiar regla permisiva para pegar en Firebase Console"
              >
                {copiedRules ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedRules ? '¡Regla Copiada!' : 'Copiar Regla Necesaria'}</span>
              </button>

              <a
                href="https://console.firebase.google.com/project/planmute/firestore/rules"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-medium cursor-pointer transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Abrir Reglas en Firebase</span>
              </a>

              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                <span>{isTestingConnection ? 'Comprobando...' : 'Probar Ahora'}</span>
              </button>
            </div>
          </div>

          {/* Test feedback inline */}
          {testResult && (
            <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-rose-800/60 text-[11px]">
              <span className={testResult.success ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                Resultado de prueba: {testResult.message}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Subtle Live Connection Indicator (only when fully connected) */}
      {syncStatus === 'connected' && (
        <div className="w-full bg-stone-950/70 border-b border-stone-800/40 px-4 py-1.5 text-[11px] text-stone-400 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-stone-300 font-medium">Sincronización en tiempo real activa</span>
              <span className="text-stone-500 font-mono text-[10px] hidden sm:inline">(Firebase: planmute)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="text-[10px] text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Comprobar comunicación de base de datos"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                <span>{isTestingConnection ? 'Verificando...' : 'Verificar estado'}</span>
              </button>
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="text-[10px] text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Database className="h-2.5 w-2.5" />
                <span>Configuración</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport: Starts DIRECTLY at the B-Roll & Archivo Vault, then Live Tracking & 30-Day Calendar */}
      <main className="flex-1 space-y-6 pt-2 sm:pt-4">
        {/* B-Roll & Archivo Vault: Álbum "MUTE DOC" (Positioned at the start of the app) */}
        <BRollVaultSection />

        {/* 30-Day Interactive Calendar (Includes the prominent Seguimiento en Vivo Tracker) */}
        <InteractiveCalendar
          days={days}
          onToggleRecorded={handleToggleRecorded}
          onToggleReviewed={handleToggleReviewed}
          onTogglePublished={handleTogglePublished}
          onUpdateNotes={handleUpdateNotes}
          onSelectDay={(day) => setSelectedDay(day)}
          onQuickAiRefine={(day) => handleOpenAiForDay(day)}
        />

        {/* Creation Formula & B-Roll Vault Checklist */}
        <CreationFormulaSection />
      </main>

      {/* Day Detail & Teleprompter Modal */}
      <DayDetailModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onToggleRecorded={handleToggleRecorded}
        onToggleReviewed={handleToggleReviewed}
        onTogglePublished={handleTogglePublished}
        onUpdateNotes={handleUpdateNotes}
        onRefineWithAi={(day, notes) => handleOpenAiForDay(day, notes)}
      />

      {/* Gemini AI Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        preselectedDay={aiPreselectedDay}
        initialNote={aiInitialNote}
      />

      {/* Export / Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        days={days}
        onImportDays={handleImportDays}
      />

      {/* Firebase Configuration & Rules Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        days={days}
        onConfigUpdated={(connected) => setIsFirebaseConnected(connected)}
      />
    </div>
  );
}
