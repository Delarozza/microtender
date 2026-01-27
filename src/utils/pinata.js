/**
 * Утилита для загрузки файлов в IPFS через Pinata
 * 
 * Требования:
 * 1. Создайте аккаунт на https://pinata.cloud
 * 2. Получите JWT токен в разделе API Keys
 *    - Права: только `pinFileToIPFS` (администраторские права НЕ нужны)
 * 3. Создайте файл .env.local с переменной REACT_APP_PINATA_JWT
 */

/**
 * Загружает файл в IPFS через Pinata
 * @param {File} file - Файл для загрузки (PDF, DOC, DOCX)
 * @returns {Promise<string>} CID (Content Identifier) файла
 */
export const uploadToIPFS = async (file) => {
  const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
  
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT nie je nastavený. Pridajte REACT_APP_PINATA_JWT do .env.local');
  }

  // Валидация файла
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
    // Создаем FormData
    const formData = new FormData();
    formData.append('file', file);

    // Метаданные файла
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'MicroTender App'
      }
    });
    formData.append('pinataMetadata', metadata);

    // Опции pinning
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    // Загружаем в Pinata
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
 * Проверяет доступность файла по CID
 * @param {string} cid - Content Identifier
 * @returns {Promise<boolean>} true если файл доступен
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
 * Получает URL для доступа к файлу в IPFS
 * @param {string} cid - Content Identifier
 * @returns {string} URL файла
 */
export const getIPFSUrl = (cid) => {
  if (!cid) return null;
  // Можно использовать разные gateways
  return `https://ipfs.io/ipfs/${cid}`;
  // Альтернативы:
  // return `https://gateway.pinata.cloud/ipfs/${cid}`;
  // return `https://cloudflare-ipfs.com/ipfs/${cid}`;
};
