import React from 'react';
import { TrendingUp, FileText, Clock, CheckCircle, UserPlus, Shield } from 'lucide-react';
import { getCategoryIcon } from '../../utils/category';

const ETH_TO_EUR = 1800;

export function Dashboard({ onNavigate, tenders, account, isMember, isRegisteredVendor }) {
  const activeTenders = tenders.filter((t) => t.statusIndex === 1).length;
  const votingTenders = tenders.filter((t) => t.statusIndex === 2).length;
  const completedTenders = tenders.filter((t) => t.statusIndex === 3 || t.statusIndex === 4).length;

  const stats = [
    { icon: FileText, label: 'Aktívne tendery', value: activeTenders.toString(), color: 'blue' },
    { icon: Clock, label: 'Čaká na hlasovanie', value: votingTenders.toString(), color: 'yellow' },
    { icon: CheckCircle, label: 'Ukončené', value: completedTenders.toString(), color: 'green' },
    { icon: TrendingUp, label: 'Celkom', value: tenders.length.toString(), color: 'purple' },
  ];

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Prehľad tenderov v systéme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[stat.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rýchle akcie</h2>
          <div className="space-y-3">
            {account && isMember && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('Nový tender')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText size={20} />
                  <span>Vytvoriť nový tender</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('Moje tendery')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText size={20} />
                  <span>Zobraziť moje tendery</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('Hlasovanie')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle size={20} />
                  <span>Hlasovať o ponukách</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('Žiadosti dodávateľov')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Shield size={20} />
                  <span>Schváliť žiadosti dodávateľov</span>
                </button>
              </>
            )}
            {account && !isMember && !isRegisteredVendor && (
              <button
                type="button"
                onClick={() => onNavigate('Registrácia dodávateľa')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <UserPlus size={20} />
                <span>Registrovať sa ako dodávateľ</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('Všetky tendery')}
              className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={20} />
              <span>Všetky tendery</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Posledné tendery</h2>
          <div className="space-y-4">
            {tenders.length === 0 ? (
              <p className="text-gray-500 text-sm">Zatiaľ žiadne tendery</p>
            ) : (
              tenders.slice(0, 5).map((tender) => (
                <div
                  key={tender.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="text-2xl">{getCategoryIcon(tender.category)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tender.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tender.status} • {(tender.maxBudget * ETH_TO_EUR).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
