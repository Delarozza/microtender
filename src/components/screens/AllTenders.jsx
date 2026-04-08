import React from 'react';
import { getCategoryIcon, getCategoryLabel } from '../../utils/category';
import { Calendar, Users } from 'lucide-react';

const statusColors = {
  Koncept: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Aktívny: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Hlasovanie: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  Ukončený: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Splnený: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Zrušený: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export function AllTenders({ tenders, onSelectTender, onNavigate }) {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Všetky tendery</h1>
        <p className="text-gray-600 dark:text-gray-400">Prehľad všetkých tenderov v systéme</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {tenders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">Zatiaľ nie sú žiadne tendery</p>
          </div>
        ) : (
          tenders.map((tender) => (
            <div
              key={tender.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTender && onSelectTender(tender.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectTender && onSelectTender(tender.id)}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getCategoryIcon(tender.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{tender.title}</h3>
                      {tender.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{tender.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {tender.maxBudget.toFixed(2)} €
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                          statusColors[tender.status] ||
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tender.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {tender.deadline && Number(tender.deadline) > 0 && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          Uzávierka: {new Date(Number(tender.deadline) * 1000).toLocaleDateString('sk-SK')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{tender.bidCount ?? 0} ponúk</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(tender.category)}</span>
                      <span>{getCategoryLabel(tender.category)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
