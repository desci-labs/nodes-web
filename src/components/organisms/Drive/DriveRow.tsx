import BlackGenericButton from "@components/atoms/BlackGenericButton";
import { BytesToHumanFileSize } from "@components/utils";
import {
  IconCodeRepo,
  IconData,
  IconDirectory,
  IconPlayRounded,
  IconQuotes,
  IconResearchNode,
  IconResearchReport,
  IconStar,
} from "@icons";
import React, { useCallback, useRef } from "react";
import {
  AccessStatus,
  DriveNonComponentTypes,
  DriveObject,
  DriveRowProps,
  FileType,
} from "./types";
import { useDriveContext } from "./ContextMenu/Index";
import { useInteractionHandler } from "./ContextMenu/useActionHandler";
import { useNodeReader } from "@src/state/nodes/hooks";
import { everyRow } from ".";
import "./styles.scss";
import {
  setFileBeingCited,
  setFileBeingUsed,
  starComponentThunk,
} from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";
import {
  COMPONENT_LIBRARY,
  EXTERNAL_COMPONENTS,
  UiComponentDefinition,
} from "../ComponentLibrary";

function renderComponentIcon(file: DriveObject) {
  const foundEntry = COMPONENT_LIBRARY.concat(EXTERNAL_COMPONENTS).find(
    (target: UiComponentDefinition) => {
      return target.componentType === file.componentType;
    }
  );
  const { icon } = foundEntry || { icon: () => <IconDirectory /> };
  return icon({ wrapperClassName: "scale-[0.85]" });
}

export default function DriveRow({
  file,
  index,
  selected,
  isMultiselecting,
  toggleSelected,
  exploreDirectory,
  selectedFiles,
  canEditMetadata,
  canUse,
  deprecated,
}: DriveRowProps) {
  const contextRef = useRef<HTMLDivElement>();
  const { init } = useDriveContext(file);
  const { handleDbClick } = useInteractionHandler();
  const { mode } = useNodeReader();

  const dispatch = useSetter();

  const handleRef = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        contextRef.current = node;
        init(node);
      }
    },
    [init]
  );

  return (
    <div
      ref={handleRef}
      className={`singleRow contents !bg-neutrals-gray-2 ${
        selected ? "singleRowSelected" : null
      }`}
      onDoubleClick={(e) => handleDbClick(e, file)}
      onClick={(e) => {
        if (e.ctrlKey) {
          e.stopPropagation();
          toggleSelected(index, file.componentType);
        }
      }}
    >
      <li
        className={`${everyRow} ${
          deprecated ? "hidden" : ""
        } p-2 cursor-pointer group ${
          mode === "reader" ? "pointer-events-none" : ""
        }`}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
        onClick={() => {
          if (mode === "editor") {
            dispatch(starComponentThunk({ item: file }));
          }
        }}
      >
        <IconStar
          className={` ${
            file.starred
              ? "fill-tint-primary stroke-tint-primary group-hover:fill-tint-primary group-hover:stroke-neutrals-gray-5 group-hover:opacity-40"
              : "stroke-neutrals-gray-5 group-hover:fill-tint-primary group-hover:stroke-tint-primary group-hover:opacity-70"
          }`}
          width={18}
          height={18}
        />
      </li>
      <li
        className={`${everyRow} !justify-start gap-1 cursor-pointer`}
        onClick={(e) => {
          if (e.ctrlKey) return;
          if (
            file.accessStatus === AccessStatus.UPLOADING ||
            file.accessStatus === AccessStatus.FAILED
          )
            return;
          if (file.contains) exploreDirectory(file.name, file);
        }}
      >
        <div className="mr-1">
          {file.type === FileType.DIR ? (
            <IconDirectory
              fill="#28AAC4"
              width={24}
              height={24}
              className={`w-[34px] ${
                file.componentType !== DriveNonComponentTypes.UNKNOWN
                  ? "fill-tint-primary"
                  : "fill-neutrals-gray-5"
              }`}
            />
          ) : (
            <div className="w-[34px] mr-1 -ml-1 ">
              {renderComponentIcon(file)}
            </div>
          )}
        </div>
        <span className="truncate max-w-sm">{file.name}</span>
      </li>
      <li className={`${everyRow} col-last-modified`}>{file.lastModified}</li>
      <li className={`${everyRow} col-status`}>{file.accessStatus}</li>
      <li
        onClick={() =>
          console.log(
            `metadata for file named ${file.name} with path ${
              file.path
            }: ${JSON.stringify(file.metadata)}`
          )
        }
        className={`${everyRow}`}
      >
        {BytesToHumanFileSize(file.size)}
      </li>
      <li className={`${everyRow}`}>
        <BlackGenericButton
          className="w-7 h-7"
          disabled={
            ![AccessStatus.PUBLIC, AccessStatus.PARTIAL].includes(
              file.accessStatus
            )
          }
          onClick={() => {
            dispatch(setFileBeingCited(file));
          }}
        >
          <IconQuotes />
        </BlackGenericButton>
      </li>
      <li className={`${everyRow}`}>
        <BlackGenericButton
          disabled={!canUse}
          className="p-0 min-w-[28px] h-7"
          onClick={() => {
            dispatch(setFileBeingUsed(file));
          }}
        >
          <IconPlayRounded className="p-0" />
        </BlackGenericButton>
      </li>
    </div>
  );
}
