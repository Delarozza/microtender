import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp, ExternalLink, Shield, XCircle, CheckCircle, Award, Trophy, Upload, Send } from 'lucide-react';
import { explorerUrl, shortAddress } from '../../utils/explorer';


export function TenderDetail({
  selectedTender,
  bids,
  loading,
  account,
  isMember,
  isRegisteredVendor,
  contract,
  onBack,
  onStartVoting,
  votingDaysInput,
  setVotingDaysInput,
  onCastVote,
  bidForm,
  setBidForm,
  onSubmitBid,
  getIPFSUrl,
  onCancelTender,
  onFinalizeTender,
  onFulfillTender,
  onUpdateIPFSCID,
  onPublishTender,
}) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});
  const [winningBid, setWinningBid] = useState(null);
  const [newCID, setNewCID] = useState('');
  const [publishDays, setPublishDays] = useState('7');

  useEffect(() => {
    if (!contract || !account || !selectedTender) return;
    let cancelled = false;

    (async () => {
      try {
        const voted = await contract.hasUserVoted(selectedTender.id, account);
        if (!cancelled) setHasVoted(voted);
      } catch (_) {} // eslint-disable-line no-unused-vars

      if (selectedTender.statusIndex === 2 && bids.length > 0) {
        const counts = {};
        for (const bid of bids) {
          try {
            const c = await contract.getVoteCount(selectedTender.id, bid.id);
            counts[bid.id] = c.toNumber ? c.toNumber() : Number(c);
          } catch (_) { // eslint-disable-line no-unused-vars
            counts[bid.id] = 0;
          }
        }
        if (!cancelled) setVoteCounts(counts);
      }

      if (selectedTender.statusIndex >= 3 && selectedTender.statusIndex !== 5) {
        try {
          const w = await contract.getWinningBid(selectedTender.id);
          if (!cancelled && w && Number(w.bidId) > 0) {
            setWinningBid({
              bidId: Number(w.bidId),
              vendor: w.vendor,
              price: parseFloat(window.ethers.utils.formatEther(w.price)),
              votes: Number(w.votes),
            });
          }
        } catch (_) {} // eslint-disable-line no-unused-vars
      }
    })();

    return () => { cancelled = true; };
  }, [contract, account, selectedTender, bids]);

  if (!selectedTender) return null;

  const isCreator = account && selectedTender.creator && account.toLowerCase() === selectedTender.creator.toLowerCase();
  const minBidsForVoting = 3;
  const canStartVoting =
    selectedTender.statusIndex === 1 && bids.length >= minBidsForVoting && isCreator;
  const canVote = selectedTender.statusIndex === 2 && isMember;
  const canSubmitBid = selectedTender.statusIndex === 1 && isRegisteredVendor && !isMember;

  // Lifecycle actions — only for the tender creator
  const canCancel = isCreator && (selectedTender.statusIndex === 0 || selectedTender.statusIndex === 1);
  const canFinalize = isCreator && selectedTender.statusIndex === 2
    && selectedTender.votingDeadline && Number(selectedTender.votingDeadline) > 0
    && Date.now() / 1000 >= Number(selectedTender.votingDeadline);
  const canFulfill = isCreator && selectedTender.statusIndex === 3;
  const isCancelled = selectedTender.statusIndex === 5;
  const isFulfilled = selectedTender.statusIndex === 4;
  const isCompleted = selectedTender.statusIndex === 3;

  return (
    <div className="p-4 md:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-6"
      >
        ← Späť na zoznam
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedTender.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">Kategória: {selectedTender.category}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Vytvoril:</span>
              <a
                href={explorerUrl.address(selectedTender.creator)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-mono"
              >
                {shortAddress(selectedTender.creator)} ↗
              </a>
            </div>
            {selectedTender.description && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedTender.description}</p>
              </div>
            )}
            {selectedTender.ipfsCID && (
              <div className="mt-2">
                <a
                  href={getIPFSUrl ? getIPFSUrl(selectedTender.ipfsCID) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 text-sm"
                >
                  <FileText size={16} />
                  Zobraziť dokument z IPFS
                </a>
              </div>
            )}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedTender.status === 'Aktívny'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : selectedTender.status === 'Hlasovanie'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                : selectedTender.status === 'Ukončený'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                : isFulfilled
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : isCancelled
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isCancelled ? 'Zrušený' : isFulfilled ? 'Splnený' : selectedTender.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Maximálny rozpočet</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedTender.maxBudget.toFixed(2)} €
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Počet ponúk</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bids.length}</p>
          </div>
        </div>

        {/* Publish draft tender */}
        {selectedTender.statusIndex === 0 && isCreator && onPublishTender && (
          <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Send size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-300 font-semibold text-sm">Uverejniť tender</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Tender je v stave Koncept. Po uverejnení bude otvorený pre ponuky dodávateľov. Dni na ponuky: 3–14.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-gray-700 dark:text-gray-300">Počet dní na ponuky:</label>
              <input
                type="number"
                min={3}
                max={14}
                value={publishDays}
                onChange={(e) => setPublishDays(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => onPublishTender(selectedTender.id, publishDays)}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Send size={14} />
                {loading ? 'Uverejňujem...' : 'Uverejniť'}
              </button>
            </div>
          </div>
        )}

        {/* Update IPFS CID — only in Draft state for the creator */}
        {selectedTender.statusIndex === 0 && isCreator && onUpdateIPFSCID && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Upload size={16} className="text-orange-600 dark:text-orange-400" />
              <span className="text-orange-800 dark:text-orange-300 font-medium text-sm">Aktualizovať IPFS dokument</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={newCID}
                onChange={(e) => setNewCID(e.target.value)}
                placeholder="Nový IPFS CID (napr. Qm...)"
                className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={() => { onUpdateIPFSCID(selectedTender.id, newCID); setNewCID(''); }}
                disabled={loading || !newCID.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Ukladám...' : 'Uložiť CID'}
              </button>
            </div>
            {selectedTender.ipfsCID && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Aktuálny CID: <span className="font-mono">{selectedTender.ipfsCID}</span>
              </p>
            )}
          </div>
        )}

        {selectedTender.statusIndex === 1 && isCreator && bids.length > 0 && bids.length < minBidsForVoting && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              Na spustenie hlasovania sú potrebné aspoň <strong>{minBidsForVoting}</strong> ponuky od dodávateľov.
              Aktuálny počet: <strong>{bids.length}</strong>.
            </p>
          </div>
        )}

        {canStartVoting && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-wrap items-center gap-4">
            <span className="text-blue-800 dark:text-blue-300 font-medium">Spustiť hlasovanie:</span>
            <input
              type="number"
              min={3}
              max={14}
              value={votingDaysInput}
              onChange={(e) => setVotingDaysInput(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400 text-sm">dní (3–14)</span>
            <button
              type="button"
              onClick={() => onStartVoting(selectedTender.id, votingDaysInput)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              Začať hlasovanie
            </button>
          </div>
        )}

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ponuky</h3>
        {bids.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-8 text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            Zatiaľ neboli podané žiadne ponuky
          </p>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => {
              const votes = voteCounts[bid.id] ?? 0;
              const isWinner = winningBid && winningBid.bidId === bid.id;
              return (
                <div
                  key={bid.id}
                  className={`border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 ${
                    isWinner
                      ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {bid.price.toFixed(2)} €
                      </p>
                      {isWinner && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Trophy size={10} /> Víťaz
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dodanie: {bid.deliveryTime} dní • #{bid.id}</p>
                    {bid.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{bid.description}</p>}
                    <a
                      href={explorerUrl.address(bid.vendor)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-mono mt-1 inline-flex items-center gap-1"
                    >
                      {shortAddress(bid.vendor)} <ExternalLink size={10} />
                    </a>
                    {canVote && votes > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <ThumbsUp size={12} />
                        <span>{votes} {votes === 1 ? 'hlas' : 'hlasov'}</span>
                      </div>
                    )}
                  </div>
                  {canVote && (
                    <button
                      type="button"
                      onClick={() => onCastVote(selectedTender.id, bid.id)}
                      disabled={loading || hasVoted}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                        hasVoted
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                      }`}
                    >
                      <ThumbsUp size={16} />
                      {hasVoted ? 'Hlasovali ste' : 'Hlasovať'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Winning bid card */}
        {winningBid && (isCompleted || isFulfilled) && (
          <div className="mt-6 p-5 border-2 border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={20} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Víťazná ponuka</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Cena</p>
                <p className="font-semibold text-gray-900 dark:text-white">{winningBid.price.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Hlasy</p>
                <p className="font-semibold text-gray-900 dark:text-white">{winningBid.votes}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Dodávateľ</p>
                <a
                  href={explorerUrl.address(winningBid.vendor)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-purple-600 dark:text-purple-400 hover:underline font-mono text-xs"
                >
                  {shortAddress(winningBid.vendor)} ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Lifecycle action buttons */}
        {(canCancel || canFinalize || canFulfill) && (
          <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Award size={18} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Správa tendra</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {canFinalize && (
                <button
                  type="button"
                  onClick={() => onFinalizeTender(selectedTender.id)}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <CheckCircle size={16} />
                  {loading ? 'Spracovávam...' : 'Finalizovať tender'}
                </button>
              )}
              {canFulfill && (
                <button
                  type="button"
                  onClick={() => onFulfillTender(selectedTender.id)}
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <CheckCircle size={16} />
                  {loading ? 'Spracovávam...' : 'Potvrdiť splnenie'}
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => onCancelTender(selectedTender.id)}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <XCircle size={16} />
                  {loading ? 'Spracovávam...' : 'Zrušiť tender'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {canFinalize && 'Hlasovanie skončilo. Finalizácia určí víťaznú ponuku na základe hlasov.'}
              {canFulfill && 'Tender bol finalizovaný. Potvrďte splnenie dodávateľom.'}
              {canCancel && !canFinalize && !canFulfill && 'Zrušenie tendra je nezvratná akcia. Tender sa nedá obnoviť.'}
            </p>
          </div>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <XCircle size={20} className="text-red-500 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-400 font-medium text-sm">Tento tender bol zrušený.</p>
          </div>
        )}

        {/* Fulfilled banner */}
        {isFulfilled && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-500 dark:text-emerald-400" />
            <p className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Tender bol úspešne splnený dodávateľom.</p>
          </div>
        )}

        {canSubmitBid && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Podať ponuku</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cena (€)</label>
                <input
                  type="text"
                  value={bidForm.priceEUR}
                  onChange={(e) => setBidForm({ ...bidForm, priceEUR: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dodanie (dni)</label>
                <input
                  type="number"
                  value={bidForm.deliveryTime}
                  onChange={(e) => setBidForm({ ...bidForm, deliveryTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="7"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Popis</label>
              <textarea
                value={bidForm.description}
                onChange={(e) => setBidForm({ ...bidForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Popis ponuky..."
              />
            </div>
            <button
              type="button"
              onClick={onSubmitBid}
              disabled={loading || !bidForm.priceEUR || !bidForm.deliveryTime}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Odosielam...' : 'Podať ponuku'}
            </button>
          </div>
        )}

        {/* Transparency / on-chain verification */}
        <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Overenie na blockchaine</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Všetky údaje tohto tendra sú uložené na blockchaine Polygon Amoy a sú verejne overiteľné.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={explorerUrl.contract()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <ExternalLink size={12} /> Smart kontrakt
            </a>
            <a
              href={explorerUrl.address(selectedTender.creator)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <ExternalLink size={12} /> Tvorca tendra
            </a>
            {selectedTender.ipfsCID && (
              <a
                href={getIPFSUrl ? getIPFSUrl(selectedTender.ipfsCID) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ExternalLink size={12} /> Dokument (IPFS)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
