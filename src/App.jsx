import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { WalletProvider, WalletContext } from './context/WalletContext';
import { useTenderContract } from './hooks/useTenderContract';

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

function MainAppContent() {
  const { account, contract, isMember, isRegisteredVendor, userRole, myApplicationStatus, connectWallet, disconnectWallet } = useContext(WalletContext);
  const tenderMethods = useTenderContract(contract, account, isMember);
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