import React, { useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { WalletProvider, WalletContext } from './context/WalletContext';
import { useTenderContract } from './hooks/useTenderContract';
import { useNotifications } from './hooks/useNotifications';
import { FileText, ShoppingBag, Vote, CheckCircle, UserPlus, XCircle, X } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/screens/Dashboard';
import { CreateTender } from './components/screens/CreateTender';
import { MyTenders } from './components/screens/MyTenders';
import { Voting } from './components/screens/Voting';
import { AllTenders } from './components/screens/AllTenders';
import { TenderDetail } from './components/screens/TenderDetail';
import { VendorRegistration } from './components/screens/VendorRegistration';
import { VendorApproval } from './components/screens/VendorApproval';
import { Settings } from './components/screens/Settings';
import { Reports } from './components/screens/Reports';

const NOTIF_ICONS = {
  tender_created:       { icon: FileText,     color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/10' },
  bid_submitted:        { icon: ShoppingBag,  color: 'text-green-500 bg-green-50 dark:bg-green-900/10' },
  vote_casted:          { icon: Vote,         color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' },
  tender_completed:     { icon: CheckCircle,  color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/10' },
  vendor_app_submitted: { icon: UserPlus,     color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/10' },
  vendor_app_approved:  { icon: CheckCircle,  color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' },
  vendor_app_rejected:  { icon: XCircle,      color: 'text-red-500 bg-red-50 dark:bg-red-900/10' },
};

function MainAppContent() {
  const { account, contract, isMember, isRegisteredVendor, userRole, myApplicationStatus, connectWallet, disconnectWallet } = useContext(WalletContext);
  const tenderMethods = useTenderContract(contract, account, isMember);
  const [activeToasts, setActiveToasts] = useState([]);

  const handleNewNotification = useCallback((notif) => {
    const id = notif.id + '-' + Math.random();
    setActiveToasts((prev) => [...prev, { ...notif, toastId: id }]);
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.toastId !== id));
    }, 4500);
  }, []);

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications(contract, account, handleNewNotification);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load all tenders initially
  const { loadAllTenders } = tenderMethods;
  useEffect(() => {
    if (contract) loadAllTenders();
  }, [contract, loadAllTenders]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#171f2b]">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar 
          activeItem={location.pathname} 
          onNavigate={handleNavigate} 
          account={account} 
          isMember={isMember} 
          isRegisteredVendor={isRegisteredVendor} 
        />
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Sidebar Mobile */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          activeItem={location.pathname} 
          onNavigate={handleNavigate} 
          account={account} 
          isMember={isMember} 
          isRegisteredVendor={isRegisteredVendor} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          account={account} 
          onConnectWallet={connectWallet} 
          onDisconnect={disconnectWallet} 
          isMember={isMember} 
          isRegisteredVendor={isRegisteredVendor}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#171f2b]">
          <Routes>
            <Route path="/" element={<Dashboard onNavigate={handleNavigate} tenders={tenderMethods.allTenders} account={account} isMember={isMember} isRegisteredVendor={isRegisteredVendor} />} />
            
            <Route path="/tenders/new" element={isMember ? <CreateTender onNavigate={handleNavigate} createForm={tenderMethods.createForm} setCreateForm={tenderMethods.setCreateForm} createAndPublishTender={() => tenderMethods.createAndPublishTender(() => navigate('/tenders'))} loading={tenderMethods.loading} selectedFile={tenderMethods.selectedFile} ipfsCID={tenderMethods.ipfsCID} uploadingFile={tenderMethods.uploadingFile} uploadProgress={tenderMethods.uploadProgress} handleFileSelect={tenderMethods.handleFileSelect} removeFile={tenderMethods.removeFile} isMember={isMember} account={account} /> : <Navigate to="/" />} />
            
            <Route path="/tenders/my" element={isMember ? <MyTenders onNavigate={handleNavigate} tenders={tenderMethods.allTenders} account={account} onSelectTender={(id) => { tenderMethods.getTenderDetails(id); navigate(`/tenders/${id}`); }} /> : <Navigate to="/" />} />
            
            <Route path="/tenders" element={<AllTenders tenders={tenderMethods.allTenders} onSelectTender={(id) => { tenderMethods.getTenderDetails(id); navigate(`/tenders/${id}`); }} onNavigate={handleNavigate} />} />
            
            <Route path="/voting" element={isMember ? <Voting tenders={tenderMethods.allTenders} contract={contract} account={account} onVote={tenderMethods.castVote} loading={tenderMethods.loading} /> : <Navigate to="/" />} />
            
            <Route path="/tenders/:id" element={<TenderDetail selectedTender={tenderMethods.selectedTender} bids={tenderMethods.bids} loading={tenderMethods.loading} account={account} isMember={isMember} isRegisteredVendor={isRegisteredVendor} contract={contract} onBack={() => navigate('/tenders')} onStartVoting={tenderMethods.startVoting} votingDaysInput={tenderMethods.votingDaysInput} setVotingDaysInput={tenderMethods.setVotingDaysInput} onCastVote={tenderMethods.castVote} bidForm={tenderMethods.bidForm} setBidForm={tenderMethods.setBidForm} onSubmitBid={tenderMethods.submitBid} getIPFSUrl={null} onCancelTender={tenderMethods.cancelTender} onFinalizeTender={tenderMethods.finalizeTender} onFulfillTender={tenderMethods.fulfillTender} onUpdateIPFSCID={tenderMethods.updateTenderIPFSCID} />} />
            
            <Route path="/vendor/register" element={<VendorRegistration account={account} isRegisteredVendor={isRegisteredVendor} myApplicationStatus={myApplicationStatus} vendorApplicationForm={tenderMethods.vendorApplicationForm} setVendorApplicationForm={tenderMethods.setVendorApplicationForm} onSubmit={() => tenderMethods.submitVendorApplication()} loading={tenderMethods.loading} onNavigate={handleNavigate} />} />
            
            <Route path="/vendor/approvals" element={isMember ? <VendorApproval vendorApplications={tenderMethods.vendorApplications} loading={tenderMethods.loading} onApprove={tenderMethods.approveVendorApplication} onReject={tenderMethods.rejectVendorApplication} onRevoke={tenderMethods.revokeVendorStatus} onLoad={tenderMethods.loadVendorApplications} isMember={isMember} /> : <Navigate to="/" />} />
            
            <Route path="/reports" element={isMember ? <Reports tenders={tenderMethods.allTenders} contract={contract} account={account} /> : <Navigate to="/" />} />
            
            <Route path="/settings" element={<Settings account={account} isMember={isMember} userRole={userRole} isRegisteredVendor={isRegisteredVendor} myApplicationStatus={myApplicationStatus} contract={contract} loading={tenderMethods.loading} setLoading={() => {}} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      
      {tenderMethods.loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Spracovanie transakcie...</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Toasts Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => {
          const meta = NOTIF_ICONS[toast.type] || NOTIF_ICONS.tender_created;
          const Icon = meta.icon;
          return (
            <div
              key={toast.toastId}
              className="pointer-events-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in transform hover:-translate-y-0.5 transition-all duration-300 border-l-4 border-l-purple-500"
            >
              <div className={`mt-0.5 p-2 rounded-lg ${meta.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {toast.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setActiveToasts((prev) => prev.filter((t) => t.toastId !== toast.toastId))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors self-start p-1"
                aria-label="Zatvoriť"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <MainAppContent />
      </Router>
    </WalletProvider>
  );
}