import AccountCard from "@components/atoms/AccountCard";
import LinkExternal from "@components/atoms/LinkExternal";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { getName } from "@components/utils";
import { IconHamburger, IconTriangleLeft, IconTriangleRight } from "@icons";
import { useWeb3React } from "@web3-react/core";
import * as React from "react";
import toast from "react-hot-toast";
import WalletSwitcher from "./WalletSwitcher";
import { Wallet } from "@src/state/api/types";
import { useUser } from "@src/state/user/hooks";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";

const IdentityList = ({ setSelectingWallet }: IdentityProps) => {
  const { wallets } = useManuscriptController(["wallets"]);
  const { connector, accounts } = useWeb3React();

  console.log(`Priority Connector is: ${getName(connector)}`);

  const associatedAccounts: Wallet[] = wallets?.filter(
    (w) => !accounts || w.address !== accounts[0]
  );
  const hasAssociated = associatedAccounts && associatedAccounts.length;

  const isConnected = associatedAccounts?.length < wallets?.length;

  const connectedAccount = accounts?.map((a: string) => {
    return (
      <AccountCard
        key={a}
        className="pt-10 flex self-center"
        account={a}
        associated={!!(wallets || []).filter((w) => w.address === a).length}
        serverWallet={(wallets || []).find((w) => w.address === a)}
        active={true}
        canAssociate={!hasAssociated}
      />
    );
  });

  const associatedAccountMsg = hasAssociated ? (
    <div>
      <div className="text-md pt-10">{`${
        isConnected ? "Other" : "Associated"
      } Accounts`}</div>
      <div className="text-muted-300 text-[10px] mb-4">
        You may only commit to chain using one your associated accounts
      </div>
    </div>
  ) : null;

  const associatedAccountRender = associatedAccounts?.map(
    (a: Wallet, i: number) => {
      return (
        <AccountCard
          key={a.address}
          className={`${i < 1 ? "pt-10" : null} flex self-center`}
          account={a.address}
          serverWallet={a}
          associated={true}
        />
      );
    }
  );

  return (
    <div className="w-full flex flex-col mx-20">
      {!accounts || !accounts.length ? (
        <div className="my-10 flex flex-col">
          <div className="text-center">No Wallet Connected</div>{" "}
          <PrimaryButton
            className="mt-5 items-center gap-2 flex justify-center"
            onClick={() => {
              setSelectingWallet(true);
            }}
          >
            Connect Wallet <IconTriangleRight height={16} />
          </PrimaryButton>
        </div>
      ) : null}
      {connectedAccount}
      {associatedAccountMsg}
      {associatedAccountRender}
    </div>
  );
};

interface IdentityProps {
  //   hooks: Web3ReactHooks;
  //   connector: Connector;
  setSelectingWallet: any;
}

const WalletManager = () => {
  const { wallets, setWallets } = useManuscriptController([
    "selectingWallet",
    "wallets",
  ]);
  const userProfile = useUser();
  const { account, accounts } = useWeb3React();
  const noAccounts = !accounts || !accounts.length;
  const [options, setOptions] = React.useState(noAccounts);
  const accountRef = React.useRef<string>();

  React.useEffect(() => {
    console.log("[OPTIONS]", account, accountRef.current);
    if (account && !accountRef.current) {
      // debugger;
      // auto switch from Options once wallet is selected
      setOptions(false);
      accountRef.current = account;
      if (options) {
        toast.success("Your wallet was connected", {
          duration: 2000,
          position: "top-center",
          style: {
            marginTop: 0,
            borderRadius: "10px",
            background: "#111",
            color: "#fff",
          },
        });
        postUserAction(AvailableUserActionLogTypes.connectWallet);
      }
    }
    accountRef.current = account;
  }, [account, options]);

  React.useEffect(() => {
    setWallets(userProfile.wallets);
  }, [userProfile, setWallets]);

  const gift = wallets && wallets.find((w) => w.extra)?.extra;

  return (
    <div
      className="block select-none"
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="text-muted-300 text-[11px] -mt-3">
        Secure digital signatures are enabled by cryptography software known as
        a wallet{" "}
        <LinkExternal
          url="https://ethereum.org/wallets"
          className="inline-flex text-[10px]"
        >
          Learn more
        </LinkExternal>
        {!!userProfile.wallets}
      </div>
      <div className=" p-5 mt-5 rounded-lg flex flex-col items-center">
        {!noAccounts ? (
          <PrimaryButton
            className="mt-0 absolute text-[0.65rem] top-5 w-32 right-5 px-1 py-1 border-[1px] rounded-md whitespace-nowrap justify-center mr-0 mb-5 items-center gap-0 flex self-end bg-transparent border-2 border-gray-700 text-gray-300 hover:bg-gray-700"
            onClick={() => {
              setOptions(!options);
            }}
          >
            {!options ? (
              <IconHamburger
                strokeWidth={0.5}
                fill={"rgb(209, 213, 219)"}
                height={12}
              />
            ) : (
              <IconTriangleLeft
                fill={"rgb(209, 213, 219)"}
                height={12}
                width={10}
              />
            )}

            <div className="text-right w-full -ml-10 self-end">
              {!options ? "Wallet Options" : "Back"}
            </div>
          </PrimaryButton>
        ) : null}
        <div
          className={`${
            !options
              ? "hidden"
              : "-mb-[23rem] md:min-w-[482px] flex justify-center"
          }`}
        >
          <WalletSwitcher />
        </div>
        {gift && !options ? (
          <div className="px-4 text-[9px] h-8 -mt-8 border-2 border-tint-primary text-tint-primary rounded-lg flex justify-center items-center mb-4 gap-2">
            DeSci Labs sponsored you with test funds
            <LinkExternal
              url={`https://goerli.etherscan.io/tx/${gift}`}
              className="text-[9px]"
            >
              View transaction
            </LinkExternal>
          </div>
        ) : null}
        <div
          className={`${options ? "invisible h-96" : "flex md:min-w-[482px]"}`}
        >
          <IdentityList setSelectingWallet={setOptions} />
        </div>
      </div>
    </div>
  );
};

export default WalletManager;
