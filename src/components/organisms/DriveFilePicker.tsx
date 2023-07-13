import PrimaryButton from "@components/atoms/PrimaryButton";

import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { IconChevronLeft, IconDirectory, IconIpfs, IconX } from "@icons";

import { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import { DriveNonComponentTypes, DriveObject, FileType } from "./Drive";
import {
  fetchTreeThunk,
  navigateFetchThunk,
  navigateToDrivePickerByPath,
} from "@src/state/drive/driveSlice";
import { useDrive } from "@src/state/drive/hooks";
import { useSetter } from "@src/store/accessors";
import { DRIVE_FULL_EXTERNAL_LINKS_PATH } from "@src/state/drive/utils";

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

export enum DrivePickerMode {
  ANNOTATION = "annotation",
  MOVE = "move",
}
interface DriveTableProps {
  onRequestClose: () => void;
  onInsert: (file: DriveObject) => void;
  mode?: DrivePickerMode;
  contextDrive?: DriveObject;
}

const DriveTableFilePicker: React.FC<DriveTableProps> = ({
  onRequestClose,
  onInsert,
  mode = DrivePickerMode.ANNOTATION,
  contextDrive,
}) => {
  const dispatch = useSetter();
  const { currentDrivePicker, breadCrumbsPicker, currentDrive } = useDrive();

  const [selected, setSelected] = useState<number | undefined>(undefined);

  function exploreDirectory(
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) {
    // debugger;
    dispatch(navigateFetchThunk({ path: drive.path!, driveKey: "Picker" }));
    // dispatch(fetchTreeThunk());
    setSelected(undefined);
  }

  function eatBreadCrumb(index: number) {
    dispatch(
      navigateFetchThunk({
        path: breadCrumbsPicker[index - 1].path!,
        driveKey: "Picker",
      })
    );
    setSelected(undefined);
  }

  useEffect(() => {
    ReactTooltip.rebuild();

    // reset to root on close
    return () => {
      dispatch(
        navigateFetchThunk({
          path: breadCrumbsPicker[0].path!,
          driveKey: "Picker",
        })
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

  const moveModeDisabledConditions =
    mode === DrivePickerMode.MOVE
      ? currentDrivePicker?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH ||
        currentDrivePicker?.path === currentDrive?.path ||
        !!(
          contextDrive?.path &&
          currentDrivePicker?.path!.includes(contextDrive?.path)
        )
      : false;

  return (
    <div className="w-full h-full  pb-14">
      {/* <DriveBreadCrumbs crumbs={breadCrumbs} eatBreadCrumb={eatBreadCrumb} /> */}
      <div
        className={`p-4 border-b border-neutrals-gray-7 flex flex-row items-center justify-between ${
          mode === DrivePickerMode.MOVE ? "border-black" : ""
        }`}
      >
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
          stroke={DrivePickerMode.MOVE ? "white" : "black"}
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
                mode={mode}
              />
            );
          })
        ) : (
          <Empty />
        )}
      </div>
      <div
        className={`flex flex-row justify-end items-center p-3 border-t border-neutrals-gray-7 absolute w-full bg-white bottom-0 rounded-b-lg ${
          mode === DrivePickerMode.MOVE
            ? "bg-neutrals-gray-1 border-primary"
            : ""
        }`}
      >
        <PrimaryButton
          title="Insert"
          onClick={() => {
            if (mode === DrivePickerMode.ANNOTATION) {
              setSelected(undefined);
              selected !== undefined &&
                onInsert(currentDrivePicker?.contains![selected]!);
            }
            if (mode === DrivePickerMode.MOVE) {
              onInsert(currentDrivePicker!);
            }
          }}
          disabled={
            (mode === DrivePickerMode.ANNOTATION && selected === undefined) ||
            moveModeDisabledConditions
          }
          className="py-1"
        >
          {mode === DrivePickerMode.MOVE ? "Move Here" : "Insert"}
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
  mode?: DrivePickerMode;
}

function DriveRow({
  file,
  index,
  selected,
  toggleSelected,
  exploreDirectory,
  onInsert,
  mode = DrivePickerMode.ANNOTATION,
}: DriveRowProps) {
  return (
    <ul
      className={`h-[48px]list-none font-medium text-sm content-center justify-items-center items-center gap-10 px-5 ${
        mode === DrivePickerMode.MOVE
          ? "hover:bg-neutrals-gray-2"
          : "hover:bg-neutrals-gray-8"
      }
        ${
          selected
            ? "bg-tint-primary bg-opacity-50 hover:bg-tint-primary hover:bg-opacity-75"
            : null
        }`}
      onClick={(e) => {
        e.stopPropagation();
        if (
          mode === DrivePickerMode.ANNOTATION &&
          file.type === FileType.FILE
        ) {
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
            <IconDirectory
              className={`${
                file.componentType !== DriveNonComponentTypes.UNKNOWN
                  ? "fill-tint-primary"
                  : "fill-neutrals-gray-5"
              }`}
            />
          ) : (
            <IconIpfs height={20} width={17.3} />
          )}
        </span>
        {file.name}
      </li>
    </ul>
  );
}
