import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS } from '../utils/pinata';
import { getGasOverrides } from '../utils/gas';

const STATUS_NAMES = ['Aktívny', 'Hlasovanie', 'Ukončený', 'Splnený', 'Zrušený'];

function extractRevertReason(error) {
  if (error.reason) return error.reason;
  if (error.error?.reason) return error.error.reason;
  if (error.error?.data?.message) return error.error.data.message;
  if (error.data?.message) return error.data.message;
  const match = error.message?.match(/reason="([^"]+)"/);
  if (match) return match[1];
  const revertMatch = error.message?.match(/reverted with reason string '([^']+)'/);
  if (revertMatch) return revertMatch[1];
  return 'Transakcia bola odmietnutá kontraktom. Skontrolujte stav tendra a oprávnenia.';
}

export function useTenderContract(contract, account, isMember) {
  const [allTenders, setAllTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [vendorApplications, setVendorApplications] = useState([]);

  const [createForm, setCreateForm] = useState({ title: '', description: '', budget: '', category: 'tlac', daysOpen: '7', votingDays: '3' });
  const [bidForm, setBidForm] = useState({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
  const [vendorApplicationForm, setVendorApplicationForm] = useState({ companyName: '', contactInfo: '', description: '' });
  const [votingDaysInput, setVotingDaysInput] = useState('3');
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsCID, setIpfsCID] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(false);

  const loadAllTenders = useCallback(async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const count = await contract.tenderCounter();
      const tendersData = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const tender = await contract.getTender(i);
          let bidCount = 0;
          try {
            const bc = await contract.getBidCount(i);
            bidCount = Number(bc);
          } catch (_) { }
          tendersData.push({
            id: tender.id.toString(),
            creator: tender.creator,
            title: tender.title,
            description: tender.description || '',
            maxBudget: parseFloat(ethers.formatEther(tender.maxBudget)),
            category: tender.category,
            status: STATUS_NAMES[tender.status],
            statusIndex: Number(tender.status),
            deadline: tender.deadline.toString(),
            votingDeadline: tender.votingDeadline.toString(),
            createdAt: tender.createdAt.toString(),
            bidCount,
          });
        } catch (err) { }
      }
      setAllTenders(tendersData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [contract]);

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
        maxBudget: parseFloat(ethers.formatEther(tender.maxBudget)),
        category: tender.category,
        ipfsCID: tender.ipfsCID || '',
        status: STATUS_NAMES[tender.status],
        statusIndex: Number(tender.status),
        deadline: tender.deadline.toString(),
        votingDeadline: tender.votingDeadline.toString()
      });

      setBids(bidsData.map(b => ({
        id: b.id.toString(),
        tenderId: b.tenderId.toString(),
        vendor: b.vendor,
        price: parseFloat(ethers.formatEther(b.price)),
        deliveryTime: b.deliveryTime.toString(),
        description: b.description,
        submittedAt: b.submittedAt.toString()
      })));
      setBidForm(prev => ({ ...prev, tenderId: id }));
    } catch (error) {
      alert('Chyba pri načítavaní tendru: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const createAndPublishTender = async (onSuccess) => {
    if (!contract) return;
    if (!isMember) {
      alert('❌ Iba členovia rady môžu vytvárať tendry!');
      return;
    }
    const days = parseInt(createForm.daysOpen, 10);
    const votePlan = parseInt(createForm.votingDays, 10);
    if (isNaN(days) || days < 3 || days > 14 || isNaN(votePlan) || votePlan < 3 || votePlan > 14) {
      alert('Počet dní na ponuky/hlasovanie musí byť 3-14.');
      return;
    }

    try {
      setLoading(true);
      const budgetInWei = ethers.parseEther(createForm.budget);
      const overrides = await getGasOverrides(contract);
      const txCreate = await contract.createTender(createForm.title, createForm.description || '', budgetInWei, createForm.category, ipfsCID || '', days, overrides);
      await txCreate.wait();

      alert(`✅ Tender bol vytvorený.`);
      setCreateForm({ title: '', description: '', budget: '', category: 'tlac', daysOpen: '7', votingDays: '3' });
      setSelectedFile(null);
      setIpfsCID('');
      loadAllTenders();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingFile(true);
      setUploadProgress(0);
      const interval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);
      const cid = await uploadToIPFS(file);
      clearInterval(interval);
      setUploadProgress(100);
      setIpfsCID(cid);
      setSelectedFile(file);
      alert(`✅ Súbor bol úspešne nahraný do IPFS!\nCID: ${cid}`);
    } catch (error) {
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
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIpfsCID('');
  };

  const submitVendorApplication = async (onSuccess) => {
    if (!contract) return;
    if (!vendorApplicationForm.companyName.trim()) { alert('❌ Názov spoločnosti je povinný!'); return; }
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.submitVendorApplication(vendorApplicationForm.companyName, vendorApplicationForm.contactInfo, vendorApplicationForm.description, overrides);
      await tx.wait();
      alert(`✅ Žiadosť bola odoslaná!`);
      setVendorApplicationForm({ companyName: '', contactInfo: '', description: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const priceInWei = ethers.parseEther(bidForm.priceEUR);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.submitBid(bidForm.tenderId, priceInWei, bidForm.deliveryTime, bidForm.description, overrides);
      await tx.wait();
      alert(`✅ Ponuka bola úspešne podaná!`);
      setBidForm({ tenderId: '', priceEUR: '', deliveryTime: '', description: '' });
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (tenderId, bidId) => {
    if (!contract || !isMember) { alert('❌ Iba členovia rady môžu hlasovať!'); return; }
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.castVote(tenderId, bidId, overrides);
      await tx.wait();
      alert(`✅ Hlas bol prijatý!`);
      getTenderDetails(tenderId);
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const startVoting = async (tenderId, votingDays) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.startVoting(tenderId, votingDays, overrides);
      await tx.wait();
      alert(`✅ Hlasovanie bolo spustené!`);
      getTenderDetails(tenderId);
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const cancelTender = async (tenderId) => {
    if (!contract) return;
    if (!window.confirm('Naozaj chcete zrušiť tento tender? Táto akcia je nezvratná.')) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.cancelTender(tenderId, overrides);
      await tx.wait();
      alert(`✅ Tender bol zrušený.`);
      getTenderDetails(tenderId);
      loadAllTenders();
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const finalizeTender = async (tenderId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.finalizeTender(tenderId, overrides);
      await tx.wait();
      alert(`✅ Tender bol finalizovaný!`);
      getTenderDetails(tenderId);
      loadAllTenders();
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const fulfillTender = async (tenderId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.fulfillTender(tenderId, overrides);
      await tx.wait();
      alert(`✅ Tender bol označený ako splnený.`);
      getTenderDetails(tenderId);
      loadAllTenders();
    } catch (error) {
      alert('Chyba: ' + extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };

  const loadVendorApplications = async () => {
    if (!contract) return;
    try {
      const counter = await contract.vendorApplicationCounter();
      const applications = [];
      for (let i = 1; i <= Number(counter); i++) {
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
        } catch (e) { }
      }
      setVendorApplications(applications);
    } catch (error) { }
  };

  const approveVendorApplication = async (appId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.approveVendorApplication(appId, overrides);
      await tx.wait();
      alert(`✅ Žiadosť bola schválená!`);
      await loadVendorApplications();
    } catch (err) { alert('Chyba: ' + extractRevertReason(err)); } finally { setLoading(false); }
  };

  const rejectVendorApplication = async (appId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.rejectVendorApplication(appId, overrides);
      await tx.wait();
      alert(`❌ Žiadosť bola zamietnutá.`);
      await loadVendorApplications();
    } catch (err) { alert('Chyba: ' + extractRevertReason(err)); } finally { setLoading(false); }
  };

  const revokeVendorStatus = async (vendorAddress) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.revokeVendorStatus(vendorAddress, overrides);
      await tx.wait();
      alert(`✅ Status dodávateľa bol odvolaný.`);
      await loadVendorApplications();
    } catch (err) { alert('Chyba: ' + extractRevertReason(err)); } finally { setLoading(false); }
  };

  const updateTenderIPFSCID = async (tenderId, newCID) => {
    if (!contract) return;
    try {
      setLoading(true);
      const overrides = await getGasOverrides(contract);
      const tx = await contract.updateTenderIPFSCID(tenderId, newCID, overrides);
      await tx.wait();
      alert(`✅ Dokument bol aktualizovaný.`);
      getTenderDetails(tenderId);
    } catch (err) { alert('Chyba: ' + extractRevertReason(err)); } finally { setLoading(false); }
  };



  return {
    allTenders, selectedTender, bids, vendorApplications, loading,
    createForm, setCreateForm, bidForm, setBidForm, vendorApplicationForm, setVendorApplicationForm,
    votingDaysInput, setVotingDaysInput,
    selectedFile, ipfsCID, uploadingFile, uploadProgress,
    loadAllTenders, getTenderDetails, createAndPublishTender, handleFileSelect, removeFile,
    submitVendorApplication, submitBid, castVote, startVoting, cancelTender, finalizeTender, fulfillTender,
    loadVendorApplications, approveVendorApplication, rejectVendorApplication, revokeVendorStatus, updateTenderIPFSCID
  };
}
