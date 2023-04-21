import { DriveObject, FileType } from "../types";
import { Actions } from "./types";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  setComponentStack,
  setManifest,
  setManifestCid,
} from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import {
  fetchTreeThunk,
  setFileMetadataBeingEdited,
} from "@src/state/drive/driveSlice";
import { setComponentTypeBeingAssignedTo } from "@src/state/drive/driveSlice";
import { deleteData } from "@src/api";
import { DRIVE_FULL_EXTERNAL_LINKS_PATH } from "@src/state/drive/utils";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;

export const getActionState = (action: Actions, file: DriveObject) => {
  switch (action) {
    case Actions.PREVIEW:
      return {
        disabled: file.type !== FileType.FILE,
      };
    case Actions.RENAME:
      return {
        disabled: true,
      };
    case Actions.REMOVE:
      return {
        disabled: file?.path?.startsWith(DRIVE_FULL_EXTERNAL_LINKS_PATH),
      };
    case Actions.ASSIGN_TYPE:
      return { disabled: false };
    case Actions.EDIT_METADATA:
      return {
        disabled: !(
          file.componentType === ResearchObjectComponentType.DATA ||
          file.componentType === ResearchObjectComponentType.PDF ||
          file.componentType === ResearchObjectComponentType.CODE
        ),
      };
    default:
      return { disabled: true };
  }
};

export default function useActionHandler() {
  const dispatch = useSetter();
  const { manifest: manifestData, currentObjectId, mode } = useNodeReader();

  async function preview(file: DriveObject) {
    if (
      [
        ResearchObjectComponentType.PDF,
        ResearchObjectComponentType.CODE,
        ResearchObjectComponentType.LINK,
      ].includes(file.componentType as ResearchObjectComponentType)
    ) {
      const component = manifestData?.components.find(
        (c: ResearchObjectV1Component) => c.payload.url === file.cid
      );
      if (component) {
        dispatch(setComponentStack([component]));
      }
    } else {
      window.open(`${IPFS_URL}/${file.cid}`, "_blank");
    }
  }

  async function remove(file: DriveObject) {
    if (mode !== "editor") return;
    // optimistically delete components with payload path
    // optimistically delete from cwd
    try {
      const { manifestCid, manifest } = await deleteData(
        currentObjectId!,
        file.path!
      );
      if (manifestCid && manifest) {
        dispatch(setManifest(manifest));
        dispatch(setManifestCid(manifestCid));
      }
    } catch (e: any) {
      console.error(
        "[DATA::DELETE] Failed to delete, error: ",
        e,
        "file: ",
        file
      );
      dispatch(fetchTreeThunk());
    }
  }

  async function rename(file: DriveObject) {
    if (mode !== "editor") return;
    //TODO: in the future a similar action as below may be required for code components, or any component where cid !== id
    // if (
    //   file.componentType === ResearchObjectComponentType.DATA &&
    //   manifestData
    // ) {
    //   const comp = manifestData.components.find(
    //     (c: ResearchObjectV1Component) => c.payload.cid === file.cid
    //   );
    //   if (comp) setRenameComponentId(comp.id);
    //   return;
    // }
    // setRenameComponentId(file.cid);
  }

  async function assignType(file: DriveObject) {
    if (mode !== "editor") return;
    dispatch(setComponentTypeBeingAssignedTo(file.path!));
  }

  async function editMetadata(file: DriveObject) {
    if (mode !== "editor") return;
    dispatch(setFileMetadataBeingEdited(file));
  }

  const handler: Record<
    Actions,
    ((file: DriveObject) => Promise<void>) | null
  > = {
    RENAME: rename,
    PREVIEW: preview,
    DOWNLOAD: null,
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
