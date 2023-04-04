import {
  constructBreadCrumbs,
  driveBfsByPath,
  driveBfsByUid,
  SessionStorageKeys,
} from "@components/driveUtils";
import DriveBreadCrumbs, {
  BreadCrumb,
} from "@components/molecules/DriveBreadCrumbs";
import PopOverUseMenu from "@components/molecules/PopOverUseMenu";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { DatasetMetadataInfo, MetaStaging } from "../PaneDrive";
import StatusInfo from "./StatusInfo";
import {
  DriveNonComponentTypes,
  DriveObject,
  FileDir,
  oldComponentMetadata,
} from "./types";
import DriveRow from "./DriveRow";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { IconCirclePlus, IconStar } from "@src/icons";
import RenameDataModal from "./RenameDataModal";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDrive } from "@src/state/drive/hooks";
import { navigateToDriveByPath } from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";
import "./styles.scss";

const Empty = () => {
  return <div className="p-5 text-xs">No files</div>;
};

export const everyRow =
  "flex items-center justify-center w-full px-3 border-b border-[#555659] h-12 driveRow";
const headerRow = "!h-14 bg-black driveRowHeader";

enum ColWidths {
  STARRED = "50px",
  FILE_NAME = "2fr",
  LAST_MODIFIED = "minmax(auto, 1fr)",
  STATUS = "minmax(auto, 1fr)",
  FILE_SIZE = "minmax(auto, 1fr)",
  CITE = "50px",
  USE = "50px",
}

