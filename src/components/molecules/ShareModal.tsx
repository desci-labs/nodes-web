import { useState } from "react";
import Modal from "@src/components/molecules/Modal/Modal";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";
import {
  SwitchBar,
  SwitchButton,
} from "@src/components/atoms/SwitchBar/SwitchBar";
import NodeInvite from "@src/components/molecules/NodeShare/Invite/Invite";
import SharePublished from "@src/components/molecules/NodeShare/SharePublished/SharePublished";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

enum ShareTabs {
  Invite = "Invite",
  Public = "Public",
}

export default function ShareModal() {
  const {
    manifest: manifestData,
    currentObjectId,
    publicView,
  } = useNodeReader();
  const versions = useNodeVersions(currentObjectId);
  const { showShareMenu, setShowShareMenu } = useManuscriptController([
    "showShareMenu",
  ]);
  const [currentTab, setCurrentTab] = useState(() =>
    publicView ? ShareTabs.Public : ShareTabs.Invite
  );

  const close = () => {
    setShowShareMenu(false);
  };

  const canShare = publicView || !!versions;
  console.log(canShare, publicView, versions);
  return (
    <Modal
      isOpen={showShareMenu}
      onDismiss={close}
      $maxWidth={600}
      $scrollOverlay={true}
    >
      <div className="px-6 py-5 text-white relative min-w-[600px]">
        <Modal.Header title="Share Research Node" onDismiss={close} />
        <div className="flex items-center justify-center w-full">
          <SwitchBar
            style={{ margin: "1rem 0 1rem 0", height: 35, maxWidth: 400 }}
          >
            <SwitchButton
              isSelected={currentTab === ShareTabs.Invite}
              onClick={() => setCurrentTab(ShareTabs.Invite)}
            >
              <p className="text-xs flex justify-center items-center h-full capitalize">
                Invite Collaborator
              </p>
            </SwitchButton>
            <SwitchButton
              isSelected={currentTab === ShareTabs.Public}
              onClick={() => setCurrentTab(ShareTabs.Public)}
              disabled={!canShare}
            >
              <p className="text-xs flex justify-center items-center h-full capitalize">
                Share Published version
              </p>
            </SwitchButton>
          </SwitchBar>
        </div>
        {currentTab === ShareTabs.Invite && <NodeInvite />}
        {currentTab === ShareTabs.Public && <SharePublished />}
      </div>
    </Modal>
  );
}
