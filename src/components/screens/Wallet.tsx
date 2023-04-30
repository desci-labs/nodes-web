/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";
import Jazzicon from "react-jazzicon";
import { useNavigate } from "react-router-dom";
import WalletStatus from "../../../images/placeholder-status.png";
import WalletStatusSuccess from "../../../images/placeholder-status-success.png";

import WarningSign from "@images/warning-sign.svg";
import Todo from "@images/todo.svg";
import { shortAccount, __log } from "@components/utils";
import { useEffectOnce } from "react-use";
import { useWeb3React } from "@web3-react/core";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useSetter } from "@src/store/accessors";
import { useUser } from "@src/state/user/hooks";

export default function Wallet() {
  const userProfile = useUser();
  const { connector, account } = useWeb3React();
  const dispatch = useSetter();
  const [orcidData] = useState({});
  useEffect(() => {}, [orcidData]);

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  const [, setMounted] = useState(false);
  useEffectOnce(() => {
    setMounted(true);
  });

  const navigate = useNavigate();
  __log("<Wallet>");
  // const { data: userDataFetched, error: errorFetched } = useSWR(
  //   mounted ? "getUserData" : null,
  //   getUserData
  // );

  useEffect(() => {
    if (!userProfile || !userProfile.userId) {
      (async () => {
        // debugger;
        // setUserData(userDataFetched);
        dispatch(api.util.invalidateTags([{ type: tags.user }]));
        console.log("[Wallet]::Refresh User data");
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cursor-pointer col-span-1 flex flex-col text-center bg-white shadow divide-y divide-gray-200">
      <div className="flex-1 flex flex-col p-8">
        <h3 className="mt-6 text-gray-900 text-2xl font-bold">
          Welcome to DeSci Nodes
        </h3>
        <p className="mt-6 text-gray-900 text-lg font-normal">
          We rely on cryptographic technologies for long-term decentralised
          identity management.
        </p>
        <p className="text-center m-auto">
          {!userProfile || !!userProfile.wallets || !account ? (
            <img
              src={account ? WalletStatusSuccess : WalletStatus}
              className="h-80"
              alt=""
            />
          ) : (
            <></>
          )}
        </p>

        <span className="text-gray-300">
          {account ? `WALLET CONNECTED ${account}` : "not connected"}
        </span>
        <br />
        <span className="text-gray-300">
          {userProfile && userProfile.wallets
            ? `${JSON.stringify(userProfile.wallets)}`
            : !account
            ? "Wallet Not Yet Associated -- Create Wallet or Choose Existing Wallet"
            : "Wallet Not Yet Associated -- you must associate the wallet to continue. this involves signing a transaction."}
        </span>
        {!account ? (
          <div className="w-59 text-center m-auto mt-10 mb-10">
            {!userProfile || !userProfile.wallets ? (
              <button
                onClick={() => {
                  // const connector: TorusConnector =
                  //   connectorsByName.Torus as TorusConnector;
                  setActivatingConnector(connector);
                  // activate(connector);
                  // console.log('torus', connector.torus)
                  // connector.torus.login();
                  // debugger
                }}
                type="button"
                className="w-80 inline-flex items-center justify-center px-6 py-3 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create new Wallet
                {/* {activating && <span>Activating</span>}
                      {connected && (
                        <span role="img" aria-label="check">
                          ✅
                        </span>
                      )} */}
              </button>
            ) : (
              <></>
            )}
            <br />
            <button
              type="button"
              className="w-80 inline-flex items-center justify-center mt-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Use Existing Wallet
            </button>
          </div>
        ) : userProfile?.wallets ? (
          <div className="w-59 text-center m-auto mt-10 mb-10">
            <button
              type="button"
              onClick={() => {
                navigate("/dashboard");
              }}
              className="w-80 inline-flex items-center justify-center px-6 py-3 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="w-59 text-center m-auto mt-10 mb-10">
            <div className="flex items-center bg-gray-100 p-3 w-full justify-center">
              <img className="h-5 px-3" src={WarningSign} alt="warning sign" />
              <span className="text-sm text-gray-400">
                This action is not reversible
              </span>
            </div>
            <div className="flex align-text-bottom text-center bg-indigo-100 py-4 pt-0 pb-16 px-32 shadow-xl">
              <div className="text-center align-middle flex flex-col justify-center items-center pt-10">
                You are going to associate your email
                <div className="text-2xl font-bold mt-4">
                  sina@test.com
                  <br /> to the currently connected Ethereum wallet{" "}
                  <strong className="text-2xl flex flex-row justify-center items-center mt-4">
                    {account ? (
                      <Jazzicon
                        diameter={20}
                        seed={parseInt(account.substring(2), 16)}
                      />
                    ) : (
                      <></>
                    )}
                    <span className="block px-1">{shortAccount(account)}</span>
                  </strong>
                  <div className="flex items-center bg-gray-100 p-3 w-full justify-center mt-10">
                    <img className="h-6 px-2" src={Todo} alt="todo" />
                    <span className="text-sm text-gray-600">
                      Make sure this is the correct Ethereum wallet address and
                      ORCID
                    </span>
                  </div>
                  <br />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // await associateWallet(account);
                        navigate("/dashboard");
                      } catch (err) {
                        console.error(err);
                        alert("error");
                      }
                    }}
                    className="cursor-pointer w-80 inline-flex items-center justify-center px-6 mt-4 py-3 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Associate this Wallet to your ORCID
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
