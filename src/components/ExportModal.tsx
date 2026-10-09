import React, { useState } from 'react';
import { DayStrategy } from '../data/strategyData';
import { X, Copy, Check, Download, Upload, Printer, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayStrategy[];
  onImportDays: (newDays: DayStrategy[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  days,
  onImportDays,
}) => {
  if (!isOpen) return null;

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const recordedCount = days.filter((d) => d.isRecorded).length;
  const publishedCount = days.filter((d) => d.isPublished).length;

  const generateMarkdownSummary = () => {
    let md = `# ESTRATEGIA NARRATIVA 30 DÍAS · ÁLBUM MUTE (dejota2021)\n`;
    md += `*Progreso: ${recordedCount}/30 grabados · ${publishedCount}/30 publicados*\n\n`;
    md += `--------------------------------------------------\n\n`;

    days.forEach((d) => {
      const rec = d.isRecorded ? '[X] GRABADO' : '[ ] POR GRABAR';
      const pub = d.isPublished ? '[X] PUBLICADO' : '[ ] POR PUBLICAR';
      md += `### DÍA ${d.day < 10 ? `0${d.day}` : d.day}: ${d.title}\n`;
      md += `* Fase: ${d.phase} (${d.phaseTitle}) | Emoción: ${d.emotion} | Duración: ${d.targetDuration}\n`;
      md += `* Estado: ${rec} | ${pub}\n`;
      md += `* Hook 1: "${d.hookOptions[0]}"\n`;
      md += `* Material Apoyo (Pasado): ${d.pastMaterial}\n`;
      md += `* Material Apoyo (Presente): ${d.presentMaterial}\n`;
      md += `* Guión: ${d.scriptDraft}\n`;
      if (d.notes) {
        md += `* Anotación guardada: ${d.notes}\n`;
      }
      md += `\n--------------------------------------------------\n\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownSummary();
    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(days, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dejota2021_mute_estrategia_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('El formato debe ser una lista de 30 días.');
      }
      onImportDays(parsed);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar el archivo JSON.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900/60 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Exportar & Respaldar Estrategia de 30 Días
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Option 1: Markdown summary for WhatsApp / Notion */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Resumen en Texto / Markdown para tu Manager</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Copia todo el calendario con estados, hooks y notas para compartirlo por chat o pegarlo en Notion.
                </p>
              </div>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shrink-0"
              >
                {copiedType === 'markdown' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Todo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Print or Save as PDF */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Printer className="h-4 w-4 text-sky-400" />
                  <span>Imprimir / Guardar como PDF</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Genera una versión imprimible limpia para tenerla en la pared de tu estudio o tablero.
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors shrink-0"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir Vista</span>
              </button>
            </div>
          </div>

          {/* Option 3: Download JSON Backup */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Descargar Archivo de Respaldo (.JSON)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Guarda tus anotaciones y progresos en un archivo local para no perder nunca nada.
                </p>
              </div>

              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800 rounded-lg transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar Backup</span>
              </button>
            </div>
          </div>

          {/* Option 4: Restore Backup */}
          <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/80 space-y-2">
            <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Restaurar Copia de Seguridad
            </h4>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              rows={2}
              placeholder="Pega aquí el contenido JSON para restaurar tus notas y estados..."
              className="w-full p-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-amber-400"
            />
            {importError && (
              <p className="text-xs text-rose-400 font-mono">{importError}</p>
            )}
            <button
              onClick={handleImportJson}
              disabled={!importJsonText.trim()}
              className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Cargar JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
