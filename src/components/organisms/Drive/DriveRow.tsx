import BlackGenericButton from "@components/atoms/BlackGenericButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { BytesToHumanFileSize } from "@components/utils";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
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
import { starComponentThunk } from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";
import { COMPONENT_LIBRARY, UiComponentDefinition } from "../ComponentLibrary";

function renderComponentIcon(file: DriveObject) {
  const classes = "!w-[20px] !h-[20px]";
  const foundEntry = COMPONENT_LIBRARY.find((target: UiComponentDefinition) => {
    return target.componentType === file.componentType;
  });
  const { icon } = foundEntry!;
  const iconOverwrite = React.cloneElement(icon, {
    className: `${icon.props.className}`,
    ringClassName: `${classes}`,
  });
  return iconOverwrite;
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
}: // setOldComponentMetadata,
DriveRowProps) {
  const contextRef = useRef<HTMLDivElement>();
  const { init } = useDriveContext(file);
  const { handleDbClick } = useInteractionHandler();
  const { setUseMenuCids, setShowCitationModal, setComponentToCite } =
    useManuscriptController(["componentToCite"]);
  const { manifestCid, mode } = useNodeReader();

  const dispatch = useSetter();

  const handleRef = useCallback(
    (node: HTMLDivElement) => {
      if (
        file.type === FileType.DIR &&
        file.parent?.path?.toLowerCase().includes("noderoot")
      )
        return;
      if (node !== null) {
        contextRef.current = node;
        init(node);
      }
    },
    [file.parent?.path, file.type, init]
  );

  const isStatusActionDisabled =
    !canEditMetadata ||
    (file.componentType === ResearchObjectComponentType.DATA &&
      mode === "reader");

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
      <li className={`${everyRow}`}>
        <IconStar
          className={`cursor-pointer ${
            file.starred
              ? "fill-tint-primary stroke-tint-primary hover:fill-tint-primary hover:stroke-neutrals-gray-5 hover:opacity-20"
              : "stroke-neutrals-gray-5 hover:fill-tint-primary hover:stroke-tint-primary hover:opacity-70"
          }`}
          width={18}
          height={18}
          onClick={() => dispatch(starComponentThunk({ item: file }))}
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
        <span>
          {file.type === FileType.DIR ? (
            <IconDirectory
              fill="#28AAC4"
              className={`w-[34px] ${
                file.componentType !== DriveNonComponentTypes.UNKNOWN
                  ? "fill-tint-primary"
                  : "fill-neutrals-gray-5"
              }`}
            />
          ) : (
            <div className="scale-[65%] w-[34px]">
              {renderComponentIcon(file)}
            </div>
          )}
        </span>
        <span className="truncate max-w-sm">{file.name}</span>
      </li>
      <li className={`${everyRow}`}>{file.lastModified}</li>
      <li className={`${everyRow}`}>{file.accessStatus}</li>
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
            setComponentToCite(file);
            setShowCitationModal(true);
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
            const cid = file.cid ? file.cid : manifestCid ? manifestCid : "";
            setUseMenuCids([cid]);
          }}
        >
          <IconPlayRounded className="p-0" />
        </BlackGenericButton>
      </li>
    </div>
  );
}
