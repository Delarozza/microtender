import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp } from 'lucide-react';

const ETH_TO_EUR = 1800;

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
}) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});

  useEffect(() => {
    if (!contract || !account || !selectedTender) return;
    let cancelled = false;

    (async () => {
      try {
        const voted = await contract.hasUserVoted(selectedTender.id, account);
        if (!cancelled) setHasVoted(voted);
      } catch (_) {}

      if (selectedTender.statusIndex === 2 && bids.length > 0) {
        const counts = {};
        for (const bid of bids) {
          try {
            const c = await contract.getVoteCount(selectedTender.id, bid.id);
            counts[bid.id] = c.toNumber ? c.toNumber() : Number(c);
          } catch (_) {
            counts[bid.id] = 0;
          }
        }
        if (!cancelled) setVoteCounts(counts);
      }
    })();

    return () => { cancelled = true; };
  }, [contract, account, selectedTender, bids]);

  if (!selectedTender) return null;

  const isCreator = account && selectedTender.creator && account.toLowerCase() === selectedTender.creator.toLowerCase();
  const canStartVoting = selectedTender.statusIndex === 1 && bids.length > 0 && isCreator;
  const canVote = selectedTender.statusIndex === 2 && isMember;
  const canSubmitBid = selectedTender.statusIndex === 1 && isRegisteredVendor && !isMember;

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
                  className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
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
                ? 'bg-green-100 text-green-700'
                : selectedTender.status === 'Hlasovanie'
                ? 'bg-yellow-100 text-yellow-700'
                : selectedTender.status === 'Ukončený'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {selectedTender.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Maximálny rozpočet</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(selectedTender.maxBudget * ETH_TO_EUR).toFixed(2)} €
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Počet ponúk</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bids.length}</p>
          </div>
        </div>

        {canStartVoting && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-wrap items-center gap-4">
            <span className="text-blue-800 dark:text-blue-300 font-medium">Predčasne spustiť hlasovanie:</span>
            <input
              type="number"
              min={1}
              max={14}
              value={votingDaysInput}
              onChange={(e) => setVotingDaysInput(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400 text-sm">dní na hlasovanie</span>
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
              return (
                <div
                  key={bid.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {(bid.price * ETH_TO_EUR).toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dodanie: {bid.deliveryTime} dní • #{bid.id}</p>
                    {bid.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{bid.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {bid.vendor?.slice?.(0, 6)}...{bid.vendor?.slice?.(-4)}
                    </p>
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
      </div>
    </div>
  );
}
