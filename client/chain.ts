// QFC Chain Integration for AI Pets — uses @qfc/chain-sdk
import {
  connectWallet,
  connectWithKey,
  getWalletState,
  getChainInfo,
  getContract,
  sendTx,
  initChainUI,
  type WalletState,
} from "@qfc/chain-sdk";

const CONTRACT_ADDRESS = "0x960c7E2Eac4b1b701bF2Fa07379140F9dbAB739e";
const ABI = [
  "function mintPet(string calldata name) external returns (uint256)",
  "function breed(uint256 parent1Id, uint256 parent2Id, string calldata childName) external returns (uint256)",
  "function recordBattle(uint256 winnerId, uint256 loserId) external",
  "function transfer(uint256 petId, address to) external",
  "function petCount(address owner) external view returns (uint256)",
  "function wins(address) external view returns (uint256)",
  "function losses(address) external view returns (uint256)",
  "event PetMinted(address indexed owner, uint256 indexed petId, string name, uint8 species, uint8 element, uint8 generation)",
  "event PetBred(address indexed owner, uint256 indexed childId, uint256 parent1, uint256 parent2)",
  "event BattleResult(uint256 indexed winnerId, uint256 indexed loserId, address winnerOwner, address loserOwner)",
];

export async function mintPetOnChain(name: string) {
  const contract = await getContract(CONTRACT_ADDRESS, ABI);
  return sendTx(() => contract.mintPet(name));
}

export async function breedOnChain(parent1: number, parent2: number, name: string) {
  const contract = await getContract(CONTRACT_ADDRESS, ABI);
  return sendTx(() => contract.breed(parent1, parent2, name));
}

export async function recordBattleOnChain(winnerId: number, loserId: number) {
  const contract = await getContract(CONTRACT_ADDRESS, ABI);
  return sendTx(() => contract.recordBattle(winnerId, loserId));
}

export { connectWallet, connectWithKey, getWalletState, getChainInfo, initChainUI, CONTRACT_ADDRESS, ABI };
export type { WalletState };
