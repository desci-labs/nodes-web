import { associateWallet, getAccountNonce } from "@api/index";
import { shortAccount } from "@components/utils";
import { IconTriangleRight } from "@icons";
import * as React from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import WarningSign from "./warning-sign";
import { SiweMessage } from "siwe";
import { DEFAULT_CHAIN } from "@components/molecules/ConnectWithSelect";
import { useWeb3React } from "@web3-react/core";
import { SpinnerCircular } from "spinners-react";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useSetter } from "@src/store/accessors";
import { Wallet } from "@src/state/api/types";

const SignatureRequestButton = ({
  className,
  account,
  // setUserProfile,
  signer,
  children,
}: any) => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useSetter();

  const domain = window.location.host;
  const origin = window.location.origin;
  async function createSiweMessage(address: string, statement: string) {
    const nonce = await getAccountNonce();
    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: "1",
      chainId: DEFAULT_CHAIN,
      nonce: nonce,
    });
    return message.prepareMessage();
  }

  async function signInWithEthereum() {
    const message = await createSiweMessage(
      await signer.getAddress(),
      "Sign in with Ethereum to the app."
    );
    const signature = await signer.signMessage(message);

    await associateWallet(account, message, signature);
  }

  return (
    <>
      <button
        onClick={async () => {
          setLoading(true);
          try {
            await signInWithEthereum();
            console.log("Refresh User data");
            dispatch(api.util.invalidateTags([tags.user]));
            // const userData = await getUserData();
            // setUserProfile(userData);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className={`text-lg px-5 py-3 self-center flex items-center text-black rounded-md mt-5 font-bold ${className} ${
          loading ? "bg-gray-600 cursor-not-allowed hover:bg-gray-600" : ""
        }`}
      >
        {loading ? (
          <div className="flex gap-2 py-4">
            Confirm in wallet <SpinnerCircular color="white" size={20} />
          </div>
        ) : (
          children
        )}
      </button>
    </>
  );
};

interface WalletAccountProps {
  account: string;
  associated: boolean;
  active?: boolean;
  canAssociate?: boolean;
  serverWallet?: Wallet;
  className?: string;
}

const AccountCard = ({
  account,
  associated,
  active,
  canAssociate,
  serverWallet,
}: WalletAccountProps) => {
  const [showMore, setShowMore] = React.useState(false);
  const { hooks } = useWeb3React();
  const { usePriorityProvider } = hooks;
  const provider = usePriorityProvider();
  // @ts-ignore
  const signer = provider?.getSigner?.();

  if (!associated) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-md mb-0 mt-0 w-full">
        <div className="relative border-0 px-10 border-gray-600 p-10 bg-gray-800 m-2 overflow-hidden rounded-md text-gray-100 self-center shadow-lg">
          <div className="text-center text-xs absolute top-0 left-0 w-full bg-black py-1 pt-1.5 text-gray-400">
            New Web3 Account Detected
          </div>
          <div className="flex flex-row justify-center items-center gap-4 text-lg py-6 font-mono">
            <div className="-mb-1">
              <Jazzicon diameter={20} seed={jsNumberForAddress(account)} />
            </div>
            {shortAccount(account)}
          </div>
          <div className="flex flex-col">
            {canAssociate ? (
              <>
                {" "}
                <div className="flex flex-row gap-2 items-center mb-3 rounded-md text-[10px]">
                  {/* <InformationCircleIcon width={16} className="" /> */}
                  Make sure this is the account you want to use
                </div>{" "}
                {/* {hasPreviousAssociation ? (
                  <span>
                    You should switch to one of your other accounts below
                  </span>
                ) : null} */}
                <SignatureRequestButton
                  account={account}
                  signer={signer}
                  // setUserProfile={setUserProfile}
                  className="text-sm px-5 py-1 self-center flex items-center bg-tint-primary hover:bg-tint-primary-hover text-black rounded-md mt-5 font-bold"
                >
                  Start Using <IconTriangleRight />
                </SignatureRequestButton>
              </>
            ) : (
              <>
                <div className="w-96 text-center bg-yellow-200 text-black p-3">
                  You've already associated a Web3 account
                  <br />
                  <br />{" "}
                  <strong>Please switch to the associated account below</strong>
                </div>
                <div>
                  <div
                    className="text-[9px] cursor-pointer text-gray-400 mt-1 hover:text-gray-200 text-right"
                    onClick={() => setShowMore(!showMore)}
                  >
                    Advanced options
                  </div>

                  <div
                    className={`${
                      !showMore ? "h-0" : "h-32"
                    } overflow-hidden transition-all`}
                  >
                    <span className="text-red-300 text-[10px] leading-3 w-72 block mx-auto">
                      Warning: Adding multiple accounts is for advanced users.
                      Make sure you switch to the desired account in your wallet
                      (MetaMask) before committing a Node.
                    </span>
                    <SignatureRequestButton
                      account={account}
                      signer={signer}
                      // setUserProfile={setUserProfile}
                      className="mx-auto text-sm px-5 py-1 self-center flex items-center bg-transparent border-2 fill-current text-tint-primary hover:text-tint-primary-hover border-tint-primary hover:border-tint-primary-hover rounded-md mt-5 font-bold"
                    >
                      <WarningSign width={20} />
                      &nbsp; Start Using New Account&nbsp;
                      <IconTriangleRight width={14} />
                    </SignatureRequestButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row rounded-md mb-0 mt-0 w-full">
        <div className=" border-2 border-gray-600 px-10  bg-transparent m-1 w-full rounded-md text-gray-100 self-center shadow-lg">
          <div className="flex flex-row justify-center items-center gap-4 text-xs py-2.5 font-mono">
            <div className="-mb-1">
              <Jazzicon diameter={20} seed={jsNumberForAddress(account)} />
            </div>
            {shortAccount(account)}
            <span className="text-tint-primary">
              ({serverWallet?.nickname})
            </span>

            {/* <button className="self-center flex items-center bg-tint-primary hover:bg-tint-primary-hover text-black px-5 py-3 rounded-md text-2xl">
              Switch To
            </button> */}
          </div>

          {active ? (
            <div className="block mb-2 w-32 mx-auto py-0 text-center bg-gradient-to-r select-none via-[#104356] from-transparent text-white opacity-70 p-2 text-[9px]">
              Current Account
            </div>
          ) : null}
        </div>
      </div>
    );
  }
};
export default AccountCard;
