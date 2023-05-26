import { useEffect, useState } from "react";
// import { ConnectWithSelect } from "@components/molecules/ConnectWithSelect";
// import { eagerlyConnect } from "@connectors/useDefaultWeb3";
import MetaMaskCard from "./connectorCards/MetaMaskCard";
import WalletConnectCard from "./connectorCards/WalletConnectCard";
import CoinbaseWalletCard from "./connectorCards/CoinbaseWalletCard";
import Web3AuthCard from "./connectorCards/Web3AuthCard";

// export const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
//   (actions) => new MetaMask(actions)
// );

// const Chain = ({
//   chainId,
// }: {
//   chainId: ReturnType<Web3ReactHooks["useChainId"]>;
// }) => {
//   if (chainId === undefined) return null;

//   const name = chainId ? CHAINS[chainId]?.name : undefined;

//   if (name) {
//     return (
//       <div>
//         Chain:{" "}
//         <b>
//           {name} ({chainId})
//         </b>
//       </div>
//     );
//   }

//   return (
//     <div>
//       Chain Id: <b>{chainId}</b>
//     </div>
//   );
// };

// const Status = ({
//   isActivating,
//   error,
//   isActive,
// }: {
//   isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
//   error: ReturnType<Web3ReactHooks["useError"]>;
//   isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
// }) => {
//   return (
//     <div>
//       {error ? (
//         <>
//           🔴 {error.name ?? "Error"}
//           {error.message ? `: ${error.message}` : null}
//         </>
//       ) : isActivating ? (
//         <>🟡</>
//       ) : isActive ? (
//         <>🟢</>
//       ) : (
//         <>⚪️</>
//       )}
//     </div>
//   );
// };

import { SlideDownContainer } from "../PopOver/CommitAdditionalInfoPopover";
import { IconChevronDown, IconChevronUp } from "@icons";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";

const WalletSwitcher = () => {
  const [closed, setClosed] = useState(true);

  return (
    <>
      <div className="text-gray-900 justify-center items-center w-[25rem] flex overflow-x-hidden overflow-y-auto relative inset-0 z-50 outline-none focus:outline-none pointer-events-none">
        <div className=" relative w-auto my-0 mx-auto max-w-3xl">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full  outline-none focus:outline-none pointer-events-auto">
            {/*header*/}
            <div className="flex flex-col items-start justify-between p-5 border-solid border-blueGray-200 rounded-t w-[25rem]">
              {/* <h3 className="">Connect a wallet</h3> */}
              <div className="text-center my-1 mt-0 select-none bg-gray-800 p-2 py-1.5 border border-gray-700 text-gray-200 rounded-md text-[10px] w-full leading-4">
                By continuing you agree to the DeSci Labs{" "}
                <a
                  href="/terms"
                  className="text-tint-primary hover:text-tint-primary-hover font-bold"
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e: any) => window.open(e.target.href)}
                >
                  Terms of Service
                </a>
              </div>

              <Web3AuthCard />
              <button
                className="text-gray-300 text-[10px] mt-5 flex fill-current text-right w-full flex-row-reverse items-center hover:text-white"
                onClick={() => {
                  if (!closed) {
                    postUserAction(
                      AvailableUserActionLogTypes.walletMoreOptions
                    );
                  }
                  setClosed(!closed);
                }}
              >
                {closed ? "More options" : "Less options"}
                {closed ? (
                  <IconChevronDown height={12} />
                ) : (
                  <IconChevronUp height={12} />
                )}
              </button>
              <SlideDownContainer
                className="overflow-hidden w-full pb-1"
                closed={closed}
                transitionOnAppear={true}
              >
                <MetaMaskCard />
                <WalletConnectCard />
                <CoinbaseWalletCard />
              </SlideDownContainer>
              {/* <NetworkCard /> */}
            </div>
          </div>
        </div>
      </div>
      {/* <div
        className="opacity-25 fixed inset-0 z-40 bg-black"
        onClick={() => {
          setSelectingWallet(false);
        }}
      ></div> */}
    </>
  );
};

export default WalletSwitcher;
