import { DEFAULT_CHAIN } from "@components/molecules/ConnectWithSelect";
import { doSwitchChain } from "@components/../chains";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import { Wallet } from "@src/state/api/types";
import { useUser } from "@src/state/user/hooks";

interface State {
  isConnected: boolean;
  connectedWallet: Wallet | null;
  isValidWallet: boolean;
  isValidNetwork: boolean;
  error: boolean;
}

const defaultState: State = {
  error: false,
  connectedWallet: null,
  isConnected: false,
  isValidNetwork: false,
  isValidWallet: false,
};

export default function useConnectedWallet() {
  const [state, setState] = useState<State>(defaultState);
  const { account, chainId, hooks, connector } = useWeb3React();
  const { usePriorityProvider } = hooks;
  const provider = usePriorityProvider();
  const userProfile = useUser();
  const switchChain = useCallback(doSwitchChain, [
    provider,
    () => setState({ ...state, error: true, isValidNetwork: false }),
  ]);

  useEffect(() => {
    const connectedWallet =
      userProfile &&
      userProfile.wallets &&
      userProfile.wallets.filter((w: any) => w.address === account);
    if (connectedWallet && connectedWallet.length > 0) {
      setState((prev) => ({
        ...prev,
        error: false,
        isValidWallet: true,
        isConnected: true,
        connectedWallet: connectedWallet[0],
        isValidNetwork: chainId === DEFAULT_CHAIN,
      }));
    } else {
      // setIsConnected(false);
      setState((prev) => ({
        ...prev,
        error: true,
        isValidWallet: false,
        isConnected: false,
        connectedWallet: connectedWallet[0],
        isValidNetwork: chainId === DEFAULT_CHAIN,
      }));
    }
  }, [userProfile, chainId, account]);

  const switchNetwork = () =>
    switchChain(DEFAULT_CHAIN, connector.provider!, chainId!, () =>
      setState({ ...state, error: true, isValidNetwork: false })
    );

  return { wallet: state, switchNetwork };
}
