import { ethers } from 'ethers';

export async function getGasOverrides(contract) {
  try {
    const provider = contract.runner?.provider || contract.runner;
    if (provider && typeof provider.getFeeData === 'function') {
      const feeData = await provider.getFeeData();

      const minPriorityFee = ethers.parseUnits('30', 'gwei');

      let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      if (!maxPriorityFeePerGas || maxPriorityFeePerGas < minPriorityFee) {
        maxPriorityFeePerGas = minPriorityFee;
      }

      let maxFeePerGas = feeData.maxFeePerGas;
      const minMaxFee = maxPriorityFeePerGas * 2n;
      if (!maxFeePerGas || maxFeePerGas < minMaxFee) {
        maxFeePerGas = minMaxFee;
      }

      return {
        maxPriorityFeePerGas,
        maxFeePerGas
      };
    }
  } catch (err) {
    console.warn("Failed to fetch dynamic gas fees, using safe fallbacks:", err);
  }

  return {
    maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
    maxFeePerGas: ethers.parseUnits('60', 'gwei')
  };
}
