const EXPLORER_BASE = 'https://amoy.polygonscan.com';
const CONTRACT_ADDRESS = '0x1F8CCE975c9cB052Bf8c6ED04B2a9c614436C5D0';

export const explorerUrl = {
  address: (addr) => `${EXPLORER_BASE}/address/${addr}`,
  tx: (hash) => `${EXPLORER_BASE}/tx/${hash}`,
  contract: () => `${EXPLORER_BASE}/address/${CONTRACT_ADDRESS}`,
  token: (addr) => `${EXPLORER_BASE}/token/${addr}`,
};

export function shortAddress(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export { CONTRACT_ADDRESS, EXPLORER_BASE };
