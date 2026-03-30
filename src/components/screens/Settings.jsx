import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Shield, User, Globe, Moon, Sun, UserPlus, UserMinus } from 'lucide-react';

const CONTRACT_ADDRESS = '0xC5EA6607B52EBBbFFBac26b9b68594357720ab75';
const CHAIN_ID_AMOY = 80002;
const POLYGONSCAN_URL = `https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`;

const ROLE_LABELS = {
  admin: 'Admin',
  member: 'Člen rady',
  vendor: 'Registrovaný dodávateľ',
  observer: 'Pozorovateľ',
};

const APP_STATUS_LABELS = ['Čakajúca', 'Schválená', 'Zamietnutá'];

function getRoleLabel(isMember, userRole, isRegisteredVendor) {
  if (isMember && userRole === 1) return ROLE_LABELS.admin;
  if (isMember) return ROLE_LABELS.member;
  if (isRegisteredVendor) return ROLE_LABELS.vendor;
  return ROLE_LABELS.observer;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { /* clipboard may fail in some contexts */ }
  };
  return (
    <button type="button" onClick={handleCopy} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors" title="Kopírovať">
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
    </button>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, copyable, link }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white break-all">{value}</span>
        {copyable && <CopyButton text={value} />}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors" title="Otvoriť">
            <ExternalLink size={16} className="text-gray-400" />
          </a>
        )}
      </div>
    </div>
  );
}

export function Settings({ account, isMember, userRole, isRegisteredVendor, myApplicationStatus, contract, loading, setLoading }) {
  const [contractOwner, setContractOwner] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });

  // Role management state
  const [roleAddress, setRoleAddress] = useState('');
  const [roleToGrant, setRoleToGrant] = useState('0');
  const [revokeAddress, setRevokeAddress] = useState('');

  const isOwner = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase();

  useEffect(() => {
    if (!contract) return;
    (async () => {
      try {
        const owner = await contract.owner();
        setContractOwner(owner);
      } catch (_) { /* read-only might not have owner */ }
    })();
  }, [contract]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleGrantRole = async () => {
    if (!contract || !roleAddress) return;
    try {
      setLoading(true);
      const tx = await contract.grantRole(roleAddress, parseInt(roleToGrant, 10));
      await tx.wait();
      alert('Rola bola úspešne udelená!');
      setRoleAddress('');
    } catch (e) {
      alert('Chyba: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async () => {
    if (!contract || !revokeAddress) return;
    if (!window.confirm('Naozaj chcete odobrať rolu tejto adrese?')) return;
    try {
      setLoading(true);
      const tx = await contract.revokeRole(revokeAddress);
      await tx.wait();
      alert('Rola bola úspešne odobratá!');
      setRevokeAddress('');
    } catch (e) {
      alert('Chyba: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Nastavenia</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Správa profilu, rolí a systémových informácií</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* 1. User Profile */}
        <Card title="Profil používateľa" icon={User}>
          {account ? (
            <>
              <InfoRow label="Adresa peňaženky" value={account} copyable />
              <InfoRow label="Rola v systéme" value={getRoleLabel(isMember, userRole, isRegisteredVendor)} />
              {isRegisteredVendor && (
                <InfoRow label="Status dodávateľa" value="Aktívny" />
              )}
              {myApplicationStatus !== null && myApplicationStatus !== undefined && !isRegisteredVendor && (
                <InfoRow label="Žiadosť o registráciu" value={APP_STATUS_LABELS[myApplicationStatus] || 'Neznámy'} />
              )}
              {isOwner && (
                <InfoRow label="Vlastník kontraktu" value="Áno (owner)" />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Pripojte peňaženku pre zobrazenie profilu.</p>
          )}
        </Card>

        {/* 2. Role Management (Admin only) */}
        {isOwner && (
          <Card title="Správa rolí" icon={Shield}>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <UserPlus size={16} /> Udeliť rolu
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="0x... adresa používateľa"
                    value={roleAddress}
                    onChange={(e) => setRoleAddress(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <select
                    value={roleToGrant}
                    onChange={(e) => setRoleToGrant(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="0">Member (0)</option>
                    <option value="1">Admin (1)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleGrantRole}
                    disabled={loading || !roleAddress}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Udeliť
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <UserMinus size={16} /> Odobrať rolu
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="0x... adresa používateľa"
                    value={revokeAddress}
                    onChange={(e) => setRevokeAddress(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRevokeRole}
                    disabled={loading || !revokeAddress}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Odobrať
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 3. Network & Contract Info */}
        <Card title="Sieť a kontrakt" icon={Globe}>
          <InfoRow label="Smart kontrakt" value={CONTRACT_ADDRESS} copyable link={POLYGONSCAN_URL} />
          <InfoRow label="Sieť" value={`Polygon Amoy (Chain ID ${CHAIN_ID_AMOY})`} />
          <InfoRow label="Solidity" value="0.8.19" />
          <InfoRow label="Vlastník kontraktu" value={contractOwner || '—'} copyable={!!contractOwner} />
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={POLYGONSCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <ExternalLink size={16} /> Polygonscan
            </a>
            <a
              href="https://ipfs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <ExternalLink size={16} /> IPFS Gateway
            </a>
          </div>
        </Card>

        {/* 4. Theme Toggle */}
        <Card title="Vzhľad" icon={darkMode ? Moon : Sun}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Tmavý režim</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Prepnúť medzi svetlým a tmavým vzhľadom</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                darkMode ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
