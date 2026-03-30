import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, Wallet, LogOut, FileText, ShoppingBag, Vote, CheckCircle, UserPlus, XCircle, Check } from 'lucide-react';

const NOTIF_ICONS = {
  tender_created:       { icon: FileText,     color: 'text-blue-500' },
  bid_submitted:        { icon: ShoppingBag,  color: 'text-green-500' },
  vote_casted:          { icon: Vote,         color: 'text-yellow-500' },
  tender_completed:     { icon: CheckCircle,  color: 'text-purple-500' },
  vendor_app_submitted: { icon: UserPlus,     color: 'text-cyan-500' },
  vendor_app_approved:  { icon: CheckCircle,  color: 'text-emerald-500' },
  vendor_app_rejected:  { icon: XCircle,      color: 'text-red-500' },
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'práve teraz';
  if (mins < 60) return `pred ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `pred ${hours} h`;
  const days = Math.floor(hours / 24);
  return `pred ${days} d`;
}

export function Header({
  onMenuClick,
  account,
  onConnectWallet,
  onDisconnect,
  isMember,
  isRegisteredVendor,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setShowPanel(false);
      }
    }
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPanel]);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 flex items-center">
      <div className="flex items-center justify-between w-full">
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
              {/* Bell + dropdown */}
              <div className="relative">
                <button
                  ref={bellRef}
                  type="button"
                  onClick={() => setShowPanel((p) => !p)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label="Notifikácie"
                >
                  <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showPanel && (
                  <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {/* Panel header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifikácie {unreadCount > 0 && <span className="text-purple-600 dark:text-purple-400">({unreadCount})</span>}
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={onMarkAllAsRead}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Prečítať všetko
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => { onClearAll?.(); setShowPanel(false); }}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                          >
                            Vymazať
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Žiadne notifikácie</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.tender_created;
                          const Icon = meta.icon;
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => { onMarkAsRead?.(n.id); }}
                              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
                                !n.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                              }`}
                            >
                              <div className={`mt-0.5 flex-shrink-0 ${meta.color}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                                  {!n.read && <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                              </div>
                              {!n.read && (
                                <div className="flex-shrink-0 mt-1" title="Označiť ako prečítané">
                                  <Check size={14} className="text-gray-400" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

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
