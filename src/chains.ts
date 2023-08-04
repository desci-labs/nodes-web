import type {
  AddEthereumChainParameter,
  Connector,
  Provider,
} from "@web3-react/types";
import { ethers } from "ethers";

/**
 * NOTE: This is assuming that the desci-nodes-be repo is one level up from this repo
 */
import localhostInfo from "./desci-contracts-config/unknown-research-object.json";
import goerliInfo from "./desci-contracts-config/goerli-research-object.json";
import localhost from "./desci-contracts-artifacts/contracts/ResearchObject.sol/ResearchObject.json";
import goerli from "./desci-contracts-artifacts/contracts/ResearchObject.sol/ResearchObject.json";

import localhostInfoDpid from "./desci-contracts-config/unknown-dpid.json";
import goerliInfoDpid from "./desci-contracts-config/goerli-dpid.json";
import localhostDpid from "./desci-contracts-artifacts/contracts/DpidRegistry.sol/DpidRegistry.json";
// import goerliDpid from "./desci-contracts-artifacts/contracts/DpidRegistry.sol/DpidRegistry.json";

export const CHAIN_DEPLOYMENT = {
  address:
    process.env.REACT_APP_DEBUG === "1"
      ? localhostInfo.proxies[localhostInfo.proxies.length - 1].address
      : goerliInfo.proxies[goerliInfo.proxies.length - 1].address,
  abi: process.env.REACT_APP_DEBUG ? localhost.abi : goerli.abi,
};

export const DPID_CHAIN_DEPLOYMENT = {
  address:
    process.env.REACT_APP_DEBUG === "1"
      ? localhostInfoDpid.proxies[localhostInfoDpid.proxies.length - 1].address
      : goerliInfoDpid.proxies[goerliInfoDpid.proxies.length - 1].address,
  abi: localhostDpid.abi,
};

(window as any).DPID_CHAIN_DEPLOYMENT = DPID_CHAIN_DEPLOYMENT;
(window as any).CHAIN_DEPLOYMENT = CHAIN_DEPLOYMENT;
(window as any).APP_DEBUG = {
  REACT_APP_DEBUG: process.env.REACT_APP_DEBUG === "1",
  goerliInfoDpid,
  localhostInfoDpid,
  goerliInfo,
  localhostInfo,
};

const ETH: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
};

const TFI: AddEthereumChainParameter["nativeCurrency"] = {
  name: "TFI",
  symbol: "TFI",
  decimals: 18,
};

const MATIC: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Matic",
  symbol: "MATIC",
  decimals: 18,
};

interface BasicChainInformation {
  urls: string[];
  name: string;
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter["nativeCurrency"];
  blockExplorerUrls: AddEthereumChainParameter["blockExplorerUrls"];
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency;
}

export function getAddChainParameters(
  chainId: number
): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId];
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    };
  } else {
    return chainId;
  }
}

export const CHAINS: {
  [chainId: number]: BasicChainInformation | ExtendedChainInformation;
} = {
  1: {
    urls: [
      process.env.REACT_APP_ALCHEMY_MAINNET
        ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_MAINNET}`
        : undefined,
      "https://cloudflare-eth.com",
    ].filter((url) => url !== undefined) as string[],
    nativeCurrency: ETH,
    name: "Mainnet",
  },

  42: {
    urls: [
      process.env.REACT_APP_ALCHEMY_KOVAN
        ? `https://eth-kovan.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KOVAN}`
        : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: "Kovan",
    nativeCurrency: ETH,
    blockExplorerUrls: ["https://kovan.etherscan.io"],
  },

  // goerli
  5: {
    urls: [
      process.env.REACT_APP_ALCHEMY_GOERLI
        ? `https://eth-goerli.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_GOERLI}`
        : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: "Goerli",
    nativeCurrency: ETH,
    blockExplorerUrls: ["https://goerli.etherscan.io"],
  },

  31337: {
    urls: ["http://localhost:9545"],
    nativeCurrency: ETH,
    name: "Local",
  },

  // Optimism
  10: {
    urls: [
      process.env.REACT_APP_ALCHEMY_OPTIMISM_MAINNET
        ? `https://opt-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_OPTIMISM_MAINNET}`
        : undefined,
      "https://mainnet.optimism.io",
    ].filter((url) => url !== undefined) as string[],
    name: "Optimism",
    nativeCurrency: ETH,
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  69: {
    urls: [
      process.env.REACT_APP_ALCHEMY_OPTIMISM_KOVAN
        ? `https://opt-kovan.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_OPTIMISM_KOVAN}`
        : undefined,
      "https://kovan.optimism.io",
    ].filter((url) => url !== undefined) as string[],
    name: "Optimism Kovan",
    nativeCurrency: ETH,
    blockExplorerUrls: ["https://kovan-optimistic.etherscan.io"],
  },
  420: {
    urls: [
      process.env.REACT_APP_ALCHEMY_OPTIMISM_GOERLI
        ? `https://opt-kovan.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_OPTIMISM_KOVAN}`
        : undefined,
      "https://goerli.optimism.io",
    ].filter((url) => url !== undefined) as string[],
    name: "Optimism Goerli",
    nativeCurrency: ETH,
    blockExplorerUrls: ["https://goerli.etherscan.io"],
  },
  // 1337: {
  //   urls: ["http://localhost:8545"].filter(
  //     (url) => url !== undefined
  //   ) as string[],
  //   nativeCurrency: TFI,
  //   name: "Localhost (dev)",
  //   blockExplorerUrls: ["http://localhost:3001"], // use https://github.com/xops/expedition locally
  // },
  1337: {
    urls: ["http://localhost:8545"].filter(
      (url) => url !== undefined
    ) as string[],
    nativeCurrency: TFI,
    name: "Localhost (dev)",
    blockExplorerUrls: ["http://localhost:3001"], // use https://github.com/xops/expedition locally
  },
};

export const URLS: { [chainId: number]: string[] } = Object.keys(
  CHAINS
).reduce<{ [chainId: number]: string[] }>((accumulator, chainId) => {
  const validURLs: string[] = CHAINS[Number(chainId)].urls;

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs;
  }

  return accumulator;
}, {});

/**
 * Handle switching a chain, or adding if it doesnt exist and then switching
 * @param desiredChainId
 * @param connector
 * @param chainId
 * @param setError
 * @returns
 */
export const doSwitchChain = async (
  desiredChainId: number,
  provider: Provider,
  chainId: number,
  setError: (err: string) => void
) => {
  const currentChainId = chainId;
  // debugger;
  if (currentChainId !== desiredChainId) {
    // TODO: make this work general across all chains for Torus
    const torus = (window as any).torus;
    if (torus && torus.provider) {
      try {
        await torus.setProvider({
          host: "goerli", // default : 'mainnet'
        });
        torus.provider._handleChainChanged({ chainId: 5, networkVersion: 1 });
        return;
      } catch (err) {
        console.error(err);
      }
    }
    try {
      const targetChainId = ethers.utils
        .hexlify(desiredChainId!)
        .replace("x0", "x");

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      console.error(switchError);
      if (switchError.code === 4902) {
        const desiredChain = getAddChainParameters(
          desiredChainId
        ) as AddEthereumChainParameter;
        try {
          const targetChainId = ethers.utils
            .hexlify(desiredChainId!)
            .replace("x0", "x");
          const params = [
            {
              ...desiredChain,
              chainId: targetChainId,
            },
          ];
          await provider.request({
            method: "wallet_addEthereumChain",
            params,
          });
        } catch (addError) {
          setError("Need to add correct network");
          return true;
        }
      }
    }
  }
};
