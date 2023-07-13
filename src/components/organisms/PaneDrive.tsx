import DropTargetFullScreen from "@components/atoms/DropTargetFullScreen";
import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import SidePanelStorage from "@components/molecules/SidePanelStorage";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useEffect, useRef, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import DriveTable, { DriveObject } from "./Drive";
import toast from "react-hot-toast";
import ContextMenuProvider from "./Drive/ContextMenu/provider";
import LoaderDrive from "../molecules/LoaderDrive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { useDrive } from "@src/state/drive/hooks";
import { addFilesToDrive } from "@src/state/drive/driveSlice";
import { isMobile } from "react-device-detect";
import { DRIVE_FULL_EXTERNAL_LINKS_PATH } from "@src/state/drive/utils";
import { EyeIcon } from "@heroicons/react/solid";
import ButtonSecondary from "../atoms/ButtonSecondary";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";

const PaneDrive = () => {
  const {
    droppedFileList,
    droppedTransferItemList,
    setDroppedFileList,
    setDroppedTransferItemList,
  } = useManuscriptController(["droppedFileList", "droppedTransferItemList"]);
  const dispatch = useSetter();
  const { isDraggingFiles, manifest } = useNodeReader();
  const canViewMetadata = manifest && manifest.dpid;

  const { status, currentDrive } = useDrive();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status === "succeeded") {
      (window as any).document.scrollingElement!.scrollTop = 0;
      setTimeout(() => {
        (window as any).document.scrollingElement!.scrollTop = 0;
      }, 500);
      setLoading(false);
    }
  }, [loading, status]);

  const directoryRef = useRef<DriveObject[]>();

  // handle file drop
  useEffect(() => {
    const errorHandle = (err?: any) => {
      toast.error(err.message, {
        position: "top-center",
        duration: 3000,
        style: {
          marginTop: 55,
          borderRadius: "10px",
          background: "#111",
          color: "#fff",
          zIndex: 150,
        },
      });
    };

    try {
      if (droppedFileList || droppedTransferItemList) {
        if (currentDrive?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH) {
          toast.error("Unable to add items to external links directory.", {
            position: "top-center",
            duration: 5000,
            style: {
              marginTop: 55,
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              zIndex: 150,
            },
          });
          setDroppedFileList(null);
          setDroppedTransferItemList(null);
          return;
        }
        if (droppedFileList) {
          if (droppedFileList instanceof FileList) {
            dispatch(addFilesToDrive({ files: droppedFileList }));
          }
        }
        if (droppedTransferItemList) {
          dispatch(addFilesToDrive({ files: droppedTransferItemList }));
        }
      }
    } catch (err: any) {
      errorHandle(err);
    }
    setDroppedFileList(null);
    setDroppedTransferItemList(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    droppedFileList,
    setDroppedFileList,
    setDroppedTransferItemList,
    droppedTransferItemList,
    directoryRef,
  ]);

  return (
    <ContextMenuProvider>
      <div className="flex flex-col relative">
        {loading ? (
          <div
            className={`flex justify-center items-center flex-col w-[calc(100%-320px)] h-full fixed bg-neutrals-black overflow-hidden top-0 z-[50] gap-3 ${
              loading ? "" : "hidden"
            }`}
          >
            <LoaderDrive />
          </div>
        ) : null}
        {isDraggingFiles ? <DropTargetFullScreen /> : null}
        <PerfectScrollbar
          className={`w-full self-center flex flex-col gap-6 px-6 md:px-20 text-white h-full bg-neutrals-black pb-20 ${
            !isMobile ? "!pb-[300px]" : ""
          } `}
        >
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-[28px] font-bold text-white">Node Drive</h1>
            {canViewMetadata ? (
              <ButtonSecondary
                onClick={() => {
                  window.open(
                    `https://beta.dpid.org/${manifest?.dpid!.id}?jsonld`,
                    `_blank`
                  );
                  postUserAction(
                    AvailableUserActionLogTypes.btnInspectMetadata
                  );
                }}
              >
                <EyeIcon
                  width={16}
                  className="fill-white group-hover:fill-black transition-colors"
                />
                Inspect Metadata
              </ButtonSecondary>
            ) : null}
          </div>
          <SpacerHorizontal />
          <div id="tableWrapper" className="mt-5 h-full">
            <DriveTable />
          </div>
        </PerfectScrollbar>
        {!isMobile && <SidePanelStorage />}
      </div>
    </ContextMenuProvider>
  );
};
export default PaneDrive;
