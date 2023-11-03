const Escrow = require('../artifacts/contracts/Contract.sol/Escrow.json');
const { createPublicClient, http, } = require('viem')
const { mainnet, localhost, goerli } = require('viem/chains')


async function deploy(walletClient, arbiter, beneficiary, value) {    
try {
  const hash = await walletClient.deployContract({
    abi: Escrow.abi,
    bytecode: Escrow.bytecode,
    args: [arbiter, beneficiary],
    value,
  })
  const publicClient = createPublicClient({
    chain: process.env.NEXT_PUBLIC_ENABLE_TESTNETS == "true" ? goerli : localhost,
    transport: http()
  })
  const tx = await publicClient.waitForTransactionReceipt({
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
