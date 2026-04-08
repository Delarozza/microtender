import { useState, useEffect, useCallback, useRef } from 'react';

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

export function useNotifications(contract, account) {
  const [notifications, setNotifications] = useState(loadFromStorage);
  const listenersAttached = useRef(false);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const isDuplicate = prev.some((n) => n.id === notif.id);
      if (isDuplicate) return prev;
      const next = [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveToStorage(next);
      return next;
    });
  }, []);

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
    if (!contract || !contract.provider || listenersAttached.current) return;

    const isSigner = !!contract.signer;
    if (!isSigner && !contract.provider.on) return;

    listenersAttached.current = true;

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
      const ethPrice = window.ethers?.utils?.formatEther?.(price) ?? '?';
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
      contract.on('TenderCreated', onTenderCreated);
      contract.on('BidSubmitted', onBidSubmitted);
      contract.on('VoteCasted', onVoteCasted);
      contract.on('TenderCompleted', onTenderCompleted);
      contract.on('VendorApplicationSubmitted', onAppSubmitted);
      contract.on('VendorApplicationApproved', onAppApproved);
      contract.on('VendorApplicationRejected', onAppRejected);
    } catch (_) { /* read-only provider may not support event subscriptions */ }

    return () => {
      listenersAttached.current = false;
      try {
        contract.removeAllListeners('TenderCreated');
        contract.removeAllListeners('BidSubmitted');
        contract.removeAllListeners('VoteCasted');
        contract.removeAllListeners('TenderCompleted');
        contract.removeAllListeners('VendorApplicationSubmitted');
        contract.removeAllListeners('VendorApplicationApproved');
        contract.removeAllListeners('VendorApplicationRejected');
      } catch (_) {}
    };
  }, [contract, addNotification]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll };
}
