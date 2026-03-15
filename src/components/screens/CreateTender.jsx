import React from 'react';
import { Upload, X } from 'lucide-react';

export function CreateTender({
  onNavigate,
  createForm,
  setCreateForm,
  createTender,
  publishTender,
  creationStep,
  createdTenderId,
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
        <p className="text-gray-600">Pripojte peňaženku pre vytvorenie tendra.</p>
      </div>
    );
  }
  if (!isMember) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <p className="text-red-600">Iba členovia rady môžu vytvárať tendery.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nový tender</h1>
        <p className="text-gray-600">
          {creationStep === 1 ? 'Vytvorte koncept tendra (krok 1), potom ho uverejníte (krok 2).' : 'Uverejnite tender – otvorí sa pre ponuky.'}
        </p>
      </div>

      {creationStep === 1 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Názov tenderu *</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Napr. Tlač diplomov"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Podrobný popis tenderu..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rozpočet (€) *</label>
              <input
                type="text"
                required
                value={createForm.budget}
                onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategória *</label>
              <select
                required
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tlac">🖨️ Tlač</option>
                <option value="jedlo">🍴 Jedlo</option>
                <option value="IT">💻 IT</option>
                <option value="Kancelárske potreby">📎 Kancelárske potreby</option>
                <option value="ine">📦 Iné</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dokument (IPFS, voliteľné)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Upload size={24} className="text-gray-400" />
              <span className="text-gray-600">
                {uploadingFile ? `Nahrávanie... ${uploadProgress}%` : 'Kliknite alebo pretiahnite súbor (PDF, DOC, DOCX)'}
              </span>
            </label>
            {selectedFile && (
              <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
                <button type="button" onClick={removeFile} className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dni na ponuky (po uverejnení) *</label>
              <input
                type="number"
                min={3}
                max={30}
                value={createForm.daysOpen}
                onChange={(e) => setCreateForm({ ...createForm, daysOpen: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dni na hlasovanie *</label>
              <input
                type="number"
                min={1}
                max={14}
                value={createForm.votingDays}
                onChange={(e) => setCreateForm({ ...createForm, votingDays: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={createTender}
              disabled={loading || !createForm.title || !createForm.budget || !createForm.category}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Vytváram...' : 'Vytvoriť koncept'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('Dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Zrušiť
            </button>
          </div>
        </div>
      )}

      {creationStep === 2 && createdTenderId && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <p className="text-gray-700">
            Koncept tendra <strong>#{createdTenderId}</strong> je vytvorený. Uverejníte ho teraz? Tender bude otvorený pre ponuky na <strong>{createForm.daysOpen}</strong> dní.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={publishTender}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Uverejňujem...' : 'Uverejniť tender'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('Dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Neskôr
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
