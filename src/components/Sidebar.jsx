import React from 'react';
import { Home, FileText, Vote, BarChart3, Settings, PlusCircle, List, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: PlusCircle, label: 'Nový tender', path: '/tenders/new', councilOnly: true },
  { icon: FileText, label: 'Moje tendery', path: '/tenders/my', councilOnly: true },
  { icon: List, label: 'Všetky tendery', path: '/tenders' },
  { icon: Vote, label: 'Hlasovanie', path: '/voting', councilOnly: true },
  { icon: UserPlus, label: 'Žiadosti dodávateľov', path: '/vendor/approvals', councilOnly: true },
  { icon: BarChart3, label: 'Reporty', path: '/reports', councilOnly: true },
  { icon: UserPlus, label: 'Registrácia dodávateľa', path: '/vendor/register', vendorRegistrationOnly: true },
  { icon: Settings, label: 'Nastavenia', path: '/settings' },
];

export function Sidebar({ activeItem, onNavigate, account, isMember, isRegisteredVendor }) {
  const displayName = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Nie prihlásený';
  const roleLabel = isMember ? 'Člen rady' : isRegisteredVendor ? 'Dodávateľ' : 'Pozorovateľ';
  const showCouncilItems = account && isMember;
  const showVendorRegistration = account && !isRegisteredVendor && !isMember;
  const visibleItems = menuItems.filter((item) => {
    if (item.councilOnly) return showCouncilItems;
    if (item.vendorRegistrationOnly) return showVendorRegistration;
    return true;
  });

  return (
    <div className="w-64 h-full bg-[#2c3e50] dark:bg-gray-800 flex flex-col">
      <div className="h-16 px-6 flex items-center border-b border-[#34495e] dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-200">
            <img src="/logo.png" alt="TUKE Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-purple-200 bg-clip-text text-transparent">
            MicroTender
          </h1>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            // Check if active based on exact or partial path
            const isActive = activeItem === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => onNavigate && onNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-[#34495e] dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#34495e] dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {account ? account.slice(2, 4).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-400">{roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
