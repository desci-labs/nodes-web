import {
  constructBreadCrumbs,
  createVirtualDrive,
  driveBfsByPath,
  driveBfsByUid,
  DRIVE_DATA_PATH,
  fillOuterSizes,
  getAllTrees,
  gracefullyAssignTreeUids,
  manifestToVirtualDrives,
  resetAccessStatus,
  SessionStorageKeys,
} from "@components/driveUtils";
import DriveBreadCrumbs, {
  BreadCrumb,
} from "@components/molecules/DriveBreadCrumbs";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import React, {
  ButtonHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClickAway } from "react-use";
import { DatasetMetadataInfo, MetaStaging } from "../PaneDrive";
import StatusInfo from "./StatusInfo";
import {
  DriveNonComponentTypes,
  DriveObject,
  FileDir,
  oldComponentMetadata,
} from "./types";
import DriveRow, { DRIVE_ROW_STYLES } from "./DriveRow";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { IconCirclePlus } from "@src/icons";
import RenameDataModal from "./RenameDataModal";
import { useNodeReader } from "@src/state/nodes/hooks";
import ComponentUseModal from "@src/components/molecules/ComponentUseModal";

const Empty = () => {
  return <div className="p-5 text-xs">No files</div>;
};

interface DriveTableProps {
  directory: DriveObject[];
  setDirectory: React.Dispatch<React.SetStateAction<DriveObject[]>>;
  nodeDrived: DriveObject | null;
  setNodeDrived: React.Dispatch<React.SetStateAction<DriveObject | null>>;
  setShowEditMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  datasetMetadataInfoRef: React.MutableRefObject<DatasetMetadataInfo>;
  setMetaStaging: React.Dispatch<React.SetStateAction<MetaStaging[]>>;
  showEditMetadata: boolean;
  setBreadCrumbs: React.Dispatch<React.SetStateAction<BreadCrumb[]>>;
  breadCrumbs: BreadCrumb[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOldComponentMetadata: (
    value: React.SetStateAction<oldComponentMetadata | null>
  ) => void;
  renameComponentId: string | null;
  setRenameComponentId: React.Dispatch<React.SetStateAction<string | null>>;
}

function UploadButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <ButtonSecondary onClick={props.onClick}>
      <IconCirclePlus className="group-hover:hidden" fill="white" />
      <IconCirclePlus className="group-hover:!block hidden" fill="black" /> Add
    </ButtonSecondary>
  );
}

