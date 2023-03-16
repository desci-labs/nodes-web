import { initializeConnector } from "@web3-react/core";
import { Web3AuthConnector } from "@components/../lib/web3auth";
import { DEFAULT_CHAIN } from "@components/molecules/ConnectWithSelect";

export const [web3Auth, hooks] = initializeConnector<Web3AuthConnector>(
  (actions) =>
    new Web3AuthConnector(actions, {
      network: {
        rpcUrl: process.env.REACT_APP_DEFAULT_RPC_URL!,
        chainId: DEFAULT_CHAIN,
      },
      email: "sina@desci.com",
      apiKey: "pk_live_DABA746C4AC516F9", //"pk_live_B97D203294E263BE",
    } as any)
);
