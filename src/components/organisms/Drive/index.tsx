import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import React, { useMemo, useRef, useState } from "react";
import { DriveObject, FileDir } from "./types";
import DriveRow from "./DriveRow";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { IconCirclePlus, IconStar } from "@src/icons";
import RenameDataModal from "./RenameDataModal";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDrive } from "@src/state/drive/hooks";
import {
  addFilesToDrive,
  navigateToDriveByPath,
  toggleSelectFileInCurrentDrive,
} from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";
import "./styles.scss";
import DriveBreadCrumbs from "@src/components/molecules/DriveBreadCrumbs";
import { useManuscriptController } from "../ManuscriptReader/ManuscriptController";
import ContextMenu from "../ContextMenu";
import { FolderAddIcon } from "@heroicons/react/solid";

const Empty = () => {
  return <div className="p-5 text-xs col-span-7">No files</div>;
};

export const everyRow =
  "flex items-center justify-center w-full px-3 border-b border-[#555659] h-12 driveRow";
const headerRow = "!h-14 bg-black driveRowHeader";

const DriveTable: React.FC = () => {
  const { publicView, mode } = useNodeReader();
  const { setAddFilesWithoutContext, setIsAddingComponent } =
    useManuscriptController();
  const { currentDrive, deprecated, breadCrumbs, fileBeingRenamed, selected } =
    useDrive();

  const [showAddBtnSelectMenu, setShowAddBtnSelectMenu] =
    useState<boolean>(false);

  const dispatch = useSetter();

  const containerRef = useRef<HTMLDivElement>(null);

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    dispatch(navigateToDriveByPath({ path: drive.path! }));
  }

  function eatBreadCrumb(index: number) {
    dispatch(navigateToDriveByPath({ path: breadCrumbs[index].path! }));
  }

  //checks if selected is of the same type
  const canEditMetadata = useMemo(() => {
    return new Set(Object.values(selected)).size <= 1;
  }, [selected]);

  const canUse = useMemo(() => {
    return Object.keys(selected).length <= 1;
  }, [selected]);

  return (
    <div className="w-full h-full">
      {!publicView ? (
        <div className="w-full flex flex-row -mt-8">
          <div className="flex-grow"></div>
          <div className="w-42 self-end relative text-sm">
            {mode === "editor" && (
              <>
                <ButtonSecondary
                  onClick={() => {
                    setShowAddBtnSelectMenu(true);
                  }}
                >
                  <IconCirclePlus className="group-hover:hidden" fill="white" />
                  <IconCirclePlus
                    className="group-hover:!block hidden"
                    fill="black"
                  />{" "}
                  Add
                </ButtonSecondary>
                {showAddBtnSelectMenu && (
                  <ContextMenu
                    items={[
                      {
                        icon: (
                          <IconCirclePlus
                            className="group-hover:hidden"
                            fill="white"
                          />
                        ),
                        label: <span>New Component</span>,
                        onClick: () => {
                          setAddFilesWithoutContext(false);
                          setIsAddingComponent(true);
                        },
                      },
                      {
                        icon: (
                          <FolderAddIcon
                            className="group-hover:hidden"
                            fill="white"
                          />
                        ),
                        label: <span>New Folder</span>,
                        onClick: () => {
                          setAddFilesWithoutContext(false);
                          dispatch(addFilesToDrive({ newFolder: true }));
                        },
                      },
                    ]}
                    close={() => setShowAddBtnSelectMenu(false)}
                    className={"right-0"}
                  />
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
      <DriveBreadCrumbs eatBreadCrumb={eatBreadCrumb} />
      <div
        className="bg-neutrals-gray-1 h-full w-full rounded-xl outline-none"
        ref={containerRef}
      >
        <ul
          className={`drive-row-container ${
            deprecated ? "drive-deprecated" : ""
          } bg-neutrals-gray-1 grid list-none font-medium text-sm text-white select-none items-center rounded-t-xl rounded-b-xl h-full`}
        >
          <li
            className={`${everyRow} ${headerRow} ${deprecated ? "hidden" : ""}`}
          >
            {mode === "reader" ? null : (
              <IconStar
                className="fill-tint-primary stroke-tint-primary"
                width={18}
                height={18}
              />
            )}
          </li>
          <li className={`${everyRow} ${headerRow} !justify-start`}>
            File Name
          </li>
          <li className={`${everyRow} ${headerRow} col-last-modified`}>
            Last Modified
          </li>

          <li
            data-tip={""}
            data-for="status"
            className={`${everyRow} ${headerRow} col-status`}
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
                  selected={!!selected[f.path!]}
                  toggleSelected={() =>
                    dispatch(
                      toggleSelectFileInCurrentDrive({
                        path: f.path!,
                        componentType:
                          f.componentType as ResearchObjectComponentType,
                      })
                    )
                  }
                  canEditMetadata={canEditMetadata}
                  canUse={canUse}
                  deprecated={deprecated}
                />
              );
            })
          ) : (
            <Empty />
          )}
        </ul>
      </div>
      {fileBeingRenamed && <RenameDataModal file={fileBeingRenamed} />}
    </div>
  );
};

export default DriveTable;

export * from "./types";
