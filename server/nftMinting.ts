import { ethers } from "ethers";

// ERC-721 ABI (minimal interface for minting)
const PET_PFP_ABI = [
  "function mintPet(address to, uint256 petId, string memory uri) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function getPetId(uint256 tokenId) public view returns (uint256)",
];

interface MintNFTOptions {
  petId: number;
  ownerAddress: string;
  metadataUri: string;
}

interface MintNFTResult {
  success: boolean;
  tokenId?: number;
  transactionHash?: string;
  contractAddress?: string;
  error?: string;
}

/**
 * Mint a Pet PFP NFT on the Base blockchain
 * 
 * @param options Minting options including pet ID, owner address, and metadata URI
 * @returns Minting result with token ID and transaction hash
 */
export async function mintPetNFT(options: MintNFTOptions): Promise<MintNFTResult> {
  const { petId, ownerAddress, metadataUri } = options;

  try {
    // Get environment variables
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    const privateKey = process.env.NFT_MINTER_PRIVATE_KEY;
    const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

    if (!contractAddress) {
      throw new Error("NFT_CONTRACT_ADDRESS not configured");
    }

    if (!privateKey) {
      throw new Error("NFT_MINTER_PRIVATE_KEY not configured");
    }

    // Validate owner address
    if (!ethers.isAddress(ownerAddress)) {
      throw new Error("Invalid owner address");
    }

    // Connect to Base network
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, PET_PFP_ABI, wallet);

    console.log("[NFT Minting] Minting NFT for pet:", petId);
    console.log("[NFT Minting] Owner address:", ownerAddress);
    console.log("[NFT Minting] Metadata URI:", metadataUri);

    // Mint the NFT
    const tx = await contract.mintPet(ownerAddress, petId, metadataUri);
    console.log("[NFT Minting] Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("[NFT Minting] Transaction confirmed:", receipt.hash);

    // Extract token ID from event logs
    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "PetMinted";
      } catch {
        return false;
      }
    });

    let tokenId: number | undefined;
    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      tokenId = Number(parsed?.args[0]); // First arg is tokenId
    }

    return {
      success: true,
      tokenId,
      transactionHash: receipt.hash,
      contractAddress,
    };
  } catch (error: any) {
    console.error("[NFT Minting] Failed to mint NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to mint NFT",
    };
  }
}

/**
 * Generate metadata JSON for a pet NFT
 * 
 * @param pet Pet data from database
 * @param pfpImageUrl URL to the generated PFP image
 * @returns Metadata object
 */
export function generateNFTMetadata(pet: any, pfpImageUrl: string) {
  const attributes = [];

  if (pet.species) {
    attributes.push({ trait_type: "Species", value: pet.species });
  }

  if (pet.breed) {
    attributes.push({ trait_type: "Breed", value: pet.breed });
  }

  if (pet.personality) {
    attributes.push({ trait_type: "Personality", value: pet.personality });
  }

  if (pet.likes) {
    attributes.push({ trait_type: "Likes", value: pet.likes });
  }

  if (pet.dislikes) {
    attributes.push({ trait_type: "Dislikes", value: pet.dislikes });
  }

  return {
    name: `PetsOfBase #${pet.id} - ${pet.name}`,
    description: `A unique PFP of ${pet.name}, a ${pet.species}${pet.breed ? ` (${pet.breed})` : ""} from the PetsOfBase community on Base.`,
    image: pfpImageUrl,
    attributes,
    external_url: `https://petsofbase.com/pet/${pet.id}`,
  };
}

/**
 * Check if the NFT contract is properly configured
 * 
 * @returns True if contract is accessible, false otherwise
 */
export async function checkNFTContractStatus(): Promise<boolean> {
  try {
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

    if (!contractAddress) {
      console.warn("[NFT Contract] NFT_CONTRACT_ADDRESS not configured");
      return false;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, PET_PFP_ABI, provider);

    // Try to read total supply
    const totalSupply = await contract.totalSupply();
    console.log("[NFT Contract] Contract is accessible. Total supply:", totalSupply.toString());

    return true;
  } catch (error) {
    console.error("[NFT Contract] Failed to access contract:", error);
    return false;
  }
}
