import React, { useState, useEffect } from 'react';
import { Wallet, FileText, Vote, Trophy, Plus, Search, Users, TrendingUp, Shield, ShoppingBag, Eye, Filter } from 'lucide-react';

const CONTRACT_ADDRESS = "0x1110210A92b2C7069524FB4834F7932dedcab6eb";
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidId","type":"uint256"},{"indexed":false,"internalType":"address","name":"vendor","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"BidSubmitted","type":"event"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_bidId","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_maxBudget","type":"uint256"},{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_ipfsCID","type":"string"}],"name":"createTender","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"finalizeTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"fulfillTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint8","name":"_role","type":"uint8"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_daysUntilDeadline","type":"uint256"}],"name":"publishTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"registerAsVendor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_votingDays","type":"uint256"}],"name":"startVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_deliveryTime","type":"uint256"},{"internalType":"string","name":"_description","type":"string"}],"name":"submitBid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winningBidId","type":"uint256"}],"name":"TenderCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"}],"name":"TenderCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"vendor","type":"address"}],"name":"VendorRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidId","type":"uint256"},{"indexed":false,"internalType":"address","name":"voter","type":"address"}],"name":"VoteCasted","type":"event"},{"inputs":[],"name":"bidCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getBidCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getTender","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"maxBudget","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"votingDeadline","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"internalType":"struct MicroTender.Tender","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getTenderBids","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"tenderId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"deliveryTime","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"}],"internalType":"struct MicroTender.Bid[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserRole","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_bidId","type":"uint256"}],"name":"getVoteCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getWinningBid","outputs":[{"internalType":"uint256","name":"bidId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"votes","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"hasVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"isRegisteredVendor","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"registeredVendors","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tenderBids","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"tenderId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"deliveryTime","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tenderCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tenders","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"maxBudget","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"votingDeadline","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRoles","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"voteCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_wei","type":"uint256"}],"name":"weiToEther","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"}]

// Názvy stavov
const STATUS_NAMES = ['Koncept', 'Aktívny', 'Hlasovanie', 'Ukončený', 'Splnený', 'Zrušený'];
const STATUS_COLORS = {
  'Koncept': 'bg-gray-500',
  'Aktívny': 'bg-green-500',
  'Hlasovanie': 'bg-blue-500',
  'Ukončený': 'bg-purple-500',
  'Splnený': 'bg-emerald-500',
  'Zrušený': 'bg-red-500'
};

// Role zo smart kontraktu
const USER_ROLES = {
  MEMBER: 0,      // Člen rady - môže vytvárať tendry a hlasovať
  ADMIN: 1        // Admin - môže spravovať role
};

// Približný kurz pre konverziu (EUR)
const ETH_TO_EUR = 1800;

export default function MicroTenderApp() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [allTenders, setAllTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bids, setBids] = useState([]);
  
  // Role stavy
  const [userMode, setUserMode] = useState('guest'); // 'guest', 'council', 'vendor'
  const [userRole, setUserRole] = useState(null); // Rola z kontraktu (0=Member, 1=Admin)
  const [isMember, setIsMember] = useState(false); // Či je používateľ člen rady
  
  // Filtrovanie
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Formuláre
  const [createForm, setCreateForm] = useState({ 
    title: '', 
    description: '',
    budget: '', 
    category: '',
    daysOpen: '7',      // Koľko dní bude tender otvorený pre ponuky
    votingDays: '3'     // Koľko dní bude trvať hlasovanie
  });
  const [bidForm, setBidForm] = useState({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
  
  // Stav pre 2-krokové vytváranie
  const [createdTenderId, setCreatedTenderId] = useState(null);
  const [creationStep, setCreationStep] = useState(1); // 1 = draft, 2 = publish

  // Načítanie roly používateľa z kontraktu
  useEffect(() => {
    if (contract && account) {
      loadUserRole();
    }
  }, [contract, account]);

  const loadUserRole = async () => {
    try {
      const role = await contract.getUserRole(account);
      const roleNumber = role.toNumber ? role.toNumber() : Number(role);
      setUserRole(roleNumber);
      
      // Skontrolujeme či je člen rady (Member alebo Admin)
      const isCouncilMember = roleNumber >= USER_ROLES.MEMBER;
      setIsMember(isCouncilMember);
      
      // Ak je člen rady, nastavíme režim council, inak vendor
      if (isCouncilMember) {
        setUserMode('council');
      } else {
        setUserMode('vendor');
      }
      
      console.log('User role:', roleNumber, 'Is member:', isCouncilMember);
    } catch (error) {
      console.error('Chyba pri načítavaní roly:', error);
      // Ak nie je v kontrakte, je to vendor (bez roly)
      setUserRole(null);
      setIsMember(false);
      setUserMode('vendor');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Prosím, nainštalujte MetaMask!');
      return;
    }

    try {
      setLoading(true);
      const { ethers } = window;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setAccount(address);
      setContract(contractInstance);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba pripojenia: ' + error.message);
      setLoading(false);
    }
  };

  const loadAllTenders = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const count = await contract.tenderCounter();
      const tendersData = [];
      
      for (let i = 1; i <= count.toNumber(); i++) {
        try {
          const tender = await contract.getTender(i);
          tendersData.push({
            id: tender.id.toString(),
            creator: tender.creator,
            title: tender.title,
            maxBudget: parseFloat(window.ethers.utils.formatEther(tender.maxBudget)),
            category: tender.category,
            status: STATUS_NAMES[tender.status],
            statusIndex: tender.status,
            deadline: tender.deadline.toString(),
            votingDeadline: tender.votingDeadline.toString(),
            createdAt: tender.createdAt.toString()
          });
        } catch (err) {
          console.log(`Tender ${i} nebol nájdený:`, err);
        }
      }
      
      setAllTenders(tendersData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const createTender = async () => {
    if (!contract) return;
    if (!isMember) {
      alert('❌ Iba členovia rady môžu vytvárať tendry!');
      return;
    }
    
    try {
      setLoading(true);
      const budgetInETH = parseFloat(createForm.budget) / ETH_TO_EUR;
      const budgetInWei = window.ethers.utils.parseEther(budgetInETH.toString());
      
      // KROK 1: Vytvoriť draft
      // IPFS CID bude pridaný neskôr (zatiaľ prázdny string)
      const tx = await contract.createTender(
        createForm.title,
        createForm.description || '',  // Popis tendru
        budgetInWei,
        createForm.category,
        ''  // IPFS CID - zatiaľ prázdny, bude pridaný neskôr
      );
      const receipt = await tx.wait();
      
      // Získať ID tendru z eventu
      const event = receipt.events?.find(e => e.event === 'TenderCreated');
      const tenderId = event?.args?.tenderId?.toString();
      
      setCreatedTenderId(tenderId);
      setCreationStep(2);
      
      alert(`✅ Koncept tendru vytvorený! ID: ${tenderId}\n\nTeraz ho uverejnite v kroku 2.`);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };
  
  const publishTender = async () => {
    if (!contract || !createdTenderId) return;
    
    try {
      setLoading(true);
      
      // KROK 2: Publikovať tender
      const tx = await contract.publishTender(
        createdTenderId,
        parseInt(createForm.daysOpen)
      );
      await tx.wait();
      
      alert(`✅ Tender bol uverejnený!\n\nOtvorený pre ponuky na ${createForm.daysOpen} dní.`);
      
      // Reset formulára
      setCreateForm({ 
        title: '', 
        description: '',
        budget: '', 
        category: '',
        daysOpen: '7',
        votingDays: '3'
      });
      setCreatedTenderId(null);
      setCreationStep(1);
      loadAllTenders();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  const getTenderDetails = async (id) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tender = await contract.getTender(id);
      const bidsData = await contract.getTenderBids(id);
      
      setSelectedTender({
        id: tender.id.toString(),
        creator: tender.creator,
        title: tender.title,
        description: tender.description || '',
        maxBudget: parseFloat(window.ethers.utils.formatEther(tender.maxBudget)),
        category: tender.category,
        ipfsCID: tender.ipfsCID || '',
        status: STATUS_NAMES[tender.status],
        statusIndex: tender.status,
        deadline: tender.deadline.toString(),
        votingDeadline: tender.votingDeadline.toString()
      });
      
      setBids(bidsData.map(b => ({
        id: b.id.toString(),
        tenderId: b.tenderId.toString(),
        vendor: b.vendor,
        price: parseFloat(window.ethers.utils.formatEther(b.price)),
        deliveryTime: b.deliveryTime.toString(),
        description: b.description,
        submittedAt: b.submittedAt.toString()
      })));
      
      setActiveTab('viewTender');
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba pri načítavaní tendru: ' + error.message);
      setLoading(false);
    }
  };

  const registerAsVendor = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.registerAsVendor();
      await tx.wait();
      alert('✅ Úspešne ste sa zaregistrovali ako dodávateľ!');
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  const submitBid = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      
      // Skontrolovať či je používateľ registrovaný ako dodávateľ
      const isVendor = await contract.isRegisteredVendor(account);
      if (!isVendor) {
        alert('❌ Musíte sa najprv zaregistrovať ako dodávateľ!');
        setLoading(false);
        return;
      }
      
      const priceInETH = parseFloat(bidForm.priceEUR) / ETH_TO_EUR;
      const priceInWei = window.ethers.utils.parseEther(priceInETH.toString());
      
      const tx = await contract.submitBid(
        bidForm.tenderId,
        priceInWei,
        bidForm.deliveryTime,
        bidForm.description
      );
      await tx.wait();
      alert('✅ Ponuka bola úspešne podaná!');
      setBidForm({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  const castVote = async (tenderId, bidId) => {
    if (!contract) return;
    if (!isMember) {
      alert('❌ Iba členovia rady môžu hlasovať!');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.castVote(tenderId, bidId);
      await tx.wait();
      alert('✅ Hlas bol prijatý!');
      getTenderDetails(tenderId);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  // Funkcia na prepnutie režimu - OMEN IBA pre členov rady
  const handleModeSwitch = (newMode) => {
    if (!isMember && (newMode === 'council')) {
      alert('❌ Iba členovia študentskej rady môžu používať tento režim!');
      return;
    }
    setUserMode(newMode);
  };

  // Filtrovanie tendrov
  const getFilteredTenders = () => {
    let filtered = allTenders;
    
    if (statusFilter === 'active') {
      filtered = filtered.filter(t => t.statusIndex === 1);
    } else if (statusFilter === 'voting') {
      filtered = filtered.filter(t => t.statusIndex === 2);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(t => t.statusIndex === 3 || t.statusIndex === 4);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Získanie info o režime
  const getModeInfo = () => {
    switch(userMode) {
      case 'council':
        return { 
          name: 'Člen študentskej rady', 
          icon: Shield, 
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20'
        };
      case 'vendor':
        return { 
          name: 'Režim predajcu', 
          icon: ShoppingBag, 
          color: 'text-green-400',
          bgColor: 'bg-green-500/20'
        };
      default:
        return { 
          name: 'Režim hosťa', 
          icon: Eye, 
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20'
        };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animované pozadie - PÔVODNÉ! */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                MicroTender
              </span>
              <span className="px-3 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-xs">
                Polygon Amoy
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Indikátor režimu */}
              {account && (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${modeInfo.bgColor} border border-white/20 backdrop-blur-sm`}>
                  <ModeIcon className={`w-5 h-5 ${modeInfo.color}`} />
                  <span className="text-sm font-medium">{modeInfo.name}</span>
                  {isMember && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 rounded text-xs">Overený člen</span>
                  )}
                </div>
              )}

              {/* Prepínač režimov - OMEZNENÝ! */}
              {account && (
                <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => handleModeSwitch('guest')}
                    className={`p-2 rounded-md text-sm transition-all ${
                      userMode === 'guest' 
                        ? 'bg-white/20 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Režim hosťa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleModeSwitch('council')}
                    disabled={!isMember}
                    className={`p-2 rounded-md text-sm transition-all ${
                      userMode === 'council' 
                        ? 'bg-blue-500/30 text-blue-300' 
                        : isMember
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 opacity-50 cursor-not-allowed'
                    }`}
                    title={isMember ? "Člen rady" : "Iba pre členov rady"}
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleModeSwitch('vendor')}
                    className={`p-2 rounded-md text-sm transition-all ${
                      userMode === 'vendor' 
                        ? 'bg-green-500/30 text-green-300' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Predajca"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Pripojenie peňaženky */}
              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 disabled:opacity-50"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Pripojiť peňaženku</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-300">
                    {account.substring(0, 6)}...{account.substring(38)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigácia */}
      {account && (
        <nav className="relative border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-6 py-3 rounded-lg transition-all font-medium ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Domov
              </button>
              <button
                onClick={() => { setActiveTab('browse'); loadAllTenders(); }}
                className={`px-6 py-3 rounded-lg transition-all font-medium ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Prehľad tendrov
              </button>
              {(userMode === 'council' && isMember) && (
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-3 rounded-lg transition-all font-medium ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Vytvoriť tender
                </button>
              )}
              {(userMode === 'vendor') && (
                <button
                  onClick={() => setActiveTab('submitBid')}
                  className={`px-6 py-3 rounded-lg transition-all font-medium ${
                    activeTab === 'submitBid'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Podať ponuku
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Hlavný obsah */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!account ? (
          <div className="text-center space-y-12 py-20">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Web3 Procurement
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Decentralizovaný systém výberových konaní založený na smart kontraktoch. Transparentný, bezpečný, demokratický.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Vytváranie výberových konaní</h3>
                <p className="text-gray-400">Zverejňujte požiadavky na nákup na blockchaine s úplnou transparentnosťou.</p>
              </div>
              
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Demokratické hlasovanie</h3>
                <p className="text-gray-400">Komunita férovo hlasuje za najlepšiu ponuku.</p>
              </div>
              
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-pink-500/30 hover:border-pink-500/60 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Nemenné záznamy</h3>
                <p className="text-gray-400">Všetky rozhodnutia sú trvalo zaznamenané v blockchaine.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Domov */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Ovládací panel
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Aktuálny režim: <span className={modeInfo.color}>{modeInfo.name}</span>
                  </p>
                  {userRole !== null && (
                    <p className="text-sm text-gray-400">
                      Rola v kontrakte: {userRole === USER_ROLES.ADMIN ? 'Admin' : userRole === USER_ROLES.MEMBER ? 'Člen' : 'Žiadna'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl p-6 border border-cyan-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Aktívne tendry</p>
                        <p className="text-3xl font-bold mt-2">{allTenders.filter(t => t.statusIndex === 1).length}</p>
                      </div>
                      <FileText className="w-12 h-12 text-cyan-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">V hlasovaní</p>
                        <p className="text-3xl font-bold mt-2">{allTenders.filter(t => t.statusIndex === 2).length}</p>
                      </div>
                      <Vote className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl p-6 border border-pink-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Ukončené</p>
                        <p className="text-3xl font-bold mt-2">{allTenders.filter(t => t.statusIndex >= 3).length}</p>
                      </div>
                      <Trophy className="w-12 h-12 text-pink-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={loadAllTenders}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-cyan-500/50 hover:shadow-xl"
                  >
                    Načítať všetky tendry
                  </button>
                </div>
              </div>
            )}

            {/* Prehľad tendrov */}
            {activeTab === 'browse' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Prehľad tendrov
                </h2>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Hľadať podľa názvu alebo kategórie..."
                        className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="all">Všetky tendry</option>
                      <option value="active">Aktívne</option>
                      <option value="voting">V hlasovaní</option>
                      <option value="completed">Ukončené</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredTenders().map((tender) => (
                    <div
                      key={tender.id}
                      className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all cursor-pointer transform hover:scale-105"
                      onClick={() => getTenderDetails(tender.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold flex-1 pr-2">{tender.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[tender.status]} whitespace-nowrap`}>
                          {tender.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          <span className="text-gray-400">Kategória:</span> {tender.category}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Rozpočet:</span> {(tender.maxBudget * ETH_TO_EUR).toFixed(2)} €
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">ID:</span> #{tender.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {getFilteredTenders().length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 text-lg">Neboli nájdené žiadne tendry</p>
                  </div>
                )}
              </div>
            )}

            {/* Vytvoriť tender */}
            {activeTab === 'create' && userMode === 'council' && isMember && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Plus className="w-8 h-8 text-cyan-400" />
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Vytvoriť nový tender
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${creationStep >= 1 ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                        1
                      </div>
                      <div className="w-8 h-0.5 bg-gray-600"></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${creationStep >= 2 ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                        2
                      </div>
                    </div>
                  </div>

                  {creationStep === 1 ? (
                    // KROK 1: Základné informácie
                    <div className="space-y-6">
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-cyan-300">
                          <strong>Krok 1:</strong> Vytvorte koncept tendru so základnými informáciami
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Názov tendru <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={createForm.title}
                          onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                          placeholder="Napríklad: Nákup 50 markerov pre študentov"
                          className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Popis tendru
                        </label>
                        <textarea
                          value={createForm.description}
                          onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                          placeholder="Podrobný popis čo potrebujete..."
                          rows="4"
                          className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Maximálny rozpočet (EUR) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={createForm.budget}
                          onChange={(e) => setCreateForm({...createForm, budget: e.target.value})}
                          placeholder="1000"
                          className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          ≈ {createForm.budget ? (parseFloat(createForm.budget) / ETH_TO_EUR).toFixed(4) : '0'} ETH
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Kategória <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={createForm.category}
                          onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                          className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm"
                        >
                          <option value="">Vyberte kategóriu</option>
                          <option value="Kancelárske potreby">Kancelárske potreby</option>
                          <option value="Technológie">Technológie</option>
                          <option value="Nábytok">Nábytok</option>
                          <option value="Služby">Služby</option>
                          <option value="Podujatia">Podujatia</option>
                          <option value="Iné">Iné</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Dní otvorený pre ponuky <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            min="3"
                            max="30"
                            value={createForm.daysOpen}
                            onChange={(e) => setCreateForm({...createForm, daysOpen: e.target.value})}
                            className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Min: 3, Max: 30 dní</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Dní na hlasovanie
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="14"
                            value={createForm.votingDays}
                            onChange={(e) => setCreateForm({...createForm, votingDays: e.target.value})}
                            className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Pre neskoršie použitie</p>
                        </div>
                      </div>

                      <button
                        onClick={createTender}
                        disabled={loading || !createForm.title || !createForm.budget || !createForm.category}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-cyan-500/50 hover:shadow-xl disabled:opacity-50"
                      >
                        {loading ? 'Vytváram koncept...' : 'Vytvoriť koncept tendru'}
                      </button>
                    </div>
                  ) : (
                    // KROK 2: Publikovanie
                    <div className="space-y-6">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-green-300">
                          <strong>Krok 2:</strong> Uverejnite tender a otvorte ho pre ponuky
                        </p>
                      </div>

                      <div className="bg-black/20 rounded-xl p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-cyan-400">Prehľad tendru</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-400">ID:</span> #{createdTenderId}</p>
                          <p><span className="text-gray-400">Názov:</span> {createForm.title}</p>
                          <p><span className="text-gray-400">Rozpočet:</span> ${createForm.budget}</p>
                          <p><span className="text-gray-400">Kategória:</span> {createForm.category}</p>
                          <p><span className="text-gray-400">Otvorený:</span> {createForm.daysOpen} dní</p>
                        </div>
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-sm text-yellow-300">
                          ⚠️ Po uverejnení už nebude možné zmeniť základné informácie tendru!
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setCreationStep(1);
                            setCreatedTenderId(null);
                          }}
                          className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-medium transition-all"
                        >
                          ← Späť na úpravu
                        </button>
                        <button
                          onClick={publishTender}
                          disabled={loading}
                          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/50 hover:shadow-xl disabled:opacity-50"
                        >
                          {loading ? 'Uverejňujem...' : '✅ Uverejniť tender'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Podať ponuku */}
            {activeTab === 'submitBid' && userMode === 'vendor' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <ShoppingBag className="w-8 h-8 text-green-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Podať ponuku na tender
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {/* Registrácia dodávateľa */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-sm text-yellow-300 mb-3">
                        ⚠️ Pred podaním ponuky sa musíte zaregistrovať ako dodávateľ
                      </p>
                      <button
                        onClick={registerAsVendor}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-yellow-500/50 hover:shadow-xl disabled:opacity-50"
                      >
                        {loading ? 'Registrujem...' : '📝 Zaregistrovať sa ako dodávateľ'}
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">ID tendru</label>
                      <input
                        type="number"
                        value={bidForm.tenderId}
                        onChange={(e) => setBidForm({...bidForm, tenderId: e.target.value})}
                        placeholder="1"
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Vaša cena (EUR)</label>
                      <input
                        type="number"
                        value={bidForm.priceEUR}
                        onChange={(e) => setBidForm({...bidForm, priceEUR: e.target.value})}
                        placeholder="500"
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors backdrop-blur-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        ≈ {bidForm.priceEUR ? (parseFloat(bidForm.priceEUR) / ETH_TO_EUR).toFixed(4) : '0'} ETH
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Lehota dodania (dní)</label>
                      <input
                        type="number"
                        value={bidForm.deliveryTime}
                        onChange={(e) => setBidForm({...bidForm, deliveryTime: e.target.value})}
                        placeholder="7"
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Popis ponuky</label>
                      <textarea
                        value={bidForm.description}
                        onChange={(e) => setBidForm({...bidForm, description: e.target.value})}
                        placeholder="Opíšte vašu ponuku..."
                        rows="4"
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors resize-none backdrop-blur-sm"
                      />
                    </div>
                    <button
                      onClick={submitBid}
                      disabled={loading || !bidForm.tenderId || !bidForm.priceEUR || !bidForm.deliveryTime}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/50 hover:shadow-xl disabled:opacity-50"
                    >
                      {loading ? 'Odosielanie...' : 'Podať ponuku'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Detail tendru */}
            {activeTab === 'viewTender' && selectedTender && (
              <div className="space-y-6">
                <button
                  onClick={() => setActiveTab('browse')}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  ← Späť na zoznam
                </button>

                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {selectedTender.title}
                      </h2>
                      <p className="text-gray-300">Kategória: {selectedTender.category}</p>
                      {selectedTender.description && (
                        <div className="mt-4 p-4 bg-black/20 rounded-xl">
                          <p className="text-gray-300 text-sm">{selectedTender.description}</p>
                        </div>
                      )}
                      {selectedTender.ipfsCID && (
                        <div className="mt-2">
                          <a 
                            href={`https://ipfs.io/ipfs/${selectedTender.ipfsCID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                          >
                            📄 Zobraziť dokument z IPFS
                          </a>
                        </div>
                      )}
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[selectedTender.status]}`}>
                      {selectedTender.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl p-4 border border-cyan-500/30">
                      <p className="text-gray-400 text-sm mb-1">Maximálny rozpočet</p>
                      <p className="text-2xl font-bold">{(selectedTender.maxBudget * ETH_TO_EUR).toFixed(2)} €</p>
                      <p className="text-xs text-gray-400 mt-1">≈ {selectedTender.maxBudget.toFixed(4)} ETH</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                      <p className="text-gray-400 text-sm mb-1">Počet ponúk</p>
                      <p className="text-2xl font-bold">{bids.length}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Prijaté ponuky</h3>
                    {bids.length === 0 ? (
                      <p className="text-gray-400 text-center py-8 bg-black/20 rounded-xl">
                        Zatiaľ neboli podané žiadne ponuky
                      </p>
                    ) : (
                      bids.map((bid) => (
                        <div key={bid.id} className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <p className="text-lg font-semibold text-cyan-400 mb-2">
                                {(bid.price * ETH_TO_EUR).toFixed(2)} €
                              </p>
                              <p className="text-sm text-gray-400">Dodanie: {bid.deliveryTime} dní</p>
                              <p className="text-sm text-gray-400">Ponuka #{bid.id}</p>
                            </div>
                            {userMode === 'council' && isMember && selectedTender.statusIndex === 2 && (
                              <button
                                onClick={() => castVote(selectedTender.id, bid.id)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all font-medium"
                              >
                                Hlasovať
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{bid.description}</p>
                          <p className="text-xs text-gray-500">
                            Predajca: {bid.vendor.substring(0, 6)}...{bid.vendor.substring(38)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium">Spracovanie transakcie...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}