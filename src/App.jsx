import React, { useState, useEffect, useRef } from 'react';

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
import { Settings } from './components/screens/Settings';
import { Reports } from './components/screens/Reports';
import { useNotifications } from './hooks/useNotifications';
import { explorerUrl } from './utils/explorer';

const CONTRACT_ADDRESS = "0x1F8CCE975c9cB052Bf8c6ED04B2a9c614436C5D0";
const CHAIN_ID_AMOY = 80002; // Polygon Amoy testnet
const AMOY_RPC = "https://polygon-amoy.drpc.org";
const AMOY_RPC_FALLBACK = "https://rpc-amoy.polygon.technology/";
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidId","type":"uint256"},{"indexed":false,"internalType":"address","name":"vendor","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"BidSubmitted","type":"event"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_bidId","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_maxBudget","type":"uint256"},{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_ipfsCID","type":"string"}],"name":"createTender","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"finalizeTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"fulfillTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint8","name":"_role","type":"uint8"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_daysUntilDeadline","type":"uint256"}],"name":"publishTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"registerAsVendor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_companyName","type":"string"},{"internalType":"string","name":"_contactInfo","type":"string"},{"internalType":"string","name":"_description","type":"string"}],"name":"submitVendorApplication","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_applicationId","type":"uint256"}],"name":"approveVendorApplication","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_applicationId","type":"uint256"}],"name":"rejectVendorApplication","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_applicationId","type":"uint256"}],"name":"getVendorApplication","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"applicant","type":"address"},{"internalType":"string","name":"companyName","type":"string"},{"internalType":"string","name":"contactInfo","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MicroTender.VendorApplication","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"getVendorApplicationByAddress","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"applicant","type":"address"},{"internalType":"string","name":"companyName","type":"string"},{"internalType":"string","name":"contactInfo","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MicroTender.VendorApplication","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"getVendorApplicationStatus","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vendorApplicationCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_votingDays","type":"uint256"}],"name":"startVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_deliveryTime","type":"uint256"},{"internalType":"string","name":"_description","type":"string"}],"name":"submitBid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winningBidId","type":"uint256"}],"name":"TenderCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"}],"name":"TenderCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"vendor","type":"address"}],"name":"VendorRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"applicationId","type":"uint256"},{"indexed":true,"internalType":"address","name":"applicant","type":"address"},{"indexed":false,"internalType":"string","name":"companyName","type":"string"}],"name":"VendorApplicationSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"applicationId","type":"uint256"},{"indexed":true,"internalType":"address","name":"vendor","type":"address"}],"name":"VendorApplicationApproved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"applicationId","type":"uint256"},{"indexed":true,"internalType":"address","name":"applicant","type":"address"}],"name":"VendorApplicationRejected","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidId","type":"uint256"},{"indexed":false,"internalType":"address","name":"voter","type":"address"}],"name":"VoteCasted","type":"event"},{"inputs":[],"name":"bidCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getBidCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getTender","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"maxBudget","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"votingDeadline","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"internalType":"struct MicroTender.Tender","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getTenderBids","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"tenderId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"deliveryTime","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"}],"internalType":"struct MicroTender.Bid[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserRole","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"uint256","name":"_bidId","type":"uint256"}],"name":"getVoteCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"getWinningBid","outputs":[{"internalType":"uint256","name":"bidId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"votes","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"hasUserVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"hasVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"isRegisteredVendor","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vendor","type":"address"}],"name":"revokeVendorStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"registeredVendors","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tenderBids","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"tenderId","type":"uint256"},{"internalType":"address","name":"vendor","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"deliveryTime","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"submittedAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tenderCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tenders","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"maxBudget","type":"uint256"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"votingDeadline","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRoles","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"voteCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_wei","type":"uint256"}],"name":"weiToEther","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"}],"name":"cancelTender","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tenderId","type":"uint256"},{"internalType":"string","name":"_ipfsCID","type":"string"}],"name":"updateTenderIPFSCID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"}],"name":"TenderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tenderId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newCID","type":"string"}],"name":"IPFSCIDUpdated","type":"event"}]

// Názvy stavov
const STATUS_NAMES = ['Koncept', 'Aktívny', 'Hlasovanie', 'Ukončený', 'Splnený', 'Zrušený'];
// eslint-disable-next-line no-unused-vars
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

