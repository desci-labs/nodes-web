import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { useMemo, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import ComponentMetadataPopover from "@components/organisms/PopOver/ComponentMetadataPopover";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import useConnectedWallet from "@src/hooks/useConnectedWallet";
import { TodoItem } from "./TodoItem";
import { useUser } from "@src/state/user/hooks";
import { useNodeReader } from "@src/state/nodes/hooks";

interface GeneralProps {
  className?: string;
}

const General = (props: GeneralProps) => {
  const { setShowWalletManager, setShowProfileUpdater } =
    useManuscriptController(["showProfileUpdater"]);
  const { currentObjectId, mode, manifest: manifestData } = useNodeReader();
  const userProfile = useUser();
  const { wallet, switchNetwork } = useConnectedWallet();
  const { connector } = useWeb3React();
  const [selectedComponent, setSelectedComponent] =
    useState<ResearchObjectV1Component | null>(null);

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
              setShowWalletManager(true);
            }}
          />

          <TodoItem
            title="Select Network"
            subtitle="Ensure correct blockchain"
            completed={wallet.isValidNetwork}
            onFixClick={() => {
              if (!connector.provider) {
                setShowWalletManager(true);
                return;
              }
              switchNetwork();
            }}
          />
        </div>
      </CollapsibleSection>
      {/* {showProfileUpdater && <ProfilePopOver onClose={() => {}} />} */}
      {selectedComponent && (
        <ComponentMetadataPopover
          currentObjectId={currentObjectId!}
          manifestData={manifestData!}
          mode={mode}
          componentId={selectedComponent.id}
          isVisible={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
};

export default General;
