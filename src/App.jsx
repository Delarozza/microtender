import React, { useState, useEffect, useRef } from 'react';
import { Wallet, FileText, Vote, TrendingUp, Shield, ShoppingBag, Eye } from 'lucide-react';
import { uploadToIPFS, getIPFSUrl } from './utils/pinata';
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

const CONTRACT_ADDRESS = "0xC5EA6607B52EBBbFFBac26b9b68594357720ab75";
const CHAIN_ID_AMOY = 80002; // Polygon Amoy testnet
const AMOY_RPC = "https://rpc-amoy.polygon.technology/";
const AMOY_RPC_FALLBACK = "https://polygon-amoy-bor-rpc.publicnode.com";
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidId","type":"uint256"},{"indexed":false,"internalType":"address","name":"vendor","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"BidSubmitted","type":"event"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_bidId","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_maxBudget","type":"uint256"},{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_ipfsCID","type":"string"}],"name":"createTender","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"finalizeTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"fulfillTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint8","name":"_role","type":"uint8"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_daysUntilDeadline","type":"uint256"}],"name":"publishTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"registerAsVendor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_companyName","type":"string"},{"internalType":"string","name":"_contactInfo","type":"string"},{"internalType":"string","name":"_description","type":"string"}],"name":"submitVendorApplication","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_applicationId","type":"uint256"}],"name":"approveVendorApplication","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_applicationId","type":"uint256"}],"name":"rejectVendorApplication","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_applicationId","type":"uint256"}],"name":"getVendorApplication","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"applicant","type":"address"},{"internalType":"string","name":"companyName","type":"string"},{"internalType":"string","name":"contactInfo","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MicroTender.VendorApplication","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"getVendorApplicationByAddress","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"applicant","type":"address"},{"internalType":"string","name":"companyName","type":"string"},{"internalType":"string","name":"contactInfo","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MicroTender.VendorApplication","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"getVendorApplicationStatus","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vendorApplicationCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_votingDays","type":"uint256"}],"name":"startVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_deliveryTime","type":"uint256"},{"internalType":"string","name":"_description","type":"string"}],"name":"submitBid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winningBidId","type":"uint256"}],"name":"TenderCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"}],"name":"TenderCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"vendor","type":"address"}],"name":"VendorRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"applicationId","type":"uint256"},{"indexed":true,"internalType":"address","name":"applicant","type":"address"},{"indexed":false,"internalType":"string","name":"companyName","type":"string"}],"name":"VendorApplicationSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"applicationId","type":"uint256"},{"indexed":true,"internalType":"address","name":"vendor","type":"address"}],"name":"VendorApplicationApproved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"applicationId","type":"uint256"},{"indexed":true,"internalType":"address","name":"applicant","type":"address"}],"name":"VendorApplicationRejected","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidId","type":"uint256"},{"indexed":false,"internalType":"address","name":"voter","type":"address"}],"name":"VoteCasted","type":"event"},{"inputs":[],"name":"bidCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getBidCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getTender","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"maxBudget","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"votingDeadline","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"internalType":"struct MicroTender.Tender","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getTenderBids","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"tenderId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"deliveryTime","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"}],"internalType":"struct MicroTender.Bid[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserRole","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_bidId","type":"uint256"}],"name":"getVoteCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getWinningBid","outputs":[{"internalType":"uint256","name":"bidId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"votes","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"hasVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"isRegisteredVendor","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"revokeVendorStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"registeredVendors","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tenderBids","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"tenderId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"deliveryTime","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tenderCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tenders","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"maxBudget","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"votingDeadline","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRoles","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"voteCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_wei","type":"uint256"}],"name":"weiToEther","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"}]

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
  const [allTenders, setAllTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bids, setBids] = useState([]);
  
  // Role stavy (rola z kontraktu podľa pripojenej peňaženky)
  const [userRole, setUserRole] = useState(null); // Rola z kontraktu (0=Member, 1=Admin)
  const [isMember, setIsMember] = useState(false); // Či je používateľ člen rady
  

  // Formuláre
  const [createForm, setCreateForm] = useState({ 
    title: '', 
    description: '',
    budget: '', 
    category: '',
    daysOpen: '7',      // Koľko dní bude tender otvorený pre ponuky
    votingDays: '3'     // Koľko dní bude trvať hlasovanie
  });
  
  // IPFS stav
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsCID, setIpfsCID] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bidForm, setBidForm] = useState({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
  
  // Stav pre 2-krokové vytváranie
  const [createdTenderId, setCreatedTenderId] = useState(null);
  const [creationStep, setCreationStep] = useState(1); // 1 = draft, 2 = publish
  
  // Vendor application state
  const [vendorApplicationForm, setVendorApplicationForm] = useState({
    companyName: '',
    contactInfo: '',
    description: ''
  });
  const [vendorApplications, setVendorApplications] = useState([]);
  const [myApplicationStatus, setMyApplicationStatus] = useState(null);
  const [isRegisteredVendor, setIsRegisteredVendor] = useState(false);
  const [votingDaysInput, setVotingDaysInput] = useState('3'); // dni na hlasovanie pri predčasnom spustení
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountRef = useRef(account);

  // Súlad UI s aktuálnym účtom (pri zmene / odpojení)
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  // Ekrány len pre členov rady — bez peňaženky alebo bez roly sa k nim nesmie
  const COUNCIL_ONLY_SCREENS = ['Nový tender', 'Moje tendery', 'Hlasovanie', 'Reporty', 'Žiadosti dodávateľov'];
  const canAccessCouncilScreens = Boolean(account && isMember);

  // Read-only kontrakt pre prezeranie tenderov bez pripojenej peňaženky
  useEffect(() => {
    if (!account && typeof window !== 'undefined' && window.ethers) {
      const ethers = window.ethers;
      const tryRpc = (rpcUrl) => {
        try {
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        } catch (_) {
          return null;
        }
      };
      const c = tryRpc(AMOY_RPC) || tryRpc(AMOY_RPC_FALLBACK);
      if (c) setContract(c);
      else console.error('Read-only contract init: RPC nedostupný');
    }
  }, [account]);

  // Bez peňaženky alebo bez roly rady: ak je aktuálna obrazovka len pre rad, presmeruj na Dashboard
  useEffect(() => {
    if (COUNCIL_ONLY_SCREENS.includes(activeScreen) && !canAccessCouncilScreens) {
      setActiveScreen('Dashboard');
    }
  }, [activeScreen, canAccessCouncilScreens]);

  // Reakcia na zmenu účtu / odpojenie v MetaMask
  useEffect(() => {
    if (!window.ethereum || !window.ethers) return;
    const ethers = window.ethers;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setAccount('');
        setContract(null);
        return;
      }
      const newAddress = accounts[0];
      if (newAddress === account) return;
      (async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          setAccount(address);
          setContract(contractInstance);
        } catch (e) {
          console.error('AccountsChanged reconnect:', e);
          setAccount('');
          setContract(null);
        }
      })();
    };

    const handleDisconnect = () => {
      setAccount('');
      setContract(null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('disconnect', handleDisconnect);
    };
  }, [account]);

  // Načítanie roly používateľa z kontraktu
  useEffect(() => {
    if (contract && account) {
      setMyApplicationStatus(null);
      loadUserRole();
    }
  }, [contract, account]);

  const loadUserRole = async () => {
    const accountToLoad = account;
    if (!contract || !accountToLoad) return;
    try {
      const [role, hasRoleFlag] = await Promise.all([
        contract.getUserRole(accountToLoad),
        contract.hasRole(accountToLoad),
      ]);
      const roleNumber = role.toNumber ? role.toNumber() : Number(role);
      const hasCouncilRole = Boolean(hasRoleFlag);
      // V kontrakte je enum UserRole { Member, Admin } — neudelená rola má default 0 (Member).
      // Člen rady je len ten, komu owner výslovne udelil rolu (hasRole === true a role >= Member).
      const isCouncilMember = hasCouncilRole && roleNumber >= USER_ROLES.MEMBER;

      if (accountRef.current !== accountToLoad) return;

      setUserRole(roleNumber);
      setIsMember(isCouncilMember);

      await checkMyApplicationStatus();
      if (accountRef.current !== accountToLoad) return;

      console.log('User role:', roleNumber, 'hasRole:', hasCouncilRole, 'Is member:', isCouncilMember);
    } catch (error) {
      console.error('Chyba pri načítavaní roly:', error);
      if (accountRef.current !== accountToLoad) return;
      setUserRole(null);
      setIsMember(false);
    }
  };

  const isRpcError = (msg) =>
    msg && (String(msg).includes('JSON-RPC') || String(msg).includes('Internal'));

  const requestSwitchToAmoy = async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID_AMOY.toString(16)}` }],
      });
      return true;
    } catch (e) {
      if (e.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CHAIN_ID_AMOY.toString(16)}`,
                chainName: 'Polygon Amoy',
                nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                rpcUrls: [AMOY_RPC, AMOY_RPC_FALLBACK],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
          return true;
        } catch (addErr) {
          console.error(addErr);
          return false;
        }
      }
      console.error(e);
      return false;
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

      const network = await provider.getNetwork();
      const chainId = network.chainId ? (typeof network.chainId === 'number' ? network.chainId : network.chainId.toNumber?.() ?? Number(network.chainId)) : 0;
      if (chainId !== CHAIN_ID_AMOY) {
        const switched = await requestSwitchToAmoy();
        if (!switched) {
          alert(
            'Aplikácia beží na sieti Polygon Amoy (Chain ID 80002).\n\n' +
              'V MetaMask prepnite sieť na "Polygon Amoy" alebo pridajte ju v nastaveniach siete (Chain ID 80002, RPC: https://rpc-amoy.polygon.technology/).'
          );
          setLoading(false);
          return;
        }
      }

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setAccount(address);
      setContract(contractInstance);
      setLoading(false);
    } catch (error) {
      console.error(error);
      const msg = error?.message || String(error);
      if (isRpcError(msg)) {
        alert(
          'Chyba siete (Internal JSON-RPC). Skontrolujte:\n\n' +
            '1) Ste v sieti Polygon Amoy? (MetaMask → prepnite sieť)\n' +
            '2) Máte POL na plytinu v tejto sieti?\n' +
            '3) Skúste obnoviť stránku alebo znova pripojiť peňaženku.'
        );
      } else {
        alert('Chyba pripojenia: ' + msg);
      }
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
          let bidCount = 0;
          try {
            const bc = await contract.getBidCount(i);
            bidCount = bc.toNumber ? bc.toNumber() : Number(bc);
          } catch (_) {}
          tendersData.push({
            id: tender.id.toString(),
            creator: tender.creator,
            title: tender.title,
            description: tender.description || '',
            maxBudget: parseFloat(window.ethers.utils.formatEther(tender.maxBudget)),
            category: tender.category,
            status: STATUS_NAMES[tender.status],
            statusIndex: tender.status,
            deadline: tender.deadline.toString(),
            votingDeadline: tender.votingDeadline.toString(),
            createdAt: tender.createdAt.toString(),
            bidCount,
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

  // Загрузка файла в IPFS
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploadingFile(true);
      setUploadProgress(0);
      
      // Симуляция прогресса (в реальности Pinata не предоставляет прогресс через API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const cid = await uploadToIPFS(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIpfsCID(cid);
      setSelectedFile(file);
      
      alert(`✅ Súbor bol úspešne nahraný do IPFS!\nCID: ${cid}`);
    } catch (error) {
      console.error('Chyba nahrávania súboru:', error);
      alert('❌ Chyba nahrávania súboru: ' + error.message);
      setSelectedFile(null);
      setIpfsCID('');
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Автоматически загружаем файл
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIpfsCID('');
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
      // Используем CID если файл был загружен
      const tx = await contract.createTender(
        createForm.title,
        createForm.description || '',  // Popis tendru
        budgetInWei,
        createForm.category,
        ipfsCID || ''  // IPFS CID - используем загруженный CID или пустую строку
      );
      const receipt = await tx.wait();
      
      // Získať ID tendru z eventu
      const event = receipt.events?.find(e => e.event === 'TenderCreated');
      const tenderId = event?.args?.tenderId?.toString();
      
      setCreatedTenderId(tenderId);
      setCreationStep(2);
      
      const message = ipfsCID 
        ? `✅ Koncept tendru vytvorený! ID: ${tenderId}\n\n📄 Dokument bol nahraný do IPFS\nCID: ${ipfsCID}\n\nTeraz ho uverejnite v kroku 2.`
        : `✅ Koncept tendru vytvorený! ID: ${tenderId}\n\nTeraz ho uverejnite v kroku 2.`;
      
      alert(message);
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
      setSelectedFile(null);
      setIpfsCID('');
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
      setBidForm(prev => ({ ...prev, tenderId: id }));
      setActiveScreen('Detail tendra');
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba pri načítavaní tendru: ' + error.message);
      setLoading(false);
    }
  };

  // Подача заявки на регистрацию вендора
  const submitVendorApplication = async () => {
    if (!contract) return;
    if (!vendorApplicationForm.companyName.trim()) {
      alert('❌ Názov spoločnosti je povinný!');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.submitVendorApplication(
        vendorApplicationForm.companyName,
        vendorApplicationForm.contactInfo,
        vendorApplicationForm.description
      );
      await tx.wait();
      alert('✅ Žiadosť bola odoslaná! Čaká na schválenie študentskou radou.');
      setVendorApplicationForm({ companyName: '', contactInfo: '', description: '' });
      await checkMyApplicationStatus();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  // Проверка статуса моей заявки
  const checkMyApplicationStatus = async () => {
    if (!contract || !account) return;
    const accountToLoad = account;
    try {
      const isVendor = await contract.isRegisteredVendor(accountToLoad);
      if (accountRef.current !== accountToLoad) return;
      setIsRegisteredVendor(isVendor);

      try {
        const app = await contract.getVendorApplicationByAddress(accountToLoad);
        const appId = app?.id != null ? (app.id.toNumber ? app.id.toNumber() : Number(app.id)) : 0;
        const applicantAddr = app?.applicant ?? '';
        const zeroAddr = '0x0000000000000000000000000000000000000000';
        const hasNoApplication = appId === 0 || String(applicantAddr).toLowerCase() === zeroAddr.toLowerCase();
        if (accountRef.current !== accountToLoad) return;
        if (hasNoApplication) {
          setMyApplicationStatus(null);
          return;
        }
        const status = app.status;
        setMyApplicationStatus(status);
      } catch (e) {
        if (accountRef.current !== accountToLoad) return;
        setMyApplicationStatus(null);
      }
    } catch (error) {
      console.error('Chyba kontroly statusu žiadosti:', error);
      setMyApplicationStatus(null);
    }
  };

  // Загрузка всех заявок (для совета)
  const loadVendorApplications = async () => {
    if (!contract) return;
    try {
      // Получаем счетчик заявок
      const counter = await contract.vendorApplicationCounter();
      const applications = [];
      
      // Загружаем все заявки
      for (let i = 1; i <= counter.toNumber(); i++) {
        try {
          const app = await contract.getVendorApplication(i);
          if (app.id.toString() !== '0') {
            applications.push({
              id: app.id.toString(),
              applicant: app.applicant,
              companyName: app.companyName,
              contactInfo: app.contactInfo,
              description: app.description,
              submittedAt: app.submittedAt.toString(),
              status: app.status
            });
          }
        } catch (e) {
          // Пропускаем несуществующие заявки
          continue;
        }
      }
      setVendorApplications(applications); // Все заявки (pending, approved, rejected)
    } catch (error) {
      console.error('Chyba načítania žiadostí:', error);
    }
  };

  // Одобрение заявки
  const approveVendorApplication = async (applicationId) => {
    if (!contract) return;
    if (!isMember) {
      alert('❌ Iba členovia rady môžu schvaľovať žiadosti!');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.approveVendorApplication(applicationId);
      await tx.wait();
      alert('✅ Žiadosť bola schválená!');
      await loadVendorApplications();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  // Отозвать статус вендора (для owner или самого вендора)
  const revokeVendorStatus = async (vendorAddress) => {
    if (!contract) return;
    
    if (vendorAddress !== account && !isMember) {
      alert('❌ Iba owner alebo samotný dodávateľ môže odvolať status!');
      return;
    }
    
    if (!window.confirm('Naozaj chcete odvolať status dodávateľa?')) {
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.revokeVendorStatus(vendorAddress);
      await tx.wait();
      alert('✅ Status dodávateľa bol odvolaný.');
      
      // Обновляем статус если это текущий пользователь
      if (vendorAddress === account) {
        await checkMyApplicationStatus();
      } else {
        await loadVendorApplications();
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + error.message);
      setLoading(false);
    }
  };

  // Отклонение заявки
  const rejectVendorApplication = async (applicationId) => {
    if (!contract) return;
    if (!isMember) {
      alert('❌ Iba členovia rady môžu zamietať žiadosti!');
      return;
    }
    
    if (!window.confirm('Naozaj chcete zamietnuť túto žiadosť?')) {
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.rejectVendorApplication(applicationId);
      await tx.wait();
      alert('❌ Žiadosť bola zamietnutá.');
      await loadVendorApplications();
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

  // Predčasné spustenie hlasovania (iba tvorca tendra, keď je tender Aktívny a sú ponuky)
  const startVoting = async (tenderId, votingDays) => {
    if (!contract) return;
    const days = parseInt(votingDays, 10);
    if (isNaN(days) || days < 1 || days > 14) {
      alert('Počet dní na hlasovanie musí byť 1–14.');
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.startVoting(tenderId, days);
      await tx.wait();
      alert('✅ Hlasovanie bolo spustené!');
      getTenderDetails(tenderId);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + (error.reason || error.message));
      setLoading(false);
    }
  };

  // Функция переключения режима удалена - режимы определяются автоматически
  // Для тестирования используйте Remix IDE с разными аккаунтами

  // Načítať tendery pri pripojení kontraktu alebo read-only kontrakte (pre ALT-UI)
  useEffect(() => {
    if (contract) {
      loadAllTenders();
    }
  }, [contract]);

  // Проверка статуса заявки при подключении кошелька (для всех кроме совета)
  useEffect(() => {
    if (contract && account && !isMember) {
      checkMyApplicationStatus();
    }
  }, [contract, account, isMember]);

  const handleNavigate = (screen) => {
    if (COUNCIL_ONLY_SCREENS.includes(screen) && !canAccessCouncilScreens) {
      setActiveScreen('Dashboard');
      return;
    }
    setActiveScreen(screen);
  };
  const handleSelectTender = (id) => {
    getTenderDetails(id);
  };

  return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar
            activeItem={activeScreen}
            onNavigate={(screen) => { handleNavigate(screen); setIsMobileMenuOpen(false); }}
            account={account}
            isMember={isMember}
            isRegisteredVendor={isRegisteredVendor}
          />
        </div>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            activeItem={activeScreen}
            onNavigate={(screen) => { handleNavigate(screen); setIsMobileMenuOpen(false); }}
            account={account}
            isMember={isMember}
            isRegisteredVendor={isRegisteredVendor}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setIsMobileMenuOpen(true)}
            account={account}
            onConnectWallet={connectWallet}
            isMember={isMember}
            isRegisteredVendor={isRegisteredVendor}
          />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {activeScreen === 'Dashboard' && (
              <Dashboard
                onNavigate={handleNavigate}
                tenders={allTenders}
                account={account}
                isMember={isMember}
                isRegisteredVendor={isRegisteredVendor}
              />
            )}
            {activeScreen === 'Nový tender' && (
              <CreateTender
                onNavigate={handleNavigate}
                createForm={createForm}
                setCreateForm={setCreateForm}
                createTender={createTender}
                publishTender={publishTender}
                creationStep={creationStep}
                createdTenderId={createdTenderId}
                loading={loading}
                selectedFile={selectedFile}
                ipfsCID={ipfsCID}
                uploadingFile={uploadingFile}
                uploadProgress={uploadProgress}
                handleFileSelect={handleFileSelect}
                removeFile={removeFile}
                isMember={isMember}
                account={account}
              />
            )}
            {activeScreen === 'Moje tendery' && (
              <MyTenders
                onNavigate={handleNavigate}
                tenders={allTenders}
                account={account}
                onSelectTender={handleSelectTender}
              />
            )}
            {activeScreen === 'Všetky tendery' && (
              <AllTenders
                tenders={allTenders}
                onSelectTender={handleSelectTender}
                onNavigate={handleNavigate}
              />
            )}
            {activeScreen === 'Hlasovanie' && (
              <Voting
                tenders={allTenders}
                contract={contract}
                account={account}
                onVote={castVote}
                loading={loading}
              />
            )}
            {activeScreen === 'Detail tendra' && selectedTender && (
              <TenderDetail
                selectedTender={selectedTender}
                bids={bids}
                loading={loading}
                account={account}
                isMember={isMember}
                isRegisteredVendor={isRegisteredVendor}
                onBack={() => handleNavigate('Všetky tendery')}
                onStartVoting={startVoting}
                votingDaysInput={votingDaysInput}
                setVotingDaysInput={setVotingDaysInput}
                onCastVote={castVote}
                bidForm={bidForm}
                setBidForm={setBidForm}
                onSubmitBid={submitBid}
                getIPFSUrl={getIPFSUrl}
              />
            )}
            {activeScreen === 'Registrácia dodávateľa' && (
              <VendorRegistration
                account={account}
                isRegisteredVendor={isRegisteredVendor}
                myApplicationStatus={myApplicationStatus}
                vendorApplicationForm={vendorApplicationForm}
                setVendorApplicationForm={setVendorApplicationForm}
                onSubmit={submitVendorApplication}
                loading={loading}
                onNavigate={handleNavigate}
              />
            )}
            {activeScreen === 'Žiadosti dodávateľov' && (
              <VendorApproval
                vendorApplications={vendorApplications}
                loading={loading}
                onApprove={approveVendorApplication}
                onReject={rejectVendorApplication}
                onRevoke={revokeVendorStatus}
                onLoad={loadVendorApplications}
                isMember={isMember}
              />
            )}
            {activeScreen === 'Reporty' && (
              <div className="p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reporty</h1>
                <p className="text-gray-600 mt-2">Coming Soon</p>
              </div>
            )}
            {activeScreen === 'Nastavenia' && (
              <div className="p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nastavenia</h1>
                <p className="text-gray-600 mt-2">Coming Soon</p>
              </div>
            )}
          </main>
        </div>
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-medium text-gray-700">Spracovanie transakcie...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}