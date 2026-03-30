import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Wallet, Users, Clock, FileText, CheckCircle, XCircle, Award } from 'lucide-react';
import { getCategoryIcon, getCategoryLabel } from '../../utils/category';

const ETH_TO_EUR = 1800;

const STATUS_META = [
  { key: 'Koncept',    idx: 0, color: 'bg-gray-400',    darkColor: 'dark:bg-gray-500',    text: 'text-gray-700 dark:text-gray-300' },
  { key: 'Aktívny',    idx: 1, color: 'bg-green-500',   darkColor: 'dark:bg-green-500',   text: 'text-green-700 dark:text-green-400' },
  { key: 'Hlasovanie', idx: 2, color: 'bg-yellow-500',  darkColor: 'dark:bg-yellow-400',  text: 'text-yellow-700 dark:text-yellow-400' },
  { key: 'Ukončený',   idx: 3, color: 'bg-blue-500',    darkColor: 'dark:bg-blue-500',    text: 'text-blue-700 dark:text-blue-400' },
  { key: 'Splnený',    idx: 4, color: 'bg-emerald-500', darkColor: 'dark:bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400' },
  { key: 'Zrušený',    idx: 5, color: 'bg-red-500',     darkColor: 'dark:bg-red-400',     text: 'text-red-700 dark:text-red-400' },
];

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, accent }) {
  const accentMap = {
    blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green:  'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-lg ${accentMap[accent] || accentMap.blue}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function BarRow({ label, count, total, colorClass }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass} transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">{count}</span>
    </div>
  );
}

export function Reports({ tenders, contract, account }) {
  const stats = useMemo(() => {
    if (!tenders || tenders.length === 0) {
      return { total: 0, totalBudget: 0, avgBudget: 0, totalBids: 0, byStatus: {}, byCategory: {}, topTenders: [], creators: new Set() };
    }

    const totalBudgetEur = tenders.reduce((s, t) => s + t.maxBudget * ETH_TO_EUR, 0);
    const totalBids = tenders.reduce((s, t) => s + (t.bidCount || 0), 0);
    const creators = new Set(tenders.map((t) => t.creator?.toLowerCase()).filter(Boolean));

    const byStatus = {};
    for (const t of tenders) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    }

    const byCategory = {};
    for (const t of tenders) {
      const cat = t.category || 'ine';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    const topTenders = [...tenders].sort((a, b) => b.maxBudget - a.maxBudget).slice(0, 5);

    return {
      total: tenders.length,
      totalBudget: totalBudgetEur,
      avgBudget: totalBudgetEur / tenders.length,
      totalBids,
      byStatus,
      byCategory,
      topTenders,
      creators,
    };
  }, [tenders]);

  const recentTenders = useMemo(() => {
    if (!tenders || tenders.length === 0) return [];
    return [...tenders]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .slice(0, 8);
  }, [tenders]);

  const statusIcon = (status) => {
    switch (status) {
      case 'Aktívny': return <Clock size={14} className="text-green-500" />;
      case 'Hlasovanie': return <Users size={14} className="text-yellow-500" />;
      case 'Ukončený': return <CheckCircle size={14} className="text-blue-500" />;
      case 'Splnený': return <Award size={14} className="text-emerald-500" />;
      case 'Zrušený': return <XCircle size={14} className="text-red-500" />;
      default: return <FileText size={14} className="text-gray-400" />;
    }
  };

  const categoryColors = [
    'bg-blue-500 dark:bg-blue-400',
    'bg-purple-500 dark:bg-purple-400',
    'bg-emerald-500 dark:bg-emerald-400',
    'bg-orange-500 dark:bg-orange-400',
    'bg-pink-500 dark:bg-pink-400',
    'bg-cyan-500 dark:bg-cyan-400',
  ];

  if (!tenders || tenders.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Reporty</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analýza a štatistiky tenderov</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BarChart3 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Zatiaľ nie sú žiadne dáta na zobrazenie</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Reporty</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Analýza a štatistiky tenderov</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox icon={FileText} label="Celkom tenderov" value={stats.total} accent="blue" />
        <StatBox icon={Wallet} label="Celkový rozpočet" value={`${stats.totalBudget.toFixed(0)} €`} accent="green" />
        <StatBox icon={TrendingUp} label="Priemerný rozpočet" value={`${stats.avgBudget.toFixed(0)} €`} accent="purple" />
        <StatBox icon={Users} label="Celkom ponúk" value={stats.totalBids} accent="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status breakdown */}
        <Card title="Tendery podľa stavu" icon={BarChart3}>
          <div className="space-y-3">
            {STATUS_META.map((s) => {
              const count = stats.byStatus[s.key] || 0;
              return (
                <BarRow
                  key={s.key}
                  label={s.key}
                  count={count}
                  total={stats.total}
                  colorClass={`${s.color} ${s.darkColor}`}
                />
              );
            })}
          </div>
        </Card>

        {/* Category breakdown */}
        <Card title="Tendery podľa kategórie" icon={TrendingUp}>
          <div className="space-y-3">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count], i) => (
                <BarRow
                  key={cat}
                  label={`${getCategoryIcon(cat)} ${getCategoryLabel(cat)}`}
                  count={count}
                  total={stats.total}
                  colorClass={categoryColors[i % categoryColors.length]}
                />
              ))}
          </div>
          {Object.keys(stats.byCategory).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Žiadne dáta</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top tenders by budget */}
        <Card title="Najväčšie tendery (podľa rozpočtu)" icon={Wallet}>
          <div className="space-y-3">
            {stats.topTenders.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.status} · {t.bidCount || 0} ponúk</p>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {(t.maxBudget * ETH_TO_EUR).toFixed(0)} €
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card title="Posledná aktivita" icon={Clock}>
          <div className="space-y-3">
            {recentTenders.map((t) => {
              const date = Number(t.createdAt) > 0
                ? new Date(Number(t.createdAt) * 1000).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';
              return (
                <div key={t.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <div className="mt-0.5">{statusIcon(t.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{date} · {getCategoryLabel(t.category)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    STATUS_META.find((s) => s.key === t.status)?.text || 'text-gray-500 dark:text-gray-400'
                  } bg-gray-100 dark:bg-gray-700`}>
                    {t.status}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Summary footer */}
      <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Unikátni tvorcovia</p>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-300">{stats.creators.size}</p>
        </div>
        <div className="w-px h-10 bg-purple-200 dark:bg-purple-700 hidden sm:block" />
        <div>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Priemerný počet ponúk</p>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-300">
            {stats.total > 0 ? (stats.totalBids / stats.total).toFixed(1) : '0'}
          </p>
        </div>
        <div className="w-px h-10 bg-purple-200 dark:bg-purple-700 hidden sm:block" />
        <div>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Kategórií</p>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-300">{Object.keys(stats.byCategory).length}</p>
        </div>
      </div>
    </div>
  );
}