function extractRevertReason(error) {
  if (error.reason) return error.reason;
  if (error.error?.reason) return error.error.reason;
  if (error.error?.data?.message) return error.error.data.message;
  if (error.data?.message) return error.data.message;
  const match = error.message?.match(/reason="([^"]+)"/);
  if (match) return match[1];
  const revertMatch = error.message?.match(/reverted with reason string '([^']+)'/);
  if (revertMatch) return revertMatch[1];
  const revertMatch2 = error.message?.match(/revert(?:ed)?:?\s+(.+?)(?:\s*\(|$)/i);
  if (revertMatch2) return revertMatch2[1].trim();
  if (typeof error.message === 'string' && error.message.length < 200) return error.message;
  return 'Transakcia bola odmietnutá kontraktom. Skontrolujte stav tendra a oprávnenia.';
}

// Približný kurz pre konverziu (EUR)
// Prices stored on-chain directly in EUR (no ETH conversion)

function initTheme() {
  if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
}
initTheme();

export default function MicroTenderApp() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allTenders, setAllTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bids, setBids] = useState([]);
  
  // Role stavy (rola z kontraktu podľa pripojenej peňaženky)
  const [userRole, setUserRole] = useState(null); // eslint-disable-line no-unused-vars
  const [isMember, setIsMember] = useState(false); // Či je používateľ člen rady
  

  // Formuláre
  const [createForm, setCreateForm] = useState({ 
    title: '', 
    description: '',
    budget: '', 
    category: 'tlac',
    daysOpen: '7',
    votingDays: '3'
  });
  
  // IPFS stav
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsCID, setIpfsCID] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bidForm, setBidForm] = useState({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
  
  // Stav pre 2-krokové vytváranie
  
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications(contract, account);

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
  }, [activeScreen, canAccessCouncilScreens]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [contract, account]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setUserRole(null);
    setIsMember(false);
    setIsRegisteredVendor(false);
    setMyApplicationStatus(null);
    setActiveScreen('Dashboard');
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

  const createAndPublishTender = async () => {
    if (!contract) return;
    if (!isMember) {
      alert('❌ Iba členovia rady môžu vytvárať tendry!');
      return;
    }
    const days = parseInt(createForm.daysOpen, 10);
    if (isNaN(days) || days < 3 || days > 14) {
      alert('Počet dní na ponuky musí byť 3–14.');
      return;
    }
    const votePlan = parseInt(createForm.votingDays, 10);
    if (isNaN(votePlan) || votePlan < 3 || votePlan > 14) {
      alert('Počet dní na hlasovanie musí byť 3–14 (použije sa pri spustení hlasovania).');
      return;
    }

    let tenderId = null;
    try {
      setLoading(true);
      const budgetInWei = window.ethers.utils.parseEther(createForm.budget);
      const txCreate = await contract.createTender(
        createForm.title,
        createForm.description || '',
        budgetInWei,
        createForm.category,
        ipfsCID || ''
      );
      const receiptCreate = await txCreate.wait();
      const event = receiptCreate.events?.find((e) => e.event === 'TenderCreated');
      tenderId = event?.args?.tenderId?.toString();
      if (!tenderId) {
        throw new Error('Nepodarilo sa získať ID nového tendra z transakcie.');
      }

      const txPublish = await contract.publishTender(tenderId, days);
      const receiptPublish = await txPublish.wait();

      const linkCreate = explorerUrl.tx(receiptCreate.transactionHash);
      const linkPublish = explorerUrl.tx(receiptPublish.transactionHash);
      const ipfsNote = ipfsCID ? `\n\nDokument (IPFS): ${ipfsCID}` : '';
      alert(
        `✅ Tender #${tenderId} bol vytvorený a uverejnený.\n\nOtvorený pre ponuky na ${days} dní.${ipfsNote}\n\n🔗 Vytvorenie: ${linkCreate}\n🔗 Uverejnenie: ${linkPublish}`
      );

      setCreateForm({
        title: '',
        description: '',
        budget: '',
        category: 'tlac',
        daysOpen: '7',
        votingDays: '3',
      });
      setSelectedFile(null);
      setIpfsCID('');
      loadAllTenders();
      setActiveScreen('Moje tendery');
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (tenderId) {
        alert(
          `Tender #${tenderId} bol vytvorený ako koncept, ale uverejnenie zlyhalo:\n\n${extractRevertReason(error)}\n\nMôžete ho uverejniť na stránke detailu tendra alebo v zozname Moje tendery.`
        );
      } else {
        alert('Chyba: ' + extractRevertReason(error));
      }
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
      alert('Chyba pri načítavaní tendru: ' + extractRevertReason(error));
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
      const appReceipt = await tx.wait();
      alert(`✅ Žiadosť bola odoslaná! Čaká na schválenie študentskou radou.\n\n🔗 Transakcia: ${explorerUrl.tx(appReceipt.transactionHash)}`);
      setVendorApplicationForm({ companyName: '', contactInfo: '', description: '' });
      await checkMyApplicationStatus();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
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
      const approveReceipt = await tx.wait();
      alert(`✅ Žiadosť bola schválená!\n\n🔗 Transakcia: ${explorerUrl.tx(approveReceipt.transactionHash)}`);
      await loadVendorApplications();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
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
      const revokeReceipt = await tx.wait();
      alert(`✅ Status dodávateľa bol odvolaný.\n\n🔗 Transakcia: ${explorerUrl.tx(revokeReceipt.transactionHash)}`);
      
      // Обновляем статус если это текущий пользователь
      if (vendorAddress === account) {
        await checkMyApplicationStatus();
      } else {
        await loadVendorApplications();
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
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
      const rejectReceipt = await tx.wait();
      alert(`❌ Žiadosť bola zamietnutá.\n\n🔗 Transakcia: ${explorerUrl.tx(rejectReceipt.transactionHash)}`);
      await loadVendorApplications();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
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
      
      const priceInWei = window.ethers.utils.parseEther(bidForm.priceEUR);
      
      const tx = await contract.submitBid(
        bidForm.tenderId,
        priceInWei,
        bidForm.deliveryTime,
        bidForm.description
      );
      const bidReceipt = await tx.wait();
      alert(`✅ Ponuka bola úspešne podaná!\n\n🔗 Transakcia: ${explorerUrl.tx(bidReceipt.transactionHash)}`);
      setBidForm({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
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
      const voteReceipt = await tx.wait();
      alert(`✅ Hlas bol prijatý!\n\n🔗 Transakcia: ${explorerUrl.tx(voteReceipt.transactionHash)}`);
      getTenderDetails(tenderId);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
      setLoading(false);
    }
  };

  // Spustenie hlasovania (iba tvorca, tender Aktívny, aspoň 3 ponuky)
  const startVoting = async (tenderId, votingDays) => {
    if (!contract) return;
    const days = parseInt(votingDays, 10);
    if (isNaN(days) || days < 3 || days > 14) {
      alert('Počet dní na hlasovanie musí byť 3–14.');
      return;
    }
    try {
      const bidCountBn = await contract.getBidCount(tenderId);
      const bidCount = bidCountBn.toNumber ? bidCountBn.toNumber() : Number(bidCountBn);
      if (bidCount < 3) {
        alert(
          `Na spustenie hlasovania sú potrebné aspoň 3 ponuky od dodávateľov (aktuálne: ${bidCount}).`
        );
        return;
      }
      setLoading(true);
      const tx = await contract.startVoting(tenderId, days);
      const votingReceipt = await tx.wait();
      alert(`✅ Hlasovanie bolo spustené!\n\n🔗 Transakcia: ${explorerUrl.tx(votingReceipt.transactionHash)}`);
      getTenderDetails(tenderId);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
      setLoading(false);
    }
  };

  const cancelTender = async (tenderId) => {
    if (!contract) return;
    if (!window.confirm('Naozaj chcete zrušiť tento tender? Táto akcia je nezvratná.')) return;
    try {
      setLoading(true);
      // Pre-check: read the tender and verify conditions
      const t = await contract.getTender(tenderId);
      const status = Number(t.status);
      const creator = t.creator;
      if (status === 5) { alert('Tento tender je už zrušený.'); setLoading(false); return; }
      if (status > 1) { alert('Tender nie je možné zrušiť — je v stave „' + STATUS_NAMES[status] + '".'); setLoading(false); return; }
      if (account && creator.toLowerCase() !== account.toLowerCase()) {
        alert('Nie ste tvorcom tohto tendra. Zrušiť ho môže iba ' + creator); setLoading(false); return;
      }
      const tx = await contract.cancelTender(tenderId);
      const receipt = await tx.wait();
      alert(`✅ Tender bol zrušený.\n\n🔗 Transakcia: ${explorerUrl.tx(receipt.transactionHash)}`);
      getTenderDetails(tenderId);
      loadAllTenders();
      setLoading(false);
    } catch (error) {
      console.error('cancelTender error:', error);
      const info = [
        'reason: ' + (error.reason || '-'),
        'code: ' + (error.code || '-'),
        'error.reason: ' + (error.error?.reason || '-'),
        'error.message: ' + (error.error?.message || '-'),
        'message: ' + (error.message || '-').substring(0, 300)
      ].join('\n');
      alert('Chyba pri zrušení:\n\n' + info);
      setLoading(false);
    }
  };

  const finalizeTender = async (tenderId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.finalizeTender(tenderId);
      const receipt = await tx.wait();
      alert(`✅ Tender bol finalizovaný! Víťaz bol určený.\n\n🔗 Transakcia: ${explorerUrl.tx(receipt.transactionHash)}`);
      getTenderDetails(tenderId);
      loadAllTenders();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
      setLoading(false);
    }
  };

  const fulfillTender = async (tenderId) => {
    if (!contract) return;
    if (!window.confirm('Potvrdzujete, že tender bol splnený dodávateľom?')) return;
    try {
      setLoading(true);
      const tx = await contract.fulfillTender(tenderId);
      const receipt = await tx.wait();
      alert(`✅ Tender bol označený ako splnený.\n\n🔗 Transakcia: ${explorerUrl.tx(receipt.transactionHash)}`);
      getTenderDetails(tenderId);
      loadAllTenders();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
      setLoading(false);
    }
  };

  const updateTenderIPFSCID = async (tenderId, newCID) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.updateTenderIPFSCID(tenderId, newCID);
      const receipt = await tx.wait();
      alert(`✅ Dokument bol aktualizovaný.\n\n🔗 Transakcia: ${explorerUrl.tx(receipt.transactionHash)}`);
      getTenderDetails(tenderId);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
      setLoading(false);
    }
  };

  const publishTenderById = async (tenderId, daysOpen) => {
    if (!contract) return;
    const days = parseInt(daysOpen, 10);
    if (isNaN(days) || days < 3 || days > 14) {
      alert('Počet dní musí byť 3–14.');
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.publishTender(tenderId, days);
      const receipt = await tx.wait();
      alert(`✅ Tender bol uverejnený!\n\nOtvorený pre ponuky na ${days} dní.\n\n🔗 Transakcia: ${explorerUrl.tx(receipt.transactionHash)}`);
      getTenderDetails(tenderId);
      loadAllTenders();
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Chyba: ' + extractRevertReason(error));
      setLoading(false);
    }
  };

  // Načítať tendery pri pripojení kontraktu alebo read-only kontrakte (pre ALT-UI)
  useEffect(() => {
    if (contract) {
      loadAllTenders();
    }
  }, [contract]); // eslint-disable-line react-hooks/exhaustive-deps

  // Проверка статуса заявки при подключении кошелька (для всех кроме совета)
  useEffect(() => {
    if (contract && account && !isMember) {
      checkMyApplicationStatus();
    }
  }, [contract, account, isMember]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex h-screen bg-gray-50 dark:bg-[#171f2b]">
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
                createAndPublishTender={createAndPublishTender}
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
                contract={contract}
                onBack={() => handleNavigate('Všetky tendery')}
                onStartVoting={startVoting}
                votingDaysInput={votingDaysInput}
                setVotingDaysInput={setVotingDaysInput}
                onCastVote={castVote}
                bidForm={bidForm}
                setBidForm={setBidForm}
                onSubmitBid={submitBid}
                getIPFSUrl={getIPFSUrl}
                onCancelTender={cancelTender}
                onFinalizeTender={finalizeTender}
                onFulfillTender={fulfillTender}
                onUpdateIPFSCID={updateTenderIPFSCID}
                onPublishTender={publishTenderById}
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
              <Reports
                tenders={allTenders}
                contract={contract}
                account={account}
              />
            )}
            {activeScreen === 'Nastavenia' && (
              <Settings
                account={account}
                isMember={isMember}
                userRole={userRole}
                isRegisteredVendor={isRegisteredVendor}
                myApplicationStatus={myApplicationStatus}
                contract={contract}
                loading={loading}
                setLoading={setLoading}
              />
            )}
          </main>
        </div>
        {loading && (
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