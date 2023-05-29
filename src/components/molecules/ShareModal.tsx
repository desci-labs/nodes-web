import React, {
  ButtonHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal, { ModalProps } from "@src/components/molecules/Modal";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";
import { SwitchBar, SwitchButton } from "@src/components/atoms/SwitchBar";
import NodeInvite from "@src/components/molecules/NodeShare/Invite/Invite";
import SharePublished from "@src/components/molecules/NodeShare/SharePublished/SharePublished";
import {
  nodesApi,
  useCreateShareLinkMutation,
  useGetNodesQuery,
  usePrivateShareQuery,
  useRevokeShareLinkMutation,
} from "@src/state/api/nodes";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { IconCircleX, IconCopyLink } from "@src/icons";
import { useCopier } from "@src/components/molecules/Copier";
import { useSetter } from "@src/store/accessors";
import { tags } from "@src/state/api/tags";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { useUser } from "@src/state/user/hooks";

enum ShareTabs {
  Invite = "Invite",
  Public = "Public",
}

const ShareModal = React.memo((props: ModalProps) => {
  const user = useUser();
  const dispatch = useSetter();
  const { data: nodes } = useGetNodesQuery();
  const { currentObjectId, publicView } = useNodeReader();
  const versions = useNodeVersions(currentObjectId);
  const { data: shareId } = usePrivateShareQuery(currentObjectId!, {
    skip: !currentObjectId,
  });
  const [createShareLink, { isLoading, isSuccess: isCreated }] =
    useCreateShareLinkMutation();
  const [revokeShareLink, { isLoading: isRevoking }] =
    useRevokeShareLinkMutation();

  useEffect(() => {
    dispatch(
      nodesApi.util.invalidateTags([
        { type: tags.privateShare, id: currentObjectId },
      ])
    );
  }, [currentObjectId, dispatch, shareId]);

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
    canSharePublished ? ShareTabs.Public : ShareTabs.Invite
  );

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props?.onDismiss}
      $maxWidth={600}
      $scrollOverlay={true}
    >
      <div
        className={`px-6 py-5 text-white relative min-w-[600px] ${
          canSharePublished ? "" : "min-h-[200px]"
        }`}
      >
        <Modal.Header
          title="Share Research Node"
          onDismiss={props?.onDismiss}
        />
        {canSharePublished && canSendInvite ? (
          <div className="flex items-center justify-center w-full">
            <SwitchBar
              style={{ margin: "1rem 0 1rem 0", height: 35, maxWidth: 400 }}
            >
              <SwitchButton
                isSelected={currentTab === ShareTabs.Invite}
                onClick={() => canSendInvite && setCurrentTab(ShareTabs.Invite)}
                disabled={!canSendInvite}
              >
                <p className="text-xs flex justify-center items-center h-full capitalize font-inter font-bold">
                  Share privately
                </p>
              </SwitchButton>
              <SwitchButton
                isSelected={currentTab === ShareTabs.Public}
                onClick={() => setCurrentTab(ShareTabs.Public)}
                disabled={!canSharePublished}
              >
                <p className="text-xs flex justify-center items-center h-full capitalize font-inter font-bold">
                  Share Published version
                </p>
              </SwitchButton>
            </SwitchBar>
          </div>
        ) : null}
        {currentTab === ShareTabs.Invite && <NodeInvite />}
        {currentTab === ShareTabs.Public && <SharePublished />}
      </div>
      {currentTab === ShareTabs.Invite && canSendInvite && (
        <Modal.Footer>
          <div className="flex items-center justify-end w-full gap-2">
            {!shareId && (
              <PrimaryButton
                disabled={isLoading || isCreated}
                onClick={() => createShareLink(currentObjectId!)}
              >
                <div className="flex items-center">
                  {isLoading ? (
                    <DefaultSpinner color="white" size={24} />
                  ) : (
                    <IconCopyLink
                      className={`fill-black transition-colors ${
                        isLoading || isCreated ? "" : "group-hover:fill-white"
                      }`}
                      width={20}
                      height={20}
                    />
                  )}
                  <span className="ml-1 font-inter capitalize">
                    {isLoading ? "Creating link" : "Create private link"}
                  </span>
                </div>
              </PrimaryButton>
            )}

            {shareId && (
              <PrimaryButton
                disabled={isRevoking}
                onClick={() => revokeShareLink(currentObjectId!)}
                className="flex gap-1"
              >
                {isRevoking ? (
                  <DefaultSpinner color="white" size={20} />
                ) : (
                  <IconCircleX
                    className="fill-black group-hover:fill-black"
                    width={20}
                    height={20}
                  />
                )}
                <span className="ml-1">
                  {isRevoking ? "Revoking" : "Revoke link"}
                </span>
              </PrimaryButton>
            )}
            {shareId && <CopyShareLink link={getShareLink(shareId)} />}
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
});
export default ShareModal;

const getShareLink = (shareId: string) =>
  `${window.location.origin}/share/${shareId}`;

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
        className={`transition-colors ${
          copied
            ? "fill-neutrals-gray-7"
            : "fill-white group-hover:text-black group-hover:fill-black"
        } `}
        width={20}
        height={20}
      />
      <span className="w-36 block">
        {copied ? "Link copied" : "Copy Read-Only link"}
      </span>
    </ButtonSecondary>
  );
}
