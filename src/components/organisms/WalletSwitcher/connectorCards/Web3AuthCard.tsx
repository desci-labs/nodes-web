import { useEffect, useState } from "react";
import { hooks, web3Auth } from "@connectors/web3auth";
import { Card } from "@components/organisms/WalletSwitcher/Card";

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;

export default function Web3AuthCard() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState<Error | undefined>(undefined);

  // attempt to connect eagerly on mount
  useEffect(() => {
    // web3Auth.connectEagerly().catch(() => {
    //   console.debug("Failed to connect eagerly to torus");
    // });
  }, []);

  return (
    <Card
      connector={web3Auth}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  );
}
