import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useCallback, useMemo, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import useConnectedWallet from "@src/hooks/useConnectedWallet";
import { TodoItem } from "./TodoItem";
import { useUser } from "@src/state/user/hooks";
import WalletManagerModal from "@src/components/molecules/WalletManagerModal";

interface GeneralProps {
  className?: string;
}

const General = (props: GeneralProps) => {
  const { setShowProfileUpdater } = useManuscriptController([
    "showProfileUpdater",
  ]);
  const [openWalet, setOpenWallet] = useState(false);
  const userProfile = useUser();
  const { wallet, switchNetwork } = useConnectedWallet();
  const { connector } = useWeb3React();
  // one entry for each component, one entry for wallet, one entry for network
  const count = 2;
  const isProfileComplete = useMemo(
    () => !!userProfile.email && !!userProfile.profile?.name,
    [userProfile.email, userProfile.profile?.name]
  );

  return (
    <div className={props.className}>
      <CollapsibleSection
        startExpanded={true}
        className="bg-transparent dark:bg-transparent border-0 dark:border-transparent border-b-none rounded-none"
        headerClass="bg-neutrals-black dark:bg-neutrals-black"
        title={
          <span>
            General
            <pre className="inline font-normal text-xs text-gray-300">
              ({count})
            </pre>
          </span>
        }
      >
        <div>
          <TodoItem
            title="Complete your profile"
            subtitle="Give us information about yourself"
            completed={isProfileComplete}
            editable
            onFixClick={() => {
              setShowProfileUpdater(true);
            }}
          />
          <TodoItem
            title="Connect Wallet"
            subtitle="Wallet needed for commit"
            completed={wallet.isValidWallet}
            onFixClick={() => {
              setOpenWallet(true);
            }}
          />

          <TodoItem
            title="Select Network"
            subtitle="Ensure correct blockchain"
            completed={wallet.isValidNetwork}
            onFixClick={() => {
              if (!connector.provider) {
                setOpenWallet(true);
                return;
              }
              switchNetwork();
            }}
          />
        </div>
      </CollapsibleSection>
      <WalletManagerModal
        isOpen={openWalet}
        onDismiss={useCallback(() => setOpenWallet(false), [setOpenWallet])}
      />
    </div>
  );
};

export default General;
