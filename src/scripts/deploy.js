const Escrow = require('../artifacts/contracts/Contract.sol/Escrow.json');
const { createPublicClient, http, getContractAddress } = require('viem')
const { mainnet, localhost } = require('viem/chains')


async function deploy(walletClient, arbiter, beneficiary, value) {    
try {
  const hash = await walletClient.deployContract({
    abi: Escrow.abi,
    bytecode: Escrow.bytecode,
    args: [arbiter, beneficiary],
    value,
  })
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http()
  })
  const tx = await publicClient.getTransactionReceipt({
    hash,
  })
  // console.log(tx);

  return {hash, address: tx.contractAddress}
} catch (e) {
  console.log(e.details || e);
  return e.details
}
}

module.exports = deploy
