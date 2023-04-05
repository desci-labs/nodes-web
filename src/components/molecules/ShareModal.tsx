import { ButtonHTMLAttributes, useMemo, useState } from "react";
import Modal from "@src/components/molecules/Modal/Modal";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";
import {
  SwitchBar,
  SwitchButton,
} from "@src/components/atoms/SwitchBar/SwitchBar";
import NodeInvite from "@src/components/molecules/NodeShare/Invite/Invite";
import SharePublished from "@src/components/molecules/NodeShare/SharePublished/SharePublished";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useUser } from "@src/state/user/hooks";
import { useGetNodesQuery } from "@src/state/api/nodes";
import ButtonSecondary from "../atoms/ButtonSecondary";
import { IconCopyLink } from "@src/icons";
import { useCopier } from "./Copier";

enum ShareTabs {
  Invite = "Invite",
  Public = "Public",
}

export default function ShareModal() {
  const { currentObjectId, publicView } = useNodeReader();
  const user = useUser();
  const { data: nodes } = useGetNodesQuery();
  const versions = useNodeVersions(currentObjectId);
  const { showShareMenu, setShowShareMenu } = useManuscriptController([
    "showShareMenu",
  ]);

  const canSendInvite = useMemo(() => {
    if (publicView || !user) return false;

    // TODO: in future add more sophisticated check for user permissions
    const isOwner = nodes?.find(
      (n) => n.uuid === currentObjectId && n?.ownerId === user.userId
    );
    return !!isOwner;
  }, [publicView, user, nodes, currentObjectId]);

  const canSharePublished = publicView || !!versions;

  const [currentTab, setCurrentTab] = useState(() =>
    canSendInvite ? ShareTabs.Invite : ShareTabs.Public
  );

  const close = () => {
    setShowShareMenu(false);
  };

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
              disabled={!canSharePublished}
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
      {currentTab === ShareTabs.Invite && (
        <Modal.Footer>
          <div className="flex items-center justify-start w-full">
            <CopyShareLink link="private link" />
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
}

export function CopyShareLink(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    link: string;
  }
) {
  const { handleCopy, copied } = useCopier();

  return (
    <ButtonSecondary
      className="capitalize group"
      onClick={() => handleCopy(props.link)}
      disabled={copied}
    >
      <IconCopyLink
        className={`${
          copied ? "fill-neutrals-gray-7" : "fill-white group-hover:fill-black"
        } `}
        width={20}
        height={20}
      />
      <span>{copied ? "Link copied" : "Copy Read-Only link"}</span>
    </ButtonSecondary>
  );
}
