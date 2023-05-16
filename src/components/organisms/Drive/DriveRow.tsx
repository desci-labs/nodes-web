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
  findTarget,
} from "../ComponentLibrary";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { DRIVE_FULL_EXTERNAL_LINKS_PATH } from "@src/state/drive/utils";
import ExternalService from "@src/components/atoms/ExternalServices";

function renderComponentIcon(file: DriveObject) {
  const foundEntry = findTarget(
    file.componentType as ResearchObjectComponentType,
    file.componentSubtype
  );

  const { icon } = foundEntry || { icon: () => <IconDirectory /> };
  return icon({ wrapperClassName: "scale-[0.85]" });
}

export default function DriveRow({
  file,
  index,
  selected,
  toggleSelected,
  exploreDirectory,
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

  const isExternalLinksDir = file?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH;
  const isExternalLink =
    !isExternalLinksDir &&
    file?.path?.startsWith(DRIVE_FULL_EXTERNAL_LINKS_PATH);

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
          toggleSelected(file.path!, file.componentType);
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
          if (
            mode === "editor" &&
            file.accessStatus !== AccessStatus.UPLOADING
          ) {
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
        className={`${everyRow} !justify-start gap-1 cursor-pointer text-xs`}
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
        <span className="truncate max-w-sm align-middle leading-loose">
          {file.name}
        </span>
      </li>
      <li
        className={`${everyRow} ${
          isExternalLink ? "" : "hidden"
        } col-service text-xs !justify-start`}
      >
        {isExternalLink && <ExternalService url={file.cid!} />}
      </li>
      <li
        className={`${everyRow} ${
          isExternalLink ? "hidden" : ""
        } col-last-modified text-xs`}
      >
        {isExternalLinksDir ? "-" : file.lastModified} $
      </li>
      <li
        className={`${everyRow} ${
          isExternalLink ? "hidden" : ""
        } col-status text-xs`}
      >
        {file.accessStatus === AccessStatus.UPLOADING
          ? "Private"
          : isExternalLinksDir
          ? "-"
          : file.accessStatus}
      </li>
      <li
        onClick={() =>
          console.log(
            `metadata for file named ${file.name} with path ${
              file.path
            }: ${JSON.stringify(file.metadata)}`
          )
        }
        className={`${everyRow} ${isExternalLink ? "hidden" : ""} text-xs`}
      >
        {isExternalLinksDir ? "-" : BytesToHumanFileSize(file.size)}
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
          disabled={
            !canUse ||
            file.accessStatus === AccessStatus.UPLOADING ||
            isExternalLinksDir
          }
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
