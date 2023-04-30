import { getLogo, getName } from "@components/utils";
import { Web3AuthConnector } from "@components/../lib/web3auth";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { Web3ReactHooks } from "@web3-react/core";
import { GnosisSafe } from "@web3-react/gnosis-safe";
import { MetaMask } from "@web3-react/metamask";
import { Network } from "@web3-react/network";
import { WalletConnect } from "@web3-react/walletconnect";
import { ConnectWithSelect } from "./ConnectWithSelect";
import { Status } from "./Status";

interface Props {
  connector:
    | MetaMask
    | WalletConnect
    | CoinbaseWallet
    | Network
    | GnosisSafe
    | Web3AuthConnector;
  chainId: ReturnType<Web3ReactHooks["useChainId"]>;
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
  ENSNames: ReturnType<Web3ReactHooks["useENSNames"]>;
  provider?: ReturnType<Web3ReactHooks["useProvider"]>;
  accounts?: string[];
}

export function Card({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
  ENSNames,
  accounts,
  provider,
}: Props) {
  const name = getName(connector);
  const Logo = getLogo(connector);
  return (
    <ConnectWithSelect
      connector={connector}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
    >
      <div
        className={`justify-between shadow-lg  hover:border-gray-50 select-none ${
          isActive ? "text-white border-white" : "border-gray-500 text-gray-300"
        }  flex w-full rounded-lg group text-xs leading-5 hover:bg-black overflow-hidden p-0`}
      >
        <div
          className={`text-left h-full  w-24 flex items-start justify-start group-hover:bg-gray-50 ${
            isActive ? "bg-white" : "bg-gray-200"
          } relative p-2`}
        >
          <Logo height={30} width={96} />
        </div>
        <div className="bg-gray-800 pt-[13px] pb-[13.5px] w-[calc(100%-96px)] flex rounded-r-lg group-hover:bg-gray-700">
          {connector instanceof Web3AuthConnector ? (
            <span className="w-96 text-tint-primary text-[10px] font-bold text-left flex justify-center items-center relative">
              Recommended
              <span className="text-gray-200 rounded-sm text-[8.5px] p-0 leading-3 font-normal px-0.5 ml-2  top-4 right-2">
                For New Users
              </span>
            </span>
          ) : (
            <b className="w-96 group-hover:text-white text-[10px] font-bold text-left flex justify-center items-center">
              {name}
            </b>
          )}
          <div className="flex justify-center items-center pr-5">
            <Status
              isActivating={isActivating}
              isActive={isActive}
              error={error}
            />
          </div>
        </div>

        {/* <Chain chainId={chainId} /> */}
      </div>
    </ConnectWithSelect>
  );
}
