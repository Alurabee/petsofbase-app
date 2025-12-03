import { useComposeCast } from '@coinbase/onchainkit/minikit';

export function useSocialSharing() {
  const { composeCast } = useComposeCast();

  const shareGeneration = (petName: string, petId: string, imageUrl: string) => {
    composeCast({
      text: `Just turned my pet ${petName} into a Based NFT PFP! 🐾✨`,
      embeds: [
        `${window.location.origin}/gallery?pet=${petId}`,
        imageUrl
      ]
    });
  };

  const shareMint = (petName: string, petId: string, imageUrl: string) => {
    composeCast({
      text: `Just minted ${petName} as an NFT on Base! 🎉 Join the most wholesome community on Base 🐾`,
      embeds: [
        `${window.location.origin}/gallery?pet=${petId}`,
        imageUrl
      ]
    });
  };

  const shareTop10 = (petName: string, rank: number, petId: string) => {
    composeCast({
      text: `${petName} just hit #${rank} on the PetsOfBase Cuteness Leaderboard! 🏆🐾 Can you beat it?`,
      embeds: [`${window.location.origin}/leaderboard`]
    });
  };

  const challengeFriend = (petName: string) => {
    composeCast({
      text: `I just created an amazing PFP for ${petName}! 🐾 Think your pet is cuter? Prove it! 😎`,
      embeds: [`${window.location.origin}/upload`]
    });
  };

  return {
    shareGeneration,
    shareMint,
    shareTop10,
    challengeFriend
  };
}
