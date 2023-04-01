import BlackGenericButton from "@components/atoms/BlackGenericButton";
import StatusButton from "@components/atoms/StatusButton";
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
  IconCPU,
  IconData,
  IconDirectory,
  IconIpfs,
  IconResearchNode,
  IconResearchReport,
} from "@icons";
import { useCallback, useMemo, useRef } from "react";
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

export const DRIVE_ROW_STYLES = [
  "justify-self-start w-44 2xl:w-full min-w-44 flex-grow-3", // file
  "hidden 2xl:block w-48", // last modified
  "hidden xl:block", // type
  "px-3 py-2 hover:bg-neutrals-gray-1 rounded-lg cursor-default hidden xl:block w-32 text-center", // status
  "w-20 hidden 2xl:block", // file size
  "w-10 lg:w-32 hidden lg:block text-center", //metadata
  "w-10 hidden lg:block text-center", // cite
  "w-10 hidden lg:block text-center", // use
];

function renderComponentIcon(file: DriveObject) {
  const classes = "w-[34px] h-[34px]";
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

export default function DriveRow({
  file,
  index,
  selected,
  isMultiselecting,
  toggleSelected,
  setShowEditMetadata,
  exploreDirectory,
  datasetMetadataInfoRef,
  setMetaStaging,
  selectedFiles,
  canEditMetadata,
  canUse,
  setOldComponentMetadata,
}: DriveRowProps) {
  const contextRef = useRef<HTMLUListElement>();
  const { init } = useDriveContext(file);
  const { handleDbClick } = useInteractionHandler();
  const { setUseMenuCids, setShowCitationModal, setComponentToCite } =
    useManuscriptController(["componentToCite"]);
  const { manifestCid, manifest: manifestData, publicView } = useNodeReader();

  const handleEditMetadata = () => {
    // debugger;
    if (file.componentType !== ResearchObjectComponentType.DATA) {
      const component = manifestData?.components.find(
        (c: ResearchObjectV1Component) => c.id === file.cid
      );
      if (!component) return;
      setOldComponentMetadata({
        componentId: component.id,
        cb: () => {
          const { keywords, description, licenseType } = component.payload;

          const newMetadata = { keywords, description, licenseType };
          file.metadata = newMetadata;
        },
      });
    }

    if (file.componentType === ResearchObjectComponentType.DATA) {
      // debugger;
      if (!isMultiselecting)
        setMetaStaging([
          {
            file: file,
            index: index,
          },
        ]);

      if (isMultiselecting) {
        datasetMetadataInfoRef.current.prepopulateFromName = file.name;
        const staging = Object.keys(selectedFiles).map((fileIndex: string) => {
          const parentDriveObj = file.parent;
          const selectedFile = parentDriveObj?.contains![
            parseInt(fileIndex)
          ] as DriveObject;
          return {
            file: selectedFile!,
          };
        });
        setMetaStaging(staging);
      }

      //dag file/dir (submetadata)
      if (!isRootComponentDrive(file)) {
        const rootCid = findRootComponentCid(file);
        if (rootCid) datasetMetadataInfoRef.current.rootCid = rootCid;
      }
      datasetMetadataInfoRef.current.prepopulateMetadata = file.metadata;

      if (setShowEditMetadata) setShowEditMetadata(true);
    }
  };

  const metaStatus = useMemo(() => {
    if (isNodeRootDrive(file)) return getVirtualDriveMetadataStatus(file);
    return getMetadataStatus(file);
    // DONT ADJUST DEPENDENCY ARRAY
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.metadata]);

  const isNodeRoot = isNodeRootDrive(file);
  const handleRef = useCallback(
    (node: HTMLUListElement) => {
      if (
        file.type === FileType.Dir &&
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

  console.log("file", file);
  return (
    <ul
      ref={handleRef}
      className={`h-[48px] grid list-none font-medium text-sm text-white content-center justify-items-center items-center gap-10 border-b border-[#555659] last-of-type:border-none px-5 last-of-type:rounded-b-xl select-none
       ${
         selected
           ? "bg-tint-primary bg-opacity-50 hover:bg-tint-primary hover:bg-opacity-75"
           : "hover:bg-neutrals-gray-2"
       }`}
      style={{
        gridTemplateColumns:
          "2fr repeat(4, minmax(auto, 1fr)) minmax(125px, auto) repeat(2, 40px)",
      }}
      onDoubleClick={(e) => handleDbClick(e, file)}
      onClick={(e) => {
        if (e.ctrlKey) {
          e.stopPropagation();
          toggleSelected(index, file.componentType);
        }
      }}
    >
      <li
        className={`justify-self-start flex gap-2 h-[48px] items-center cursor-pointer overflow-hidden ${DRIVE_ROW_STYLES[0]}`}
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
          {file.type === "dir" ? (
            <IconDirectory />
          ) : (
            <IconIpfs height={20} width={17.3} />
          )}
        </span>
        <span className="truncate max-w-sm">{file.name}</span>
      </li>
      <li className={`${DRIVE_ROW_STYLES[1]}`}>{file.lastModified}</li>
      <li className={`${DRIVE_ROW_STYLES[2]}`}>{renderComponentIcon(file)}</li>
      <li className={`${DRIVE_ROW_STYLES[3]}`}>{file.accessStatus}</li>
      <li
        onClick={() =>
          console.log(
            `metadata for file named ${file.name} with path ${
              file.path
            }: ${JSON.stringify(file.metadata)}`
          )
        }
        className={`${DRIVE_ROW_STYLES[4]}`}
      >
        {BytesToHumanFileSize(file.size)}
        {/* <button className="" onClick={() => setRenameComponentId(file.cid)}>rn</button> */}
      </li>
      {publicView ? (
        <></>
      ) : (
        <>
          <li className={`${DRIVE_ROW_STYLES[5]}`}>
            <StatusButton
              status={metaStatus}
              disabled={!canEditMetadata}
              className={`lg:w-[125px] justify-center ${
                isNodeRoot ? "pointer-events-none" : "gap-2.5"
              }`}
              onClick={handleEditMetadata}
            >
              <>
                <span className="hidden lg:block">
                  {isNodeRoot ? "Metadata Status" : "Edit Metadata"}
                </span>
                <span className="lg:hidden">
                  {isNodeRoot ? "Status" : "Edit"}
                </span>
              </>
            </StatusButton>
          </li>
        </>
      )}
      <li className={`${DRIVE_ROW_STYLES[6]}`}>
        <BlackGenericButton
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
          Cite
        </BlackGenericButton>
      </li>
      <li className={`${DRIVE_ROW_STYLES[7]}`}>
        <BlackGenericButton
          disabled={!canUse}
          onClick={() => {
            const cid = file.cid ? file.cid : manifestCid ? manifestCid : "";
            setUseMenuCids([cid]);
          }}
        >
          <IconCPU className={`p-0 `} />
        </BlackGenericButton>
      </li>
    </ul>
  );
}
