// QFC Chain Integration for AI Pets
const QFC_RPC = "https://rpc.testnet.qfc.network";
const CHAIN_ID = 9000;
const CONTRACT_ADDRESS = "0x960c7E2Eac4b1b701bF2Fa07379140F9dbAB739e";

const ABI = [
  "function mintPet(string calldata name) external returns (uint256)",
  "function breed(uint256 parent1Id, uint256 parent2Id, string calldata childName) external returns (uint256)",
  "function recordBattle(uint256 winnerId, uint256 loserId) external",
  "function transfer(uint256 petId, address to) external",
  "function petCount(address owner) external view returns (uint256)",
  "function wins(address) external view returns (uint256)",
  "function losses(address) external view returns (uint256)",
  "function nextPetId() external view returns (uint256)",
  "event PetMinted(address indexed owner, uint256 indexed petId, string name, uint8 species, uint8 element, uint8 generation)",
  "event PetBred(address indexed owner, uint256 indexed childId, uint256 parent1, uint256 parent2)",
  "event BattleResult(uint256 indexed winnerId, uint256 indexed loserId, address winnerOwner, address loserOwner)",
  "event PetTransferred(uint256 indexed petId, address indexed from, address indexed to)",
];

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string | null;
  signer: any | null;
  provider: any | null;
}

let wallet: WalletState = { connected: false, address: null, balance: null, signer: null, provider: null };

export function getWalletState() { return wallet; }

export async function connectWallet(): Promise<WalletState> {
  const { ethers } = await import("ethers");
  if (typeof (window as any).ethereum !== "undefined") {
    const ethereum = (window as any).ethereum;
    await ethereum.request({ method: "eth_requestAccounts" });
    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x2328" }] });
    } catch (e: any) {
      if (e.code === 4902) {
        await ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x2328", chainName: "QFC Testnet", rpcUrls: [QFC_RPC], nativeCurrency: { name: "QFC", symbol: "QFC", decimals: 18 } }] });
      }
    }
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = ethers.formatEther(await provider.getBalance(address));
    wallet = { connected: true, address, balance, signer, provider };
  }
  return wallet;
}

export async function connectWithKey(key: string): Promise<WalletState> {
  const { ethers } = await import("ethers");
  const provider = new ethers.JsonRpcProvider(QFC_RPC);
  const w = new ethers.Wallet(key, provider);
  const balance = ethers.formatEther(await provider.getBalance(w.address));
  wallet = { connected: true, address: w.address, balance, signer: w, provider };
  return wallet;
}

export async function mintPetOnChain(name: string): Promise<{ txHash: string; success: boolean }> {
  if (!wallet.signer) throw new Error("Wallet not connected");
  const { ethers } = await import("ethers");
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet.signer);
  try {
    const tx = await contract.mintPet(name);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, success: receipt.status === 1 };
  } catch (e: any) {
    console.error("Mint pet failed:", e);
    return { txHash: "", success: false };
  }
}

export async function breedOnChain(parent1: number, parent2: number, name: string): Promise<{ txHash: string; success: boolean }> {
  if (!wallet.signer) throw new Error("Wallet not connected");
  const { ethers } = await import("ethers");
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet.signer);
  try {
    const tx = await contract.breed(parent1, parent2, name);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, success: receipt.status === 1 };
  } catch (e: any) {
    console.error("Breed failed:", e);
    return { txHash: "", success: false };
  }
}

export async function recordBattleOnChain(winnerId: number, loserId: number): Promise<{ txHash: string; success: boolean }> {
  if (!wallet.signer) throw new Error("Wallet not connected");
  const { ethers } = await import("ethers");
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet.signer);
  try {
    const tx = await contract.recordBattle(winnerId, loserId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, success: receipt.status === 1 };
  } catch (e: any) {
    console.error("Record battle failed:", e);
    return { txHash: "", success: false };
  }
}

export async function getChainInfo(): Promise<{ blockNumber: number; chainId: number }> {
  const { ethers } = await import("ethers");
  const provider = wallet.provider || new ethers.JsonRpcProvider(QFC_RPC);
  const blockNumber = await provider.getBlockNumber();
  return { blockNumber, chainId: CHAIN_ID };
}

export { CONTRACT_ADDRESS, ABI };
