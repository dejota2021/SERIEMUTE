import React, { useState, useEffect, useMemo } from 'react';
import { B_ROLL_VAULT_CHECKLIST, BRollVaultItem } from '../data/strategyData';
import {
  subscribeToFirestoreVault,
  syncVaultToFirestore,
  VaultSyncPayload,
} from '../firebase';
import {
  FolderArchive,
  CheckSquare,
  Square,
  Sparkles,
  Video,
  Camera,
  Mic,
  FileText,
  Smartphone,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Cloud,
  Layers,
  Info
} from 'lucide-react';

const STORAGE_VAULT_CHECKED = 'mute_broll_checklist';
const STORAGE_CUSTOM_VAULT = 'mute_broll_custom_items';

interface CustomItem {
  id: string;
  category: string;
  name: string;
  tip: string;
  format: 'Video' | 'Foto' | 'Audio' | 'Documento' | 'Pantalla';
  shotAngle?: string;
}

export const BRollVaultSection: React.FC = () => {
  // 1. Initial State from localStorage for instant 0ms render
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VAULT_CHECKED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customItems, setCustomItems] = useState<CustomItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_VAULT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [copiedList, setCopiedList] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Form for custom item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('2026: MUTE Presente');
  const [newItemTip, setNewItemTip] = useState('');
  const [newItemFormat, setNewItemFormat] = useState<'Video' | 'Foto' | 'Audio' | 'Documento' | 'Pantalla'>('Video');
  const [newItemShot, setNewItemShot] = useState('');

  // 2. Real-time Firebase Firestore Subscription
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreVault((remotePayload: VaultSyncPayload) => {
      if (remotePayload.vaultChecked) {
        setCheckedItems(remotePayload.vaultChecked);
        try {
          localStorage.setItem(STORAGE_VAULT_CHECKED, JSON.stringify(remotePayload.vaultChecked));
        } catch (e) {
          // ignore
        }
      }

      if (remotePayload.customItems && Array.isArray(remotePayload.customItems)) {
        const formattedCustom = remotePayload.customItems as CustomItem[];
        setCustomItems(formattedCustom);
        try {
          localStorage.setItem(STORAGE_CUSTOM_VAULT, JSON.stringify(formattedCustom));
        } catch (e) {
          // ignore
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Synchronize update to Firestore & local storage
  const persistChanges = (updatedChecked: Record<string, boolean>, updatedCustom: CustomItem[]) => {
    setCheckedItems(updatedChecked);
    setCustomItems(updatedCustom);

    try {
      localStorage.setItem(STORAGE_VAULT_CHECKED, JSON.stringify(updatedChecked));
      localStorage.setItem(STORAGE_CUSTOM_VAULT, JSON.stringify(updatedCustom));
    } catch {
      // ignore
    }

    syncVaultToFirestore({
      vaultChecked: updatedChecked,
      customItems: updatedCustom,
    }).then((success) => {
      if (success) {
        setSyncNotice('Sincronizado');
        setTimeout(() => setSyncNotice(null), 1800);
      }
    });
  };

  // Toggle item status
  const handleToggle = (id: string) => {
    const updated = {
      ...checkedItems,
      [id]: !checkedItems[id],
    };
    persistChanges(updated, customItems);
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: CustomItem = {
      id: `custom-vault-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      tip: newItemTip.trim() || 'Recurso adicional para documental MUTE.',
      format: newItemFormat,
      shotAngle: newItemShot.trim() || undefined,
    };

    const updatedCustom = [...customItems, newItem];
    persistChanges(checkedItems, updatedCustom);

    // Reset form
    setNewItemName('');
    setNewItemTip('');
    setNewItemShot('');
    setIsAddingItem(false);
  };

  // Remove custom item
  const handleDeleteCustomItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCustom = customItems.filter((i) => i.id !== id);
    const updatedChecked = { ...checkedItems };
    delete updatedChecked[id];
    persistChanges(updatedChecked, updatedCustom);
  };

  // Combined item list
  const allVaultItems = useMemo(() => {
    return [
      ...B_ROLL_VAULT_CHECKLIST,
      ...customItems.map((c) => ({
        ...c,
        priority: 'Recomendado' as const,
        phaseRef: 'Personalizado',
      })),
    ];
  }, [customItems]);

  // Statistics
  const totalItems = allVaultItems.length;
  const completedCount = allVaultItems.filter((item) => !!checkedItems[item.id]).length;
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Format counters
  const formatCounts = useMemo(() => {
    const counts: Record<string, number> = { Video: 0, Foto: 0, Audio: 0, Documento: 0, Pantalla: 0 };
    allVaultItems.forEach((i) => {
      if (counts[i.format] !== undefined) counts[i.format]++;
    });
    return counts;
  }, [allVaultItems]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    allVaultItems.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [allVaultItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allVaultItems.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedFormat !== 'all' && item.format !== selectedFormat) return false;

      const isChecked = !!checkedItems[item.id];
      if (statusFilter === 'pending' && isChecked) return false;
      if (statusFilter === 'completed' && !isChecked) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesTip = item.tip.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesShot = item.shotAngle?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesTip && !matchesCategory && !matchesShot) return false;
      }

      return true;
    });
  }, [allVaultItems, selectedCategory, selectedFormat, statusFilter, searchQuery, checkedItems]);

  // Copy whole checklist formatted for Notes / WhatsApp
  const handleCopyChecklist = () => {
    let text = `📁 B-Roll & Archivo Vault: Álbum "MUTE DOC" (dejota2021)\n`;
    text += `Progreso: ${completedCount}/${totalItems} (${percentage}% completado)\n\n`;

    categories.forEach((cat) => {
      const itemsInCat = allVaultItems.filter((i) => i.category === cat);
      if (itemsInCat.length > 0) {
        text += `== ${cat.toUpperCase()} ==\n`;
        itemsInCat.forEach((item) => {
          const mark = checkedItems[item.id] ? '[✓]' : '[ ]';
          text += `${mark} [${item.format}] ${item.name}\n   💡 Tip: ${item.tip}\n`;
          if (item.shotAngle) {
            text += `   📐 Ángulo: ${item.shotAngle}\n`;
          }
        });
        text += '\n';
      }
    });

    navigator.clipboard.writeText(text);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2500);
  };

  // Render Format Icon
  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'Video':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Video className="h-2.5 w-2.5" /> Video
          </span>
        );
      case 'Foto':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
            <Camera className="h-2.5 w-2.5" /> Foto
          </span>
        );
      case 'Audio':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <Mic className="h-2.5 w-2.5" /> Audio
          </span>
        );
      case 'Documento':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <FileText className="h-2.5 w-2.5" /> Documento
          </span>
        );
      case 'Pantalla':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Smartphone className="h-2.5 w-2.5" /> Pantalla
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="vault" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="rounded-2xl border border-amber-900/30 bg-gradient-to-b from-[#1c1917]/95 to-[#121110]/95 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Top Header Banner */}
        <div className="p-4 sm:p-6 border-b border-stone-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <FolderArchive className="h-4 w-4" />
                <span className="font-semibold tracking-wider uppercase">ÁLBUM DE CARRETE EN TU TELÉFONO</span>
                <span className="text-stone-600">·</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <Cloud className="h-3 w-3" />
                  Sincronizado en tiempo real (planmute)
                </span>
                {syncNotice && (
                  <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded text-[10px] animate-pulse">
                    {syncNotice}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>B-Roll & Archivo Vault: Álbum &quot;MUTE DOC&quot;</span>
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
                Crea un álbum llamado <strong>&quot;MUTE DOC&quot;</strong> en tu galería o Google Fotos con estos recursos listos. Al momento de grabar y editar tus 30 videos diarios, no perderás tiempo buscando archivos: todo tu archivo de contraste visual estará al alcance de un tap.
              </p>
            </div>

            {/* Quick Actions & Counter Box */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              {/* Progress counter */}
              <div className="px-3.5 py-2 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-3 shadow-inner">
                <div>
                  <div className="text-[10px] font-mono text-stone-400 uppercase">Progreso</div>
                  <div className="text-sm font-bold text-stone-100 flex items-baseline gap-1">
                    <span className="text-emerald-400 tabular-nums text-base">{completedCount}</span>
                    <span className="text-stone-500">/</span>
                    <span className="tabular-nums">{totalItems}</span>
                    <span className="text-xs font-mono text-amber-400 ml-1">({percentage}%)</span>
                  </div>
                </div>

                <div className="w-16 h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Copy List */}
              <button
                onClick={handleCopyChecklist}
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded-xl text-xs font-medium text-stone-200 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Copiar lista de archivos para Notas o WhatsApp"
              >
                {copiedList ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-amber-400" />}
                <span>{copiedList ? '¡Copiada!' : 'Copiar para el cel'}</span>
              </button>

              {/* Add Custom Item Button */}
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Nuevo recurso</span>
              </button>

              {/* Toggle Collapse */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                title={isCollapsed ? 'Desplegar todos los recursos' : 'Minimizar sección'}
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Quick Format Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-800/60 text-xs">
            <span className="text-stone-400 font-mono text-[11px]">Recursos por formato:</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-[11px] text-amber-300 font-mono">
              🎬 {formatCounts.Video} Videos
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-[11px] text-sky-300 font-mono">
              📸 {formatCounts.Foto} Fotos
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-[11px] text-rose-300 font-mono">
              🎙️ {formatCounts.Audio} Audios / Foley
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-[11px] text-emerald-300 font-mono">
              📄 {formatCounts.Documento} Documentos
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-[11px] text-purple-300 font-mono">
              📱 {formatCounts.Pantalla} Pantallas
            </span>
          </div>
        </div>

        {/* Content Body (Collapsible) */}
        {!isCollapsed && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Modal / inline form to add custom item */}
            {isAddingItem && (
              <form
                onSubmit={handleAddCustomItem}
                className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-neutral-950/90 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Agregar Recurso Personalizado al Vault</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="text-xs text-stone-400 hover:text-stone-200"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-mono text-stone-300">Nombre del archivo o recurso</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Ej: Foto vieja del primer sintetizador en Medellín"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-stone-300">Formato</label>
                    <select
                      value={newItemFormat}
                      onChange={(e) => setNewItemFormat(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Video">Video</option>
                      <option value="Foto">Foto</option>
                      <option value="Audio">Audio</option>
                      <option value="Documento">Documento</option>
                      <option value="Pantalla">Pantalla</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-stone-300">Categoría</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="FRUTAS 2023 (El Pasado Ruidoso)">FRUTAS 2023</option>
                      <option value="El Quiebre & El Accidente">El Quiebre & El Accidente</option>
                      <option value="2025: La Reconstrucción">2025: La Reconstrucción</option>
                      <option value="2026: MUTE Presente">2026: MUTE Presente</option>
                      <option value="Recursos de Audio & Foley">Recursos de Audio & Foley</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-stone-300">Consejo / Tip de uso en el video</label>
                    <input
                      type="text"
                      value={newItemTip}
                      onChange={(e) => setNewItemTip(e.target.value)}
                      placeholder="Ej: Usar en los primeros 3 segundos para romper el patrón..."
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-stone-300">Ángulo o Encuadre Sugerido</label>
                    <input
                      type="text"
                      value={newItemShot}
                      onChange={(e) => setNewItemShot(e.target.value)}
                      placeholder="Ej: Plano detalle cenital con luz cálida"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                  >
                    Guardar y Sincronizar en Todos los Dispositivos
                  </button>
                </div>
              </form>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-3 border-b border-stone-800">
              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  Todos ({allVaultItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {cat.replace(' (El Pasado Ruidoso)', '')}
                  </button>
                ))}
              </div>

              {/* Right filters: Search + Status */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-52">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar archivo o plano..."
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-900/90 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Estado: Todos</option>
                  <option value="pending">Solo Pendientes</option>
                  <option value="completed">Solo Listos</option>
                </select>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isChecked = !!checkedItems[item.id];
                const isCustom = item.id.startsWith('custom-vault');

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group select-none ${
                      isChecked
                        ? 'border-emerald-600/40 bg-emerald-950/20 shadow-sm'
                        : 'border-stone-800/80 bg-stone-900/50 hover:border-stone-700 hover:bg-stone-900/80'
                    }`}
                  >
                    {/* Top row: Checkbox, Badge & Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 text-stone-400">
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-400 transition-transform scale-110" />
                          ) : (
                            <Square className="h-4 w-4 text-stone-500 group-hover:text-stone-300 transition-colors" />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                            {item.category}
                          </span>
                          <h4
                            className={`text-xs font-bold leading-snug transition-colors ${
                              isChecked ? 'text-stone-400 line-through' : 'text-stone-100 group-hover:text-amber-200'
                            }`}
                          >
                            {item.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {getFormatBadge(item.format)}

                        {isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomItem(item.id, e)}
                            className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                            title="Eliminar recurso personalizado"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle details: Tip & Camera Angle */}
                    <div className="space-y-1.5 text-[11px] bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/60">
                      <p className="text-stone-300 leading-relaxed">
                        <strong className="text-amber-400/90 font-medium">💡 Tip de grabación: </strong>
                        {item.tip}
                      </p>

                      {item.shotAngle && (
                        <p className="text-stone-400 font-mono text-[10px] pt-1 border-t border-stone-800/50 flex items-center gap-1">
                          <span className="text-stone-500">📐 Encuadre:</span>
                          <span className="text-stone-300">{item.shotAngle}</span>
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        {item.priority === 'Imprescindible' ? (
                          <span className="text-amber-400 font-semibold">★ Imprescindible</span>
                        ) : (
                          <span>Recomendado</span>
                        )}
                      </span>
                      <span>{item.phaseRef || 'MUTE DOC'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-stone-400 text-xs bg-stone-950/40 rounded-xl border border-stone-800/60">
                No se encontraron recursos con los filtros seleccionados.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
