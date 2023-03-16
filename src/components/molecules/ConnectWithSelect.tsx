import type { Web3ReactHooks } from "@web3-react/core";
import type { MetaMask } from "@web3-react/metamask";
import { Network } from "@web3-react/network";
import { WalletConnect } from "@web3-react/walletconnect";
// import { TorusWallet } from "@components/../lib/torus";
import type { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { FC, useCallback, useEffect, useState } from "react";
import { CHAINS, getAddChainParameters, URLS } from "@components/../chains";
import { Web3AuthConnector } from "@lib/web3auth";
if (!process.env.REACT_APP_DEFAULT_CHAIN) {
  alert("REACT_APP_DEFAULT_CHAIN needs to be set in dapp/.env");
}
export const DEFAULT_CHAIN = parseInt(
  process.env.REACT_APP_DEFAULT_CHAIN || "5"
);
function Select({
  chainId,
  switchChain,
  displayDefault,
  chainIds,
}: {
  chainId: number | undefined;
  switchChain: ((chainId: number) => void) | undefined;
  displayDefault: boolean;
  chainIds: number[];
}) {
  return (
    <select
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value));
      }}
      disabled={switchChain === undefined}
    >
      {displayDefault ? (
        <option value={DEFAULT_CHAIN}>Default Chain</option>
      ) : null}
      {chainIds.map((chainId) => (
        <option key={chainId} value={chainId}>
          {CHAINS[chainId]?.name ?? chainId}
        </option>
      ))}
    </select>
  );
}

export function ConnectWithSelect({
  connector,
  chainId,
  isActivating,
  isActive,
  ButtonText,
  error,
  setError,
}: {
  connector:
    | MetaMask
    | WalletConnect
    | CoinbaseWallet
    | Network
    | Web3AuthConnector;
  chainId: ReturnType<Web3ReactHooks["useChainId"]>;
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  ButtonText?: FC;
}) {
  const isNetwork = connector instanceof Network;
  const displayDefault = !isNetwork;
  const chainIds = (isNetwork ? Object.keys(URLS) : Object.keys(CHAINS)).map(
    (chainId) => Number(chainId)
  );

  const [desiredChainId, setDesiredChainId] = useState<number>(
    isNetwork ? 1 : -1
  );

  const switchChain = useCallback(
    async (desiredChainId: number) => {
      setDesiredChainId(desiredChainId);
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) return;
      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) return;

      if (connector instanceof WalletConnect || connector instanceof Network) {
        await connector.activate(
          desiredChainId === -1 ? DEFAULT_CHAIN : desiredChainId
        );
      } else if (connector instanceof Web3AuthConnector) {
        await connector
          .activate
          // desiredChainId === -1 ? undefined : desiredChainId
          ();
      } else {
        // TODO: fix adding local dev chain if not already added
        await connector.activate(
          desiredChainId === -1
            ? getAddChainParameters(DEFAULT_CHAIN)
            : getAddChainParameters(desiredChainId)
        );
      }
    },
    [connector, chainId, setError]
  );

  useEffect(() => {
    if (chainId != DEFAULT_CHAIN) {
      switchChain(DEFAULT_CHAIN);
    }
  }, [chainId]);

  if (error) {
    return (
      <div className="flex flex-col w-full">
        {/* <Select
          chainId={desiredChainId}
          switchChain={switchChain}
          displayDefault={displayDefault}
          chainIds={chainIds}
        />
        <div style={{ marginBottom: "1rem" }} /> */}
        <button
          onClick={() =>
            connector instanceof WalletConnect || connector instanceof Network
              ? connector
                  .activate(
                    desiredChainId === -1 ? DEFAULT_CHAIN : desiredChainId
                  )
                  .then(() => setError(undefined))
                  .catch(setError)
              : // :
                //  connector instanceof TorusWallet
                // ? void connector
                //     .activate(
                //       desiredChainId === -1 ? DEFAULT_CHAIN : desiredChainId
                //     )
                //     .then(() => setError(undefined))
                //     .catch(setError)
                connector
                  .activate(
                    desiredChainId === -1
                      ? getAddChainParameters(DEFAULT_CHAIN)
                      : getAddChainParameters(desiredChainId)
                  )
                  .then(() => setError(undefined))
                  .catch(setError)
          }
        >
          Try Again?
        </button>
      </div>
    );
  } else if (isActive) {
    return (
      <div className="flex flex-col w-full">
        {/* <Select
          chainId={desiredChainId === -1 ? -1 : chainId}
          switchChain={switchChain}
          displayDefault={displayDefault}
          chainIds={chainIds}
        />
        <div style={{ marginBottom: "1rem" }} /> */}
        <button
          onClick={() => {
            if (connector?.deactivate) {
              void connector.deactivate();
            } else {
              void connector.resetState();
            }
          }}
        >
          {ButtonText ? <ButtonText /> : <>Disconnect</>}
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col w-full">
        {/* <Select
          chainId={desiredChainId}
          switchChain={isActivating ? undefined : switchChain}
          displayDefault={displayDefault}
          chainIds={chainIds}
        /> */}
        {/* <div style={{ marginBottom: "1rem" }} /> */}
        <button
          onClick={
            isActivating
              ? undefined
              : () =>
                  connector instanceof WalletConnect ||
                  connector instanceof Network
                    ? connector.activate(
                        desiredChainId === -1 ? DEFAULT_CHAIN : desiredChainId
                      )
                    : connector.activate(
                        desiredChainId === -1
                          ? getAddChainParameters(DEFAULT_CHAIN)
                          : getAddChainParameters(desiredChainId)
                      )
          }
          disabled={isActivating}
        >
          {ButtonText ? <ButtonText /> : <>Connect</>}
        </button>
      </div>
    );
  }
}
