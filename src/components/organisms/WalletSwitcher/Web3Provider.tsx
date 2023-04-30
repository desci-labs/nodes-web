import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { Network } from "@web3-react/network";
import { WalletConnect } from "@web3-react/walletconnect";
import {
  coinbaseWallet,
  hooks as coinbaseWalletHooks,
} from "@connectors/coinbaseWallet";
import { hooks as metaMaskHooks, metaMask } from "@connectors/metaMask";
import { hooks as networkHooks, network } from "@connectors/network";
import {
  hooks as walletConnectHooks,
  walletConnect,
} from "@connectors/walletConnect";
import { hooks as torusHooks, web3Auth } from "@connectors/web3auth";
import { Web3AuthConnector } from "@lib/web3auth";

const connectors: [
  MetaMask | WalletConnect | CoinbaseWallet | Web3AuthConnector | Network,
  Web3ReactHooks
][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [web3Auth, torusHooks],
  [network, networkHooks],
];

export default function Web3Provider({ children }: any) {
  return (
    <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
  );
}
