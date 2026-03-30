import React, { useState, useEffect } from 'react';
import { ThumbsUp, ExternalLink } from 'lucide-react';
import { getCategoryIcon } from '../../utils/category';
import { explorerUrl, shortAddress } from '../../utils/explorer';

const ETH_TO_EUR = 1800;

export function Voting({ tenders, contract, account, onVote, loading }) {
  const [tendersWithBids, setTendersWithBids] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [hasVotedMap, setHasVotedMap] = useState({});

  const votingTenders = tenders.filter((t) => t.statusIndex === 2);

  useEffect(() => {
    if (!contract || votingTenders.length === 0) {
      setTendersWithBids([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const withBids = [];
      for (const tender of votingTenders) {
        try {
          const bids = await contract.getTenderBids(tender.id);
          const bidList = bids.map((b) => ({
            id: b.id.toString(),
            vendor: b.vendor,
            price: parseFloat((b.price && b.price.toString) ? window.ethers.utils.formatEther(b.price) : 0),
            deliveryTime: b.deliveryTime?.toString?.() ?? b.deliveryTime,
            description: b.description || '',
          }));
          withBids.push({ ...tender, offers: bidList });
        } catch (e) {
          withBids.push({ ...tender, offers: [] });
        }
      }
      if (!cancelled) setTendersWithBids(withBids);
    };
    load();
    return () => { cancelled = true; };
  }, [contract, tenders]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!contract || !account || tendersWithBids.length === 0) {
      setVoteCounts({});
      setHasVotedMap({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      const counts = {};
      const voted = {};
      for (const tender of tendersWithBids) {
        for (const offer of tender.offers) {
          try {
            const votes = await contract.getVoteCount(tender.id, offer.id);
            counts[`${tender.id}-${offer.id}`] = votes.toNumber ? votes.toNumber() : Number(votes);
          } catch (e) {
            counts[`${tender.id}-${offer.id}`] = 0;
          }
        }
        try {
          const hasVoted = await contract.hasUserVoted(tender.id, account);
          voted[tender.id] = hasVoted;
        } catch (e) {
          voted[tender.id] = false;
        }
      }
      if (!cancelled) {
        setVoteCounts(counts);
        setHasVotedMap(voted);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contract, account, tendersWithBids]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hlasovanie</h1>
        <p className="text-gray-600 dark:text-gray-400">Hlasujte o najlepších ponukách</p>
      </div>

      {tendersWithBids.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Momentálne nie sú žiadne tendery na hlasovanie</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tendersWithBids.map((tender) => (
            <div key={tender.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{getCategoryIcon(tender.category)}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tender.title}</h3>
                  {tender.description && <p className="text-gray-600 dark:text-gray-400 mb-2">{tender.description}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Rozpočet: {(tender.maxBudget * ETH_TO_EUR).toFixed(2)} €</span>
                    <span>{tender.offers.length} ponúk</span>
                    <span>
                      {tender.offers.reduce(
                        (sum, o) => sum + (voteCounts[`${tender.id}-${o.id}`] ?? 0),
                        0
                      )}{' '}
                      hlasov
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {tender.offers.map((offer) => {
                  const votes = voteCounts[`${tender.id}-${offer.id}`] ?? 0;
                  const hasVoted = hasVotedMap[tender.id];
                  return (
                    <div key={offer.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={explorerUrl.address(offer.vendor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px] hover:text-purple-600 dark:hover:text-purple-400 inline-flex items-center gap-1"
                        >
                          {shortAddress(offer.vendor)} <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                        </a>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {(offer.price * ETH_TO_EUR).toFixed(2)} €
                        </span>
                      </div>
                      {offer.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{offer.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ThumbsUp size={16} />
                          <span>
                            {votes} {votes === 1 ? 'hlas' : 'hlasov'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onVote(tender.id, offer.id)}
                          disabled={loading || hasVoted}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            hasVoted || loading
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {hasVoted ? 'Hlasovali ste' : loading ? 'Spracovanie...' : 'Hlasovať'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800 mt-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">ℹ️ Informácie o hlasovaní</h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Môžete hlasovať iba raz za tender. Ponuka s najväčším počtom hlasov vyhrá.
        </p>
      </div>
    </div>
  );
}