const DriveTable: React.FC<DriveTableProps> = ({
  directory,
  setDirectory,
  nodeDrived,
  setNodeDrived,
  setShowEditMetadata,
  datasetMetadataInfoRef,
  setMetaStaging,
  showEditMetadata,
  breadCrumbs,
  setBreadCrumbs,
  setLoading,
  setOldComponentMetadata,
  renameComponentId,
  setRenameComponentId,
}) => {
  const {
    setIsAddingComponent,
    driveJumpDir,
    setDriveJumpDir,
    privCidMap,
    componentToUse,
    setComponentToUse,
  } = useManuscriptController(["driveJumpDir", "privCidMap", "componentToUse"]);
  const {
    manifest: manifestData,
    publicView,
    currentObjectId,
    shareId,
    mode,
  } = useNodeReader();

  const [selected, setSelected] = useState<
    Record<number, ResearchObjectComponentType | DriveNonComponentTypes>
  >({});
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const [jumpReady, setJumpReady] = useState<boolean>(false);

  useClickAway(containerRef, () => {
    if (!showEditMetadata && Object.keys(selected).length) setSelected({});
  });

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    setDirectory(drive.contains!);
    setSelected({});
    setBreadCrumbs([...breadCrumbs, { name: name, drive: drive }]);
  }

  function eatBreadCrumb(index: number) {
    setDirectory(breadCrumbs[index].drive.contains!);
    setSelected({});
    setBreadCrumbs(breadCrumbs.slice(0, index + 1));
  }

  //converts manifest to driveObj on component mount or nodeId change
  useEffect(() => {
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
  }, [currentObjectId]);

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
    let isMounted = true
    if (!manifestData?.components) {
      setLoading(false);
      return;
    }
    if (setNodeDrived)
      setNodeDrived((nodeDrived) => {
        if (!nodeDrived) return nodeDrived;

        if (
          (window as any).lastObjectId !== currentObjectId ||
          !breadCrumbs.length
        ) {
          (window as any).lastObjectId = currentObjectId!;

          setDirectory(nodeDrived.contains!);
          setBreadCrumbs([{ name: "Research Node", drive: nodeDrived }]);
          //* Populate virtual node drive for data components
          fetchTrees()
        }
        async function fetchTrees() {
          const lastPathUidMap = JSON.parse(
            sessionStorage.getItem(SessionStorageKeys.pathUidMap)!
          );
          const lastNodeId = JSON.parse(
            sessionStorage.getItem(SessionStorageKeys.lastNodeId)!
          );

          // if (lastNodeId === currentObjectId! && lastPathUidMap)
          const provideMap =
            lastNodeId === currentObjectId! && lastPathUidMap
              ? lastPathUidMap
              : undefined;
          //getAllTrees mutates nodeDrived
          await getAllTrees(
            nodeDrived!,
            currentObjectId!,
            manifestData!,
            {
              pathUidMap: provideMap,
              public: publicView,
            },
            shareId
          );

          //fill sizes and metadata (dont remove for now)
          setDirectory((old) => {
            if (!old) return old;
            const isNodeRoot = old.findIndex(
              (fd) => fd.name === "Research Reports"
            );
            if (isNodeRoot === -1) return old;

            const virtualData = createVirtualDrive({
              name: "Data",
              path: DRIVE_DATA_PATH,
              componentType: ResearchObjectComponentType.DATA,
              contains: old,
            });

            resetAccessStatus(virtualData);
            const sizesFilledDrive = fillOuterSizes(virtualData);
            const newDir = [...sizesFilledDrive.contains!];
            return newDir;
          });
          if (isMounted) setJumpReady(true);
          setLoading(false);

        }

        return nodeDrived;
      });
      return () => {
        isMounted = false
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeDrived, manifestData]);

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

  const canEditMetadata = useMemo(() => {
    return new Set(Object.values(selected)).size <= 1;
  }, [selected]);

  const canUse = useMemo(() => {
    return Object.keys(selected).length <= 1;
  }, [selected]);

  //handles jumping to dirs (upload panel click for instance)
  useEffect(() => {
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
        setNodeDrived((nDrive) => {
          const latestByUid = driveBfsByUid(nDrive!, driveJumpDir.targetUid!);

          const latest = latestByUid
            ? latestByUid
            : driveBfsByPath(nDrive!, driveJumpDir.targetPath!);
          if (latest) {
            setDirectory(latest.contains!);
            console.log(
              `[DRIVE JUMPING] LATEST FOUND BY ${latestByUid ? "UID" : "PATH"}`
            );
          }

          //select item
          setDirectory((current) => {
            // debugger;
            if (current) {
              const containedIdxUid = current.findIndex(
                (item) => item.uid === driveJumpDir.itemUid
              );

              const itemIdxFound = containedIdxUid
                ? containedIdxUid
                : current.findIndex((drv: DriveObject) =>
                    drv.path?.includes(driveJumpDir.itemPath!)
                  );

              if (itemIdxFound !== -1) {
                console.log(
                  `[DRIVE JUMPING] ITEM FOUND BY ${
                    containedIdxUid ? "UID" : "PATH"
                  }: ${
                    containedIdxUid
                      ? driveJumpDir.itemUid
                      : driveJumpDir.itemPath
                  }`
                );
                setSelected({
                  [itemIdxFound]: current[itemIdxFound].componentType,
                });
              }
            }
            return current;
          });

          //update breadcrumbs
          if (latest) {
            const newCrumbs = constructBreadCrumbs(latest);
            setBreadCrumbs(newCrumbs);
          }
          return nDrive;
        });
      }
      setLoading(false);
      setDriveJumpDir(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveJumpDir, nodeDrived, jumpReady]);

  return (
    <div className="w-full h-full">
      {!publicView ? (
        <div className="w-full flex flex-row -mt-8">
          <div className="flex-grow"></div>
          <div className="w-42 self-end">
            {mode === "editor" && (
              <UploadButton
                onClick={() => {
                  setIsAddingComponent(true);
                }}
              />
            )}
          </div>
        </div>
      ) : null}
      <DriveBreadCrumbs crumbs={breadCrumbs} eatBreadCrumb={eatBreadCrumb} />
      <div
        className="bg-neutrals-gray-1 h-full w-full rounded-xl outline-none"
        ref={containerRef}
      >
        <ul
          id="HeaderRow"
          className="bg-black rounded-t-xl h-[56px] grid list-none font-bold text-sm text-white content-center justify-items-center gap-10 px-5 border-b border-[#555659] items-center"
          style={{
            gridTemplateColumns:
              "2fr repeat(4, minmax(auto, 1fr)) minmax(125px, auto) repeat(2, 40px)",
          }}
        >
          <li className={`${DRIVE_ROW_STYLES[0]}`}>File Name</li>
          <li className={`${DRIVE_ROW_STYLES[1]}`}>Last Modified</li>
          <li className={`${DRIVE_ROW_STYLES[2]}`}>Type</li>

          <li
            data-tip={""}
            data-for="status"
            className={`${DRIVE_ROW_STYLES[3]}`}
          >
            Status
          </li>

          <li className={`${DRIVE_ROW_STYLES[4]}`}>File Size</li>
          {!publicView ? (
            <li className={`${DRIVE_ROW_STYLES[5]}`}>Metadata</li>
          ) : null}
          <li className={`${DRIVE_ROW_STYLES[6]}`}>Cite</li>
          <li className={`${DRIVE_ROW_STYLES[7]}`}>Use</li>
        </ul>
        <StatusInfo />
        {directory.length ? (
          directory.map((f: DriveObject, idx: number) => {
            return (
              <DriveRow
                key={`drive_row_${f.path + f.cid + idx || idx}`}
                file={f}
                exploreDirectory={exploreDirectory}
                index={idx}
                selected={!!selected[idx]}
                toggleSelected={toggleSelected}
                isMultiselecting={!!Object.keys(selected).length}
                setMetaStaging={setMetaStaging}
                setShowEditMetadata={setShowEditMetadata}
                datasetMetadataInfoRef={datasetMetadataInfoRef}
                selectedFiles={selected}
                canEditMetadata={canEditMetadata}
                canUse={canUse}
                onHandleUse={() => {
                  setComponentToUse(f);
                  setSelectedIndex(idx);
                }}
                setOldComponentMetadata={setOldComponentMetadata}
              />
            );
          })
        ) : (
          <Empty />
        )}
      </div>
      {!!componentToUse && (
        <ComponentUseModal
          isOpen={true}
          isMultiselecting={!!Object.keys(selected).length}
          setMetaStaging={setMetaStaging}
          setShowEditMetadata={setShowEditMetadata}
          datasetMetadataInfoRef={datasetMetadataInfoRef}
          setOldComponentMetadata={setOldComponentMetadata}
          componentToUse={componentToUse!}
          index={selectedIndex}
          selectedFiles={selected}
          onDismiss={() => {
            setSelectedIndex(0);
            setComponentToUse(null);
          }}
        />
      )}
      {renameComponentId && (
        <RenameDataModal
          renameComponentId={renameComponentId}
          setRenameComponentId={setRenameComponentId}
          setDirectory={setDirectory}
        />
      )}
    </div>
  );
};

export default DriveTable;

export * from "./types";