interface DriveTableProps {
  // directory: DriveObject[];
  // setDirectory: React.Dispatch<React.SetStateAction<DriveObject[]>>;
  // setShowEditMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  // datasetMetadataInfoRef: React.MutableRefObject<DatasetMetadataInfo>;
  // setMetaStaging: React.Dispatch<React.SetStateAction<MetaStaging[]>>;
  // showEditMetadata: boolean;
  setBreadCrumbs: React.Dispatch<React.SetStateAction<BreadCrumb[]>>;
  breadCrumbs: BreadCrumb[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // setOldComponentMetadata: (
  //   value: React.SetStateAction<oldComponentMetadata | null>
  // ) => void;
  // renameComponentId: string | null;
  // setRenameComponentId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DriveTable: React.FC<DriveTableProps> = ({
  // directory,
  // setDirectory,
  // setShowEditMetadata,
  // datasetMetadataInfoRef,
  // setMetaStaging,
  // showEditMetadata,
  breadCrumbs,
  setBreadCrumbs,
  setLoading,
  // setOldComponentMetadata,
  // renameComponentId,
  // setRenameComponentId,
}) => {
  const { setIsAddingComponent, driveJumpDir, setDriveJumpDir, privCidMap } =
    useManuscriptController(["driveJumpDir", "privCidMap"]);

  const {
    manifest: manifestData,
    publicView,
    currentObjectId,
  } = useNodeReader();

  const { nodeTree, status, currentDrive } = useDrive();
  const dispatch = useSetter();

  const [selected, setSelected] = useState<
    Record<number, ResearchObjectComponentType | DriveNonComponentTypes>
  >({});

  const containerRef = useRef<HTMLDivElement>(null);

  const [jumpReady, setJumpReady] = useState<boolean>(false);

  // useClickAway(containerRef, () => {
  //   if (!showEditMetadata && Object.keys(selected).length) setSelected({});
  // });

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    dispatch(navigateToDriveByPath({ path: drive.path! }));
    setSelected({});
    setBreadCrumbs([...breadCrumbs, { name: name, drive: drive }]);
  }

  function eatBreadCrumb(index: number) {
    dispatch(navigateToDriveByPath({ path: breadCrumbs[index].drive.path! }));
    setSelected({});
    setBreadCrumbs(breadCrumbs.slice(0, index + 1));
  }

  //converts manifest to driveObj on component mount or nodeId change
  /*   useEffect(() => {
    if (!manifestData?.components) return;
    const localNodeDrived = manifestToVirtualDrives(
      manifestData,
      "virtual",
      privCidMap
    );

    // recover uids if cached
    const lastNodeId = JSON.parse(
      sessionStorage.getItem(SessionStorageKeys.lastNodeId)!
    );
    if (lastNodeId === currentObjectId!) {
      const storedPathUidMap = sessionStorage.getItem("Drive::pathUidMap");
      const lastPathUidMap = JSON.parse(storedPathUidMap!);
      if (lastPathUidMap) {
        console.log("[DRIVE RESUME] Recovered last path uid map");
        gracefullyAssignTreeUids(
          localNodeDrived.contains! as any,
          undefined,
          lastPathUidMap
        );
      }
    }

    if (setNodeDrived) setNodeDrived(localNodeDrived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId]); */

  //resume from previous dir when ready
  useEffect(() => {
    const lastDirUid = JSON.parse(
      sessionStorage.getItem(SessionStorageKeys.lastDirUid)!
    );
    if (lastDirUid) {
      console.log(
        "[DRIVE RESUME] Recovered last directory location, jumping... ",
        lastDirUid
      );

      if (jumpReady) setDriveJumpDir({ targetUid: lastDirUid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpReady]);

  //loads all dataset trees, and fills data sizes
  useEffect(() => {
    // debugger;
    if (!nodeTree) return;
    if (!manifestData?.components) {
      setLoading(false);
      return;
    }

    if (
      (window as any).lastObjectId !== currentObjectId ||
      !breadCrumbs.length
    ) {
      (window as any).lastObjectId = currentObjectId!;
      setBreadCrumbs([{ name: "Research Node", drive: nodeTree! }]);
      //* Populate virtual node drive for data components
    }

    //fill sizes and metadata (dont remove for now)
    //   setDirectory((old) => {
    //     if (!old) return old;
    //     const isNodeRoot = old.findIndex((fd) => fd.name === "Research Reports");
    //     if (isNodeRoot === -1) return old;

    //     const virtualData = createVirtualDrive({
    //       name: "Data",
    //       path: DRIVE_DATA_PATH,
    //       componentType: ResearchObjectComponentType.DATA,
    //       contains: old,
    //     });

    //     resetAccessStatus(virtualData);
    //     const sizesFilledDrive = fillOuterSizes(virtualData);
    //     const newDir = [...sizesFilledDrive.contains!];
    //     setJumpReady(true);
    //     setLoading(false);
    //     return newDir;
    //   });
    //   setLoading(false);
  }, [nodeTree]);

  function toggleSelected(
    index: number,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) {
    const newSelected = { ...selected };
    if (selected[index]) {
      delete newSelected[index];
    } else {
      newSelected[index] = componentType;
    }
    setSelected(newSelected);
  }

  //checks if selected is of the same type
  const canEditMetadata = useMemo(() => {
    return new Set(Object.values(selected)).size <= 1;
  }, [selected]);

  const canUse = useMemo(() => {
    return Object.keys(selected).length <= 1;
  }, [selected]);

  //handles jumping to dirs (upload panel click for instance)
  useEffect(() => {
    if (!nodeTree) return;
    if (driveJumpDir && jumpReady) {
      // debugger;
      setLoading(true);
      if (driveJumpDir.targetUid || driveJumpDir.targetPath) {
        console.log(
          `[DRIVE JUMPING] drive jumping to ${
            driveJumpDir.targetUid
              ? driveJumpDir.targetUid
              : driveJumpDir.targetPath
          }`
        );
        //try find freshest via bfs
        const latestByUid = driveBfsByUid(nodeTree!, driveJumpDir.targetUid!);

        const latest = latestByUid
          ? latestByUid
          : driveBfsByPath(nodeTree!, driveJumpDir.targetPath!);
        if (latest) {
          navigateToDriveByPath({ path: latest.path! });
          console.log(
            `[DRIVE JUMPING] LATEST FOUND BY ${latestByUid ? "UID" : "PATH"}`
          );
        }

        //select item
        // debugger;
        if (currentDrive!.contains) {
          const containedIdxUid = currentDrive!.contains.findIndex(
            (item: any) => item.uid === driveJumpDir.itemUid
          );

          const itemIdxFound = containedIdxUid
            ? containedIdxUid
            : currentDrive!.contains.findIndex((drv: DriveObject) =>
                drv.path?.includes(driveJumpDir.itemPath!)
              );

          if (itemIdxFound !== -1) {
            console.log(
              `[DRIVE JUMPING] ITEM FOUND BY ${
                containedIdxUid ? "UID" : "PATH"
              }: ${
                containedIdxUid ? driveJumpDir.itemUid : driveJumpDir.itemPath
              }`
            );
            setSelected({
              [itemIdxFound]:
                currentDrive!.contains[itemIdxFound].componentType,
            });
          }
        }

        //update breadcrumbs
        if (latest) {
          const newCrumbs = constructBreadCrumbs(latest);
          setBreadCrumbs(newCrumbs);
        }
      }
      setLoading(false);
      setDriveJumpDir(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveJumpDir, nodeTree, jumpReady]);

  return (
    <div className="w-full h-full">
      {!publicView ? (
        <div className="w-full flex flex-row -mt-8">
          <div className="flex-grow"></div>
          <div className="w-42 self-end">
            <ButtonSecondary
              onClick={() => {
                setIsAddingComponent(true);
              }}
            >
              <IconCirclePlus className="group-hover:hidden" fill="white" />
              <IconCirclePlus
                className="group-hover:!block hidden"
                fill="black"
              />{" "}
              Add
            </ButtonSecondary>
          </div>
        </div>
      ) : null}
      <DriveBreadCrumbs crumbs={breadCrumbs} eatBreadCrumb={eatBreadCrumb} />
      <div
        className="bg-neutrals-gray-1 h-full w-full rounded-xl outline-none"
        ref={containerRef}
      >
        <ul
          className={`bg-neutrals-gray-1 grid list-none font-medium text-sm text-white select-none items-center rounded-t-xl rounded-b-xl h-full`}
          style={{
            gridTemplateColumns: `${ColWidths.STARRED} ${ColWidths.FILE_NAME} ${ColWidths.LAST_MODIFIED} ${ColWidths.STATUS} ${ColWidths.FILE_SIZE} ${ColWidths.CITE} ${ColWidths.USE}`,
          }}
        >
          <li className={`${everyRow} ${headerRow}`}>
            <IconStar
              className="fill-tint-primary stroke-tint-primary"
              width={18}
              height={18}
            />
          </li>
          <li className={`${everyRow} ${headerRow} !justify-start`}>
            File Name
          </li>
          <li className={`${everyRow} ${headerRow}`}>Last Modified</li>

          <li
            data-tip={""}
            data-for="status"
            className={`${everyRow} ${headerRow}`}
          >
            Status
          </li>

          <li className={`${everyRow} ${headerRow}`}>File Size</li>
          <li className={`${everyRow} ${headerRow}`}>Cite</li>
          <li className={`${everyRow} ${headerRow}`}>Use</li>
          {currentDrive?.contains?.length ? (
            currentDrive.contains.map((f: DriveObject, idx: number) => {
              return (
                <DriveRow
                  key={`drive_row_${f.path + f.cid + idx || idx}`}
                  file={f}
                  exploreDirectory={exploreDirectory}
                  index={idx}
                  selected={!!selected[idx]}
                  toggleSelected={toggleSelected}
                  isMultiselecting={!!Object.keys(selected).length}
                  // setMetaStaging={setMetaStaging}
                  // setShowEditMetadata={setShowEditMetadata}
                  // datasetMetadataInfoRef={datasetMetadataInfoRef}
                  selectedFiles={selected}
                  canEditMetadata={canEditMetadata}
                  canUse={canUse}
                  // setOldComponentMetadata={setOldComponentMetadata}
                />
              );
            })
          ) : (
            <Empty />
          )}
        </ul>
        <StatusInfo />
      </div>
      <PopOverUseMenu />
      {/* {renameComponentId && (
        <RenameDataModal
          renameComponentId={renameComponentId}
          setRenameComponentId={setRenameComponentId}
          setDirectory={setDirectory}
        />
      )} */}
    </div>
  );
};

export default DriveTable;

export * from "./types";
