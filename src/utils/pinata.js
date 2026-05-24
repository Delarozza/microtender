/**
 * Pomocný modul na nahrávanie súborov do IPFS cez Pinata API
 * 
 * Požiadavky:
 * 1. Vytvoriť účet na https://pinata.cloud
 * 2. Získať JWT token v sekcii API Keys
 *    - Oprávnenia: iba `pinFileToIPFS` (administrátorské práva nie sú potrebné)
 * 3. Vytvoriť súbor .env.local s premennou REACT_APP_PINATA_JWT
 */

/**
 * Nahrá súbor do IPFS cez službu Pinata
 * @param {File} file - Súbor na nahranie (PDF, DOC, DOCX)
 * @returns {Promise<string>} CID (Content Identifier) súboru
 */
export const uploadToIPFS = async (file) => {
  // PRODUCTION FIX: Route through a backend proxy
  // const response = await fetch('/api/ipfs/upload', { method: 'POST', body: formData });
  
  // PoC FALLBACK (Iba ak ide o študentské demo bez backendu):
  const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
  
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT nie je nastavený. Pridajte REACT_APP_PINATA_JWT do .env.local');
  }
  console.warn("SECURITY WARNING: Pinata JWT is exposed on the client. In production, move this to a Node.js backend.");

  // Validácia súboru
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`Súbor je príliš veľký. Maximálna veľkosť: 10MB`);
  }

  const allowedTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Podporované sú len súbory: PDF, DOC, DOCX');
  }

  try {
    // Vytvorenie FormData
    const formData = new FormData();
    formData.append('file', file);

    // Metadáta súboru
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'MicroTender App'
      }
    });
    formData.append('pinataMetadata', metadata);

    // Možnosti pinningu
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    // Nahranie do služby Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.details || `Chyba nahrávania: ${response.statusText}`);
    }

    const data = await response.json();
    return data.IpfsHash; // CID
  } catch (error) {
    console.error('Chyba nahrávania do IPFS:', error);
    throw error;
  }
};

/**
 * Overí dostupnosť súboru na IPFS podľa CID
 * @param {string} cid - Content Identifier
 * @returns {Promise<boolean>} true ak je súbor dostupný
 */
export const checkIPFSFile = async (cid) => {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`, {
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('Chyba kontroly súboru:', error);
    return false;
  }
};

/**
 * Vráti URL adresu pre prístup k súboru na IPFS
 * @param {string} cid - Content Identifier
 * @returns {string} URL adresa súboru
 */
export const getIPFSUrl = (cid) => {
  if (!cid) return null;
  // Je možné použiť rôzne IPFS brány (gateways)
  return `https://ipfs.io/ipfs/${cid}`;
  // Alternatívy:
  // return `https://gateway.pinata.cloud/ipfs/${cid}`;
  // return `https://cloudflare-ipfs.com/ipfs/${cid}`;
};
