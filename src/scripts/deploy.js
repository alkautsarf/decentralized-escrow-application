const Escrow = require('../artifacts/contracts/Contract.sol/Escrow.json');

async function deploy(walletClient, arbiter, beneficiary, value) {    
try {
  const hash = await walletClient.deployContract({
    abi: Escrow.abi,
    bytecode: Escrow.bytecode,
    args: [arbiter, beneficiary],
    value,
  })
  console.log(hash);
  return hash
} catch (e) {
  console.log(e.details);
  return e.details
}
}

module.exports = deploy
