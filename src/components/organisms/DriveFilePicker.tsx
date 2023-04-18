import PrimaryButton from "@components/atoms/PrimaryButton";
import {
  createVirtualDrive,
  fillOuterSizes,
  getAllTrees,
  manifestToVirtualDrives,
} from "@components/driveUtils";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import {
  IconChevronLeft,
  IconCodeRepo,
  IconData,
  IconDirectory,
  IconIpfs,
  IconResearchNode,
  IconResearchReport,
  IconX,
} from "@icons";

import { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import { DriveNonComponentTypes, DriveObject, FileType } from "./Drive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { BreadCrumb } from "@src/state/drive/types";
import {
  navigateToDriveByPath,
  navigateToDrivePickerByPath,
} from "@src/state/drive/driveSlice";
import { Reducer } from "@reduxjs/toolkit";
import { useDrive } from "@src/state/drive/hooks";
import { useSetter } from "@src/store/accessors";

export interface FileDir {
  name: string;
  path: string;
  size: number;
  cid: string;
  type: FileType;
  contains?: Array<FileDir | DriveObject>;
  parent?: DriveObject | FileDir | null;
}

const Empty = () => {
  return <div className="p-5 text-xs">No files</div>;
};

interface DriveTableProps {
  onRequestClose: () => void;
  onInsert: (file: DriveObject) => void;
}

const DriveTableFilePicker: React.FC<DriveTableProps> = ({
  onRequestClose,
  onInsert,
}) => {
  const dispatch = useSetter();
  const { currentDrivePicker, breadCrumbsPicker } = useDrive();

  const [selected, setSelected] = useState<number | undefined>(undefined);

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    dispatch(navigateToDrivePickerByPath({ path: drive.path! }));
    setSelected(undefined);
  }

  function eatBreadCrumb(index: number) {
    dispatch(
      navigateToDrivePickerByPath({ path: breadCrumbsPicker[index - 1].path! })
    );
    setSelected(undefined);
  }

  useEffect(() => {
    ReactTooltip.rebuild();

    // reset to root on close
    return () => {
      dispatch(
        navigateToDrivePickerByPath({ path: breadCrumbsPicker[0].path! })
      );
    };
  }, []);

  function toggleSelected(
    index: number,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) {
    if (index === selected) {
      setSelected(undefined);
    } else {
      setSelected(index);
    }
  }

  return (
    <div className="w-full h-full  pb-14">
      {/* <DriveBreadCrumbs crumbs={breadCrumbs} eatBreadCrumb={eatBreadCrumb} /> */}
      <div className="p-4 border-b border-neutrals-gray-7 flex flex-row items-center justify-between">
        <span className="flex flex-row items-center">
          {breadCrumbsPicker.length > 1 ? (
            <span
              className="pr-2 cursor-pointer"
              onClick={() => eatBreadCrumb(breadCrumbsPicker.length - 1)}
            >
              <IconChevronLeft height={14} stroke={"black"} className="mr-2" />
            </span>
          ) : null}
          <span className="font-bold">
            {breadCrumbsPicker[breadCrumbsPicker.length - 1]?.name}
          </span>
        </span>
        <IconX
          height={14}
          stroke={"black"}
          className="cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="h-[calc(100%-156px)]  max-h-[calc(50vh-80px)] overflow-hidden overflow-y-auto w-full outline-none">
        {currentDrivePicker?.contains?.length ? (
          currentDrivePicker.contains.map((f: DriveObject, idx: number) => {
            return (
              <DriveRow
                key={`drive_picker_drive_row_${f.cid}_${f.name}`}
                file={f}
                exploreDirectory={exploreDirectory}
                index={idx}
                selected={idx === selected}
                toggleSelected={toggleSelected}
                onInsert={onInsert}
              />
            );
          })
        ) : (
          <Empty />
        )}
      </div>
      <div className="flex flex-row justify-end items-center p-3 border-t border-neutrals-gray-7 absolute w-full bg-white bottom-0 rounded-b-lg">
        <PrimaryButton
          title="Insert"
          onClick={() => {
            setSelected(undefined);
            selected !== undefined &&
              onInsert(currentDrivePicker?.contains![selected]!);
          }}
          disabled={selected === undefined}
          className="py-1"
        >
          Insert
        </PrimaryButton>
      </div>
    </div>
  );
};

export default DriveTableFilePicker;

interface DriveRowProps {
  file: DriveObject;
  exploreDirectory: (
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) => void;
  index: number;
  selected: boolean;
  toggleSelected: (
    index: number,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) => void;
  onInsert?: (file: DriveObject) => void;
}

function DriveRow({
  file,
  index,
  selected,
  toggleSelected,
  exploreDirectory,
  onInsert,
}: DriveRowProps) {
  function renderComponentIcon() {
    const classes = "w-[34px] h-[34px] ";
    switch (file.componentType) {
      case DriveNonComponentTypes.MANIFEST:
        return <IconResearchNode className={classes} />;
      case ResearchObjectComponentType.PDF:
        return <IconResearchReport className={classes} />;
      case ResearchObjectComponentType.DATA:
        return <IconData className={classes} />;
      case ResearchObjectComponentType.CODE:
        return <IconCodeRepo className={classes} />;
      default:
        return <IconResearchNode className={classes} />;
    }
  }

  return (
    <ul
      className={`h-[48px]list-none font-medium text-sm content-center justify-items-center items-center gap-10 px-5 hover:bg-neutrals-gray-8
        ${
          selected
            ? "bg-tint-primary bg-opacity-50 hover:bg-tint-primary hover:bg-opacity-75"
            : null
        }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!file.contains) {
          toggleSelected(index, file.componentType);
        }
      }}
    >
      <li
        className={`justify-self-start flex gap-2 w-full h-[48px] items-center cursor-pointer`}
        onClick={(e) => {
          if (e.ctrlKey) return;
          if (file.contains) exploreDirectory(file.name, file);
        }}
      >
        <span>
          {file.type === FileType.DIR ? (
            <IconDirectory />
          ) : (
            <IconIpfs height={20} width={17.3} />
          )}
        </span>
        {file.name}
      </li>
    </ul>
  );
}
