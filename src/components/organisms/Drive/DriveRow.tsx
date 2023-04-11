import BlackGenericButton from "@components/atoms/BlackGenericButton";
import StatusButton, { ButtonState } from "@components/atoms/StatusButton";
import {
  findRootComponentCid,
  getMetadataStatus,
  getVirtualDriveMetadataStatus,
  isNodeRootDrive,
  isRootComponentDrive,
} from "@components/driveUtils";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { BytesToHumanFileSize } from "@components/utils";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
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
import { findTarget } from "@src/components/molecules/ComponentCard";
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
  // setShowEditMetadata,
  exploreDirectory,
  // datasetMetadataInfoRef,
  // setMetaStaging,
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
  const {
    manifestCid,
    manifest: manifestData,
    publicView,
    mode,
  } = useNodeReader();

  const dispatch = useSetter();

  // const handleEditMetadata = () => {
  //   // debugger;
  //   if (file.componentType !== ResearchObjectComponentType.DATA) {
  //     const component = manifestData?.components.find(
  //       (c: ResearchObjectV1Component) => c.id === file.cid
  //     );
  //     if (!component) return;
  //     setOldComponentMetadata({
  //       componentId: component.id,
  //       cb: () => {
  //         const { keywords, description, licenseType } = component.payload;

  //         const newMetadata = { keywords, description, licenseType };
  //         file.metadata = newMetadata;
  //       },
  //     });
  //   }

  //   if (file.componentType === ResearchObjectComponentType.DATA) {
  //     // debugger;
  //     if (!isMultiselecting)
  //       setMetaStaging([
  //         {
  //           file: file,
  //           index: index,
  //         },
  //       ]);

  //     if (isMultiselecting) {
  //       datasetMetadataInfoRef.current.prepopulateFromName = file.name;
  //       const staging = Object.keys(selectedFiles).map((fileIndex: string) => {
  //         const parentDriveObj = file.parent;
  //         const selectedFile = parentDriveObj?.contains![
  //           parseInt(fileIndex)
  //         ] as DriveObject;
  //         return {
  //           file: selectedFile!,
  //         };
  //       });
  //       setMetaStaging(staging);
  //     }

  //     //dag file/dir (submetadata)
  //     if (!isRootComponentDrive(file)) {
  //       const rootCid = findRootComponentCid(file);
  //       if (rootCid) datasetMetadataInfoRef.current.rootCid = rootCid;
  //     }
  //     datasetMetadataInfoRef.current.prepopulateMetadata = file.metadata;

  //     if (setShowEditMetadata) setShowEditMetadata(true);
  //   }
  // };

  // const metaStatus = useMemo(() => {
  //   if (isNodeRootDrive(file)) return getVirtualDriveMetadataStatus(file);
  //   return getMetadataStatus(file);
  //   // DONT ADJUST DEPENDENCY ARRAY
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [file.metadata]);

  // const isNodeRoot = isNodeRootDrive(file);
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

  // const getStatusButtonLabel = () =>
  //   isNodeRoot ? "Metadata Status" : "Edit Metadata";

  return (
    // <ul
    //   ref={handleRef}
    //   className={`h-[48px] grid list-none font-medium text-sm text-white content-center justify-items-center items-center gap-10 border-b border-[#555659] last-of-type:border-none px-5 last-of-type:rounded-b-xl select-none
    //    ${
    //      selected
    //        ? "bg-tint-primary bg-opacity-50 hover:bg-tint-primary hover:bg-opacity-75"
    //        : "hover:bg-neutrals-gray-2"
    //    }`}
    //   style={{
    //     gridTemplateColumns:
    //       "2fr repeat(4, minmax(auto, 1fr)) minmax(125px, auto) repeat(2, 40px)",
    //   }}
    //   onDoubleClick={(e) => handleDbClick(e, file)}
    //   onClick={(e) => {
    //     if (e.ctrlKey) {
    //       e.stopPropagation();
    //       toggleSelected(index, file.componentType);
    //     }
    //   }}
    // >
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
            // <IconIpfs height={20} width={17.3} />
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
        {/* <button className="" onClick={() => setRenameComponentId(file.cid)}>rn</button> */}
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
