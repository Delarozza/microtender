import React, { useState } from 'react';
import { Menu, Bell, Search, Wallet, LogOut } from 'lucide-react';

export function Header({
  onMenuClick,
  account,
  onConnectWallet,
  onDisconnect,
  isMember,
  isRegisteredVendor,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex-1 max-w-md">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Hľadať tendery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 min-w-0 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {account ? (
            <>
              <button
                type="button"
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Notifikácie"
              >
                <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">
                    {account.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium truncate max-w-[120px] text-gray-900 dark:text-white">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              {onDisconnect && (
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                  title="Odpojiť"
                >
                  <LogOut size={20} />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Wallet size={20} />
              <span className="hidden sm:inline">Pripojiť peňaženku</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
