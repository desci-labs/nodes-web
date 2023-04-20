import React, { useEffect, useMemo } from "react";
import UserMenu from "@components/molecules/UserMenu";
import {
  APPROXIMATED_HEADER_HEIGHT,
  shortAccount,
  triggerTooltips,
} from "@components/utils";
import styled from "styled-components";
import { IconHamburger, IconWarning } from "@icons";
import DocumentController from "./DocumentController";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import NodeLogo from "@components/atoms/NodeLogo";
import toast from "react-hot-toast";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { useGetter, useSetter } from "@src/store/accessors";
import {
  setOrcid,
  toggleToolbar,
} from "@src/state/preferences/preferencesSlice";
import { useUser } from "@src/state/user/hooks";
import {
  useCurrentNodeVersion,
  useNodeReader,
  usePdfReader,
} from "@src/state/nodes/hooks";
import { setLoadState } from "@src/state/nodes/pdf";
import { useGetNodesQuery } from "@src/state/api/nodes";
import ShareModal from "@src/components/molecules/ShareModal";

const HeadWrapper = styled.div.attrs({
  className: `fixed w-screen app-header`,
})`
  z-index: 110; // be above the modal
  --tw-shadow: 0 2px 4px 0px rgba(0, 0, 0, 0.5),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  //   box-shadow: 0 -2px 8px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15);
  height: ${APPROXIMATED_HEADER_HEIGHT}px;
  background-color: rgb(51, 54, 57);
  //   transition: transform 3s ease-in-out;
  padding-left: 16px;
  padding-right: 16px;
  justify-content: center;
  display: flex;
  flex-direction: row;
  // overflow-x: scroll; // this kills the user menu in desktop
  ${(params) => (params.hidden ? "transform: translateY(-58px);" : "")}
`;

const NavStart = styled.div.attrs({
  className: "items-center flex flex-row justify-start gap-2",
})`
  flex-basis: 0%;
  flex-grow: 1;
  flex-shrink: 1;
`;

const PdfHeader = () => {
  const userProfile = useUser();
  const dispatch = useSetter();
  const nodeVersion = useCurrentNodeVersion();
  const {
    orcid: { loading: orcidLoading, orcidData },
    hideHeader,
    isToolbarVisible,
  } = useGetter((state) => state.preferences);
  const {
    loadState: { loadPercent, loadError, loadProgressTaken },
  } = usePdfReader();
  const { componentStack, publicView, currentObjectId } = useNodeReader();
  const { data: nodes, isLoading } = useGetNodesQuery();

  const {
    setShowShareMenu,
    showShareMenu,
    isAddingComponent,
    isAddingSubcomponent,
  } = useManuscriptController([
    "isAddingComponent",
    "isAddingSubcomponent",
    "showShareMenu",
  ]);

  const isPdfActiveComponent =
    componentStack[componentStack.length - 1]?.type ===
      ResearchObjectComponentType.PDF &&
    !isToolbarVisible &&
    !isAddingComponent &&
    !isAddingSubcomponent;

  const account = false;

  useEffect(() => {
    const hasOrcid = orcidData && !!orcidData.person;
    if (!hasOrcid && account) {
      dispatch(
        setOrcid({
          orcidData: {
            walletInitiated: true,
            person: {
              name: { "given-names": { value: shortAccount(account) } },
            },
          },
        })
      );
    } else if (!account && orcidData && orcidData.walletInitiated) {
      dispatch(setOrcid({ orcidData: null }));
    }
    setTimeout(triggerTooltips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, orcidData, orcidLoading]);

  // TODO: for private view add guard to check if user is node owner or currentUser has
  // enough permissions to share private drafts
  const canShare = useMemo(() => {
    if (publicView) return !!nodeVersion;
    if (isLoading) return false;
    const isOwner = nodes?.find(
      (n) => n.uuid === currentObjectId && n?.ownerId === userProfile.userId
    );
    return !!isOwner;
  }, [
    currentObjectId,
    isLoading,
    nodeVersion,
    nodes,
    publicView,
    userProfile.userId,
  ]);

  const openMenu = () => {
    if (userProfile.userId > 0) {
      dispatch(toggleToolbar(!isToolbarVisible));
    }

    if (!publicView) {
      // if (!currentObjectId && !isToolbarVisible) {
      //   toast.error("Create Research Node first", {
      //     duration: 2000,
      //     position: "top-center",
      //     style: {
      //       marginTop: 60,
      //       borderRadius: "10px",
      //       background: "#111",
      //       color: "#fff",
      //     },
      //   });
      // }
    } else if (publicView && userProfile.userId === 0) {
      toast.error("Browsing Nodes is coming soon", {
        duration: 2000,
        icon: <IconWarning />,
        position: "top-center",
        style: {
          marginTop: 60,
          borderRadius: "10px",
          background: "#111",
          color: "#fff",
        },
      });
    }
  };

  return (
    <HeadWrapper>
      <NavStart>
        <IconHamburger
          onClick={openMenu}
          fill="rgb(241, 241, 241)"
          width={36}
          className={`cursor-pointer hover:bg-gray-600 h-[34px] py-[9px] rounded-full`}
        />
        <NodeLogo />
      </NavStart>

      {hideHeader && isPdfActiveComponent ? <DocumentController /> : null}

      <div className="flex-1 flex flex-row justify-end space-x-4 items-center">
        <div
          className={`relative ${
            userProfile && userProfile.email ? "-left-40" : "-left-0"
          } top-0 text-right w-40 flex justify-end`}
        >
          {hideHeader && canShare ? (
            <PrimaryButton
              className="py-1.5"
              onClick={() => {
                console.log("click show modal", showShareMenu);
                setShowShareMenu(true);
                postUserAction(
                  AvailableUserActionLogTypes.btnShare,
                  JSON.stringify({
                    objectId: currentObjectId,
                  })
                );
              }}
            >
              Share
            </PrimaryButton>
          ) : null}
        </div>
        {userProfile && userProfile.email ? (
          <UserMenu address={userProfile.email} name={userProfile.email} />
        ) : null}
      </div>

      {loadPercent <= 100 && currentObjectId && componentStack.length ? (
        <div className="w-full absolute bottom-0 rounded-full h-[3px]">
          <div
            className={`${
              loadError ? "bg-red-500" : "bg-tint-primary"
            } h-[3px] ${
              loadPercent > 99 || !loadProgressTaken
                ? "duration-[0]"
                : "transition-all"
            }`}
            style={{ width: `${loadError ? 100 : loadPercent}%` }}
          ></div>
        </div>
      ) : null}
      {showShareMenu && (
        <ShareModal isOpen={true} onDismiss={() => setShowShareMenu(false)} />
      )}
    </HeadWrapper>
  );
};

export default React.memo(PdfHeader);
