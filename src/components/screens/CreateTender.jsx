import React from 'react';
import { Upload, X } from 'lucide-react';

export function CreateTender({
  onNavigate,
  createForm,
  setCreateForm,
  createAndPublishTender,
  loading,
  selectedFile,
  ipfsCID,
  uploadingFile,
  uploadProgress,
  handleFileSelect,
  removeFile,
  isMember,
  account,
}) {
  if (!account) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <p className="text-gray-600 dark:text-gray-400">Pripojte peňaženku pre vytvorenie tendra.</p>
      </div>
    );
  }
  if (!isMember) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <p className="text-red-600 dark:text-red-400">Iba členovia rady môžu vytvárať tendery.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Nový tender</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vyplňte údaje a odošlite — tender sa vytvorí a hneď uverejní (dve transakcie v MetaMask).
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Názov tenderu *</label>
          <input
            type="text"
            required
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Napr. Tlač diplomov"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popis</label>
          <textarea
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Podrobný popis tenderu..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rozpočet (€) *</label>
            <input
              type="text"
              required
              value={createForm.budget}
              onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategória *</label>
            <select
              required
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tlac" className="dark:bg-gray-700">🖨️ Tlač</option>
              <option value="jedlo" className="dark:bg-gray-700">🍴 Jedlo</option>
              <option value="IT" className="dark:bg-gray-700">💻 IT</option>
              <option value="Kancelárske potreby" className="dark:bg-gray-700">📎 Kancelárske potreby</option>
              <option value="ine" className="dark:bg-gray-700">📦 Iné</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dokument (IPFS, voliteľné)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Upload size={24} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {uploadingFile ? `Nahrávanie... ${uploadProgress}%` : 'Kliknite alebo pretiahnite súbor (PDF, DOC, DOCX)'}
            </span>
          </label>
          {selectedFile && (
            <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{selectedFile.name}</span>
              <button type="button" onClick={removeFile} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dni na ponuky *</label>
            <input
              type="number"
              min={3}
              max={14}
              value={createForm.daysOpen}
              onChange={(e) => setCreateForm({ ...createForm, daysOpen: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Povolený rozsah: 3–14 dní (uzávierka na podanie ponúk).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dni na hlasovanie (neskôr pri spustení)</label>
            <input
              type="number"
              min={3}
              max={14}
              value={createForm.votingDays}
              onChange={(e) => setCreateForm({ ...createForm, votingDays: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Povolený rozsah: 3–14 dní. Použije sa pri spustení hlasovania na detaile tendra.</p>
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={createAndPublishTender}
            disabled={loading || !createForm.title || !createForm.budget || !createForm.category}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Spracovávam...' : 'Vytvoriť a uverejniť tender'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('Dashboard')}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
          >
            Zrušiť
          </button>
        </div>
      </div>
    </div>
  );
}
