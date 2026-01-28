import React from 'react';
import { Home, FileText, Vote, BarChart3, Settings, PlusCircle, List, UserPlus, Shield } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', screen: 'Dashboard' },
  { icon: PlusCircle, label: 'Nový tender', screen: 'Nový tender', councilOnly: true },
  { icon: FileText, label: 'Moje tendery', screen: 'Moje tendery', councilOnly: true },
  { icon: List, label: 'Všetky tendery', screen: 'Všetky tendery' },
  { icon: Vote, label: 'Hlasovanie', screen: 'Hlasovanie', councilOnly: true },
  { icon: UserPlus, label: 'Žiadosti dodávateľov', screen: 'Žiadosti dodávateľov', councilOnly: true },
  { icon: BarChart3, label: 'Reporty', screen: 'Reporty', councilOnly: true },
  { icon: UserPlus, label: 'Registrácia dodávateľa', screen: 'Registrácia dodávateľa', vendorRegistrationOnly: true },
  { icon: Settings, label: 'Nastavenia', screen: 'Nastavenia' },
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
    <div className="w-64 h-full bg-[#2c3e50] flex flex-col">
      <div className="p-6 border-b border-[#34495e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MicroTender</h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.screen;

            return (
              <li key={item.screen}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.screen)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-[#34495e]'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#34495e]">
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
