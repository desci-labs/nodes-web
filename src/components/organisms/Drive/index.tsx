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
import StatusInfo from "./StatusInfo";
import { DriveNonComponentTypes, DriveObject, FileDir } from "./types";
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
  setBreadCrumbs: React.Dispatch<React.SetStateAction<BreadCrumb[]>>;
  breadCrumbs: BreadCrumb[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // renameComponentId: string | null;
  // setRenameComponentId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DriveTable: React.FC<DriveTableProps> = ({
  breadCrumbs,
  setBreadCrumbs,
  setLoading,
}) => {
  const {
    setIsAddingComponent,
    driveJumpDir,
    setDriveJumpDir,
    setAddFilesWithoutContext,
  } = useManuscriptController(["driveJumpDir"]);

  const {
    manifest: manifestData,
    publicView,
    currentObjectId,
    mode,
  } = useNodeReader();

  const { nodeTree, status, currentDrive } = useDrive();
  const dispatch = useSetter();

  const [selected, setSelected] = useState<
    Record<number, ResearchObjectComponentType | DriveNonComponentTypes>
  >({});

  const containerRef = useRef<HTMLDivElement>(null);

  const [jumpReady, setJumpReady] = useState<boolean>(false);

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

  //*deprecated: to be removed* resume from previous dir when ready
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

  //*Almost deprecated, remove after breadcrumbs migrated* loads all dataset trees, and fills data sizes
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
    }
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
            {mode === "editor" && (
              <ButtonSecondary
                onClick={() => {
                  setAddFilesWithoutContext(false);
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
                  selectedFiles={selected}
                  canEditMetadata={canEditMetadata}
                  canUse={canUse}
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
