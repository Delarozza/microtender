import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, AMOY_RPC, AMOY_RPC_FALLBACK } from '../constants/contracts';

const STORAGE_KEY = 'microtender_notifications';
const MAX_NOTIFICATIONS = 50;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveToStorage(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch (_) { /* quota exceeded — silent */ }
}

function shortAddr(addr) {
  if (!addr) return '?';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function useNotifications(contract, account, onNewNotification) {
  const [notifications, setNotifications] = useState(loadFromStorage);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const isDuplicate = prev.some((n) => n.id === notif.id);
      if (isDuplicate) return prev;
      const next = [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveToStorage(next);
      if (onNewNotification) {
        onNewNotification(notif);
      }
      return next;
    });
  }, [onNewNotification]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    let activeContract = null;
    let activeProvider = null;

    try {
      try {
        activeProvider = new ethers.JsonRpcProvider(AMOY_RPC);
      } catch (_) {
        activeProvider = new ethers.JsonRpcProvider(AMOY_RPC_FALLBACK);
      }

      activeProvider.on("error", (err) => {
        console.warn("Background notification provider network error:", err);
      });

      activeContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, activeProvider);
    } catch (e) {
      console.error("Failed to initialize background notifications provider:", e);
      return;
    }

    const makeId = (event, ...args) => `${event}-${args.join('-')}`;

    const onTenderCreated = (tenderId, creator, title) => {
      addNotification({
        id: makeId('TenderCreated', tenderId.toString(), Date.now()),
        type: 'tender_created',
        title: 'Nový tender vytvorený',
        message: `„${title}" od ${shortAddr(creator)}`,
        timestamp: Date.now(),
        read: false,
        meta: { tenderId: tenderId.toString(), creator },
      });
    };

    const onBidSubmitted = (tenderId, bidId, vendor, price) => {
      const ethPrice = (() => { try { return parseFloat(ethers.formatEther(price)).toFixed(2); } catch { return '?'; } })();
      addNotification({
        id: makeId('BidSubmitted', tenderId.toString(), bidId.toString(), Date.now()),
        type: 'bid_submitted',
        title: 'Nová ponuka',
        message: `Ponuka #${bidId} na tender #${tenderId} od ${shortAddr(vendor)} (${parseFloat(ethPrice).toFixed(2)} €)`,
        timestamp: Date.now(),
        read: false,
        meta: { tenderId: tenderId.toString(), bidId: bidId.toString(), vendor },
      });
    };

    const onVoteCasted = (tenderId, bidId, voter) => {
      addNotification({
        id: makeId('VoteCasted', tenderId.toString(), bidId.toString(), voter, Date.now()),
        type: 'vote_casted',
        title: 'Nový hlas',
        message: `${shortAddr(voter)} hlasoval za ponuku #${bidId} v tendri #${tenderId}`,
        timestamp: Date.now(),
        read: false,
        meta: { tenderId: tenderId.toString(), bidId: bidId.toString() },
      });
    };

    const onTenderCompleted = (tenderId, winningBidId) => {
      addNotification({
        id: makeId('TenderCompleted', tenderId.toString(), Date.now()),
        type: 'tender_completed',
        title: 'Tender ukončený',
        message: `Tender #${tenderId} bol finalizovaný. Víťazná ponuka: #${winningBidId}`,
        timestamp: Date.now(),
        read: false,
        meta: { tenderId: tenderId.toString() },
      });
    };

    const onAppSubmitted = (applicationId, applicant, companyName) => {
      addNotification({
        id: makeId('VendorAppSubmitted', applicationId.toString(), Date.now()),
        type: 'vendor_app_submitted',
        title: 'Nová žiadosť dodávateľa',
        message: `${companyName} (${shortAddr(applicant)}) podal žiadosť`,
        timestamp: Date.now(),
        read: false,
        meta: { applicationId: applicationId.toString() },
      });
    };

    const onAppApproved = (applicationId, vendor) => {
      addNotification({
        id: makeId('VendorAppApproved', applicationId.toString(), Date.now()),
        type: 'vendor_app_approved',
        title: 'Žiadosť schválená',
        message: `Dodávateľ ${shortAddr(vendor)} bol schválený`,
        timestamp: Date.now(),
        read: false,
        meta: { applicationId: applicationId.toString(), vendor },
      });
    };

    const onAppRejected = (applicationId, applicant) => {
      addNotification({
        id: makeId('VendorAppRejected', applicationId.toString(), Date.now()),
        type: 'vendor_app_rejected',
        title: 'Žiadosť zamietnutá',
        message: `Žiadosť #${applicationId} od ${shortAddr(applicant)} bola zamietnutá`,
        timestamp: Date.now(),
        read: false,
        meta: { applicationId: applicationId.toString() },
      });
    };

    try {
      activeContract.on('TenderCreated', onTenderCreated);
      activeContract.on('BidSubmitted', onBidSubmitted);
      activeContract.on('VoteCasted', onVoteCasted);
      activeContract.on('TenderCompleted', onTenderCompleted);
      activeContract.on('VendorApplicationSubmitted', onAppSubmitted);
      activeContract.on('VendorApplicationApproved', onAppApproved);
      activeContract.on('VendorApplicationRejected', onAppRejected);
    } catch (_) { /* read-only provider may not support event subscriptions */ }

    return () => {
      try {
        if (activeContract) {
          activeContract.removeAllListeners('TenderCreated');
          activeContract.removeAllListeners('BidSubmitted');
          activeContract.removeAllListeners('VoteCasted');
          activeContract.removeAllListeners('TenderCompleted');
          activeContract.removeAllListeners('VendorApplicationSubmitted');
          activeContract.removeAllListeners('VendorApplicationApproved');
          activeContract.removeAllListeners('VendorApplicationRejected');
        }
      } catch (_) { }
      try {
        if (activeProvider) {
          activeProvider.removeAllListeners();
        }
      } catch (_) { }
    };
  }, [addNotification]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll };
}
