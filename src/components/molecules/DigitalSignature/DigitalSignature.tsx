import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

import cx from "classnames";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconCircleCheck, IconWallet } from "@icons";
import { shortAccount } from "@components/utils";
import { useUser } from "@src/state/user/hooks";
import { useGetter } from "@src/store/accessors";

const DigitalSignature = () => {
  const { account } = useWeb3React();
  const userProfile = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const {
    torusKey,
    orcid: { orcidData },
  } = useGetter((state) => state.preferences);

  const { setShowWalletManager } = useManuscriptController();

  useEffect(() => {
    if (
      userProfile &&
      userProfile.wallets &&
      userProfile.wallets.filter((w: any) => w.address === account).length > 0
    ) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [userProfile, account]);

  return (
    <div
      className={`hover:bg-[#222429] bg-[#191B1C] cursor-pointer group ${
        !orcidData || !torusKey.publicAddress
          ? `hover:bg-gray-100 bg-white cursor-pointer`
          : `hover:bg-gray-800 cursor-default`
      }`}
      onClick={async () => {
        setShowWalletManager(true);
        return false;
      }}
    >
      <div className="">
        <button
          type="button"
          className={cx(
            false
              ? "bg-gray-100 text-gray-900"
              : `${
                  !torusKey.publicAddress ? "" : "cursor-default"
                } text-gray-700`,
            "flex w-full align-middle bg-neutrals-gray-1 hover:bg-neutrals-gray-2 cursor py-2 px-[18px] border border-[#3C3C3C] rounded-lg text-base dark:text-neutrals-white "
          )}
        >
          <div className="text-sm font-medium text-gray-900 justify-start flex w-full">
            {isConnected ? (
              <div className="text-white flex flex-row items-center gap-2 w-full">
                <IconWallet width={32} className="-mb-1" />{" "}
                <div className="">{shortAccount(account || "")}</div>
                <div className="flex grow justify-end">
                  <IconCircleCheck
                    color={"#00A180"}
                    className="w-8 h-8"
                    fill={"#00A180"}
                  />
                </div>
              </div>
            ) : (
              <div className="text-white flex flex-row items-center gap-2">
                <IconWallet width={32} className="-mb-1" /> Connect Digital
                Signature
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default DigitalSignature;
