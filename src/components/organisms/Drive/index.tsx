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
import DriveBreadCrumbs from "@src/components/molecules/DriveBreadCrumbs";
import ComponentUseModal from "@src/components/molecules/ComponentUseModal";

const Empty = () => {
  return <div className="p-5 text-xs col-span-7">No files</div>;
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
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // renameComponentId: string | null;
  // setRenameComponentId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DriveTable: React.FC<DriveTableProps> = ({ setLoading }) => {
  const { setIsAddingComponent, setAddFilesWithoutContext } =
    useManuscriptController([]);

  const { publicView, mode } = useNodeReader();

  const { nodeTree, status, currentDrive, deprecated, breadCrumbs } =
    useDrive();
  const dispatch = useSetter();
  const { componentToUse, setComponentToUse } = useManuscriptController([
    "componentToUse",
  ]);
  const [selected, setSelected] = useState<
    Record<number, ResearchObjectComponentType | DriveNonComponentTypes>
  >({});
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    dispatch(navigateToDriveByPath({ path: drive.path! }));
    setSelected({});
  }

  function eatBreadCrumb(index: number) {
    dispatch(navigateToDriveByPath({ path: breadCrumbs[index].path! }));
    setSelected({});
  }

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
      <DriveBreadCrumbs eatBreadCrumb={eatBreadCrumb} />
      <div
        className="bg-neutrals-gray-1 h-full w-full rounded-xl outline-none"
        ref={containerRef}
      >
        <ul
          className={`bg-neutrals-gray-1 grid list-none font-medium text-sm text-white select-none items-center rounded-t-xl rounded-b-xl h-full`}
          style={{
            gridTemplateColumns: `${deprecated ? "" : ColWidths.STARRED} ${
              ColWidths.FILE_NAME
            } ${ColWidths.LAST_MODIFIED} ${ColWidths.STATUS} ${
              ColWidths.FILE_SIZE
            } ${ColWidths.CITE} ${ColWidths.USE}`,
          }}
        >
          <li
            className={`${everyRow} ${headerRow} ${deprecated ? "hidden" : ""}`}
          >
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
                  deprecated={deprecated}
                />
              );
            })
          ) : (
            <Empty />
          )}
        </ul>
        <StatusInfo />
      </div>
      <ComponentUseModal />
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
