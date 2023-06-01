import { AccessStatus, DriveObject, FileType } from "../types";
import { Actions } from "./types";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  saveManifestDraft,
  setComponentStack,
  setManifest,
  setManifestCid,
} from "@src/state/nodes/nodeReader";
import { useSetter } from "@src/store/accessors";
import axios from "axios";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import { separateFileNameAndExtension } from "@src/state/drive/utils";
import {
  fetchTreeThunk,
  removeFileFromCurrentDrive,
  setFileBeingRenamed,
  setFileMetadataBeingEdited,
} from "@src/state/drive/driveSlice";
import { setComponentTypeBeingAssignedTo } from "@src/state/drive/driveSlice";
import { deleteData } from "@src/api";
import { DRIVE_FULL_EXTERNAL_LINKS_PATH } from "@src/state/drive/utils";
import { deleteComponent } from "@src/state/nodes/nodeReader";
import { useDrive } from "@src/state/drive/hooks";
import { useContextMenu } from "./provider";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;
const PUB_IPFS_URL = process.env.REACT_APP_PUBLIC_IPFS_RESOLVER;

export const getActionState = (action: Actions, file: DriveObject) => {
  if (file.accessStatus === AccessStatus.UPLOADING) return { disabled: true };
  switch (action) {
    case Actions.PREVIEW:
      return {
        disabled: file.type !== FileType.FILE,
      };
    case Actions.RENAME:
      return {
        disabled: file?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH,
      };
    case Actions.DOWNLOAD:
      return {
        disabled:
          file.componentType === ResearchObjectComponentType.LINK ||
          file.type === FileType.DIR,
      };
    case Actions.REMOVE:
      return {
        disabled: file?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH,
      };
    case Actions.ASSIGN_TYPE:
      return {
        disabled: file.componentType === ResearchObjectComponentType.LINK,
      };
    case Actions.EDIT_METADATA:
      return {
        disabled: !(
          file.componentType === ResearchObjectComponentType.DATA ||
          file.componentType === ResearchObjectComponentType.PDF ||
          file.componentType === ResearchObjectComponentType.CODE
        ),
      };
    case Actions.MOVE:
      return {
        disabled:
          file?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH ||
          file.componentType === ResearchObjectComponentType.LINK,
      };
    default:
      return { disabled: true };
  }
};

export default function useActionHandler() {
  const dispatch = useSetter();
  const {
    manifest: manifestData,
    manifestCid,
    currentObjectId,
    mode,
  } = useNodeReader();
  const { deprecated } = useDrive();

  const { openDrivePicker } = useContextMenu();

  async function preview(file: DriveObject) {
    if (
      [
        ResearchObjectComponentType.PDF,
        ResearchObjectComponentType.CODE,
        ResearchObjectComponentType.LINK,
      ].includes(file.componentType as ResearchObjectComponentType)
    ) {
      const component = deprecated
        ? manifestData?.components.find(
            (c: ResearchObjectV1Component) => c.payload.url === file.cid
          )
        : manifestData?.components.find(
            (c: ResearchObjectV1Component) => c.payload.path === file.path
          );
      if (component) {
        dispatch(setComponentStack([component]));
      }
    } else {
      if (file.external) {
        window.open(`${PUB_IPFS_URL}/${file.cid}`, "_blank");
      } else {
        window.open(`${IPFS_URL}/${file.cid}`, "_blank");
      }
    }
  }

  async function remove(file: DriveObject) {
    if (mode !== "editor") return;

    if (file.componentType === ResearchObjectComponentType.LINK) {
      dispatch(
        removeFileFromCurrentDrive({ where: { componentId: file.componentId } })
      );
      dispatch(deleteComponent({ componentId: file.componentId! }));
      dispatch(saveManifestDraft({ uuid: currentObjectId! }));
      return;
    }

    const snapshotManifest = { ...manifestData! };
    const snapshotManifestCid = manifestCid;
    const component = manifestData?.components?.find(
      (c) => c.payload?.path === file.path
    );
    if (component) dispatch(deleteComponent({ componentId: component.id }));
    dispatch(removeFileFromCurrentDrive({ where: { path: file.path! } }));
    try {
      const { manifestCid: newManifestCid, manifest: newManifest } =
        await deleteData(currentObjectId!, file.path!);
      if (newManifestCid && newManifest) {
        dispatch(setManifest(newManifest));
        dispatch(setManifestCid(newManifestCid));
        dispatch(fetchTreeThunk());
      }
    } catch (e: any) {
      console.error(
        "[DATA::DELETE] Failed to delete, error: ",
        e,
        "file: ",
        file
      );
      if (component) {
        dispatch(setManifest(snapshotManifest!));
        dispatch(setManifestCid(snapshotManifestCid));
      }
      dispatch(fetchTreeThunk());
    }
  }

  async function rename(file: DriveObject) {
    if (mode !== "editor") return;
    dispatch(setFileBeingRenamed(file));
  }

  async function download(file: DriveObject) {
    if (file.componentType === ResearchObjectComponentType.LINK) return;
    postUserAction(
      AvailableUserActionLogTypes.btnDownloadData,
      JSON.stringify({ nodeUuid: currentObjectId, cid: file.cid })
    );
    const url = `${IPFS_URL}/${file.cid}`;
    const { fileName, extension } = separateFileNameAndExtension(file.name);
    axios({
      url,
      method: "GET",
      responseType: "blob", // important
    }).then((response: any) => {
      const url2 = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url2;
      link.setAttribute(
        "download",
        `${fileName}${extension ? `.${extension}` : ""}`
      );
      document.body.appendChild(link);
      link.click();
    });
  }

  async function assignType(file: DriveObject) {
    if (mode !== "editor") return;
    dispatch(setComponentTypeBeingAssignedTo(file.path!));
  }

  async function editMetadata(file: DriveObject) {
    if (mode !== "editor") return;
    dispatch(setFileMetadataBeingEdited(file));
  }

  async function move(file: DriveObject) {
    openDrivePicker();
  }

  const handler: Record<
    Actions,
    ((file: DriveObject) => Promise<void>) | null
  > = {
    MOVE: move,
    RENAME: rename,
    PREVIEW: preview,
    DOWNLOAD: download,
    REMOVE: remove,
    ASSIGN_TYPE: assignType,
    EDIT_METADATA: editMetadata,
  };

  return handler;
}

export function useInteractionHandler() {
  const handler = useActionHandler();

  function handleDbClick(e: React.MouseEvent, file: DriveObject) {
    e.preventDefault();
    const { disabled } = getActionState(Actions.PREVIEW, file);
    if (!disabled) {
      handler["PREVIEW"]?.(file);
    }
  }

  return { handleDbClick };
}
