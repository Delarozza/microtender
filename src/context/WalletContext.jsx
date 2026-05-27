import React, { createContext, useState, useEffect, useRef } from 'react';
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID_AMOY, AMOY_RPC, AMOY_RPC_FALLBACK } from '../constants/contracts';

export const WalletContext = createContext();

const USER_ROLES = {
  MEMBER: 0,
  ADMIN: 1
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isRegisteredVendor, setIsRegisteredVendor] = useState(false);
  const [myApplicationStatus, setMyApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const accountRef = useRef(account);

  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  useEffect(() => {
    if (!account) {
      const tryRpc = (rpcUrl) => {
        try {
          const provider = new JsonRpcProvider(rpcUrl);
          return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        } catch (_) {
          return null;
        }
      };
      const c = tryRpc(AMOY_RPC) || tryRpc(AMOY_RPC_FALLBACK);
      if (c) setContract(c);
    }
  }, [account]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }
      const newAddress = accounts[0];
      if (newAddress === account) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setAccount(address);
        setContract(contractInstance);
      } catch (e) {
        console.error('AccountsChanged reconnect:', e);
        disconnectWallet();
      }
    };

    const handleDisconnect = () => disconnectWallet();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('disconnect', handleDisconnect);
    };
  }, [account]);

  useEffect(() => {
    const loadUserRole = async () => {
      const accountToLoad = account;
      if (!contract || !accountToLoad) return;
      try {
        const [role, hasRoleFlag] = await Promise.all([
          contract.getUserRole(accountToLoad),
          contract.hasRole(accountToLoad),
        ]);
        const roleNumber = Number(role);
        const isCouncilMember = hasRoleFlag && roleNumber >= USER_ROLES.MEMBER;

        if (accountRef.current !== accountToLoad) return;
        setUserRole(roleNumber);
        setIsMember(isCouncilMember);
        const isVendor = await contract.isRegisteredVendor(accountToLoad);
        if (accountRef.current !== accountToLoad) return;
        setIsRegisteredVendor(isVendor);

        try {
          const app = await contract.getVendorApplicationByAddress(accountToLoad);
          const appId = Number(app?.id || 0);
          const zeroAddr = '0x0000000000000000000000000000000000000000';
          if (appId === 0 || String(app?.applicant).toLowerCase() === zeroAddr) {
            setMyApplicationStatus(null);
          } else {
            setMyApplicationStatus(app.status);
          }
        } catch (e) {
          setMyApplicationStatus(null);
        }
      } catch (error) {
        console.error('Role load error:', error);
        if (accountRef.current === accountToLoad) {
          setUserRole(null);
          setIsMember(false);
        }
      }
    };

    if (contract && account) {
      setMyApplicationStatus(null);
      loadUserRole();
    }
  }, [contract, account]);

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
            params: [{
              chainId: `0x${CHAIN_ID_AMOY.toString(16)}`,
              chainName: 'Polygon Amoy',
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
              rpcUrls: [AMOY_RPC, AMOY_RPC_FALLBACK],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            }],
          });
          return true;
        } catch (addErr) {
          return false;
        }
      }
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
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== CHAIN_ID_AMOY) {
        const switched = await requestSwitchToAmoy();
        if (!switched) {
          alert('Prepnite sieť na Polygon Amoy v MetaMask.');
          setLoading(false);
          return;
        }
      }

      const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setAccount(address);
      setContract(contractInstance);
      setLoading(false);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Chyba pripojenia. Skontrolujte konzolu.');
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
  };

  return (
    <WalletContext.Provider value={{
      account, contract, userRole, isMember, isRegisteredVendor, myApplicationStatus,
      connectWallet, disconnectWallet, loading, setLoading
    }}>
      {children}
    </WalletContext.Provider>
  );
};
