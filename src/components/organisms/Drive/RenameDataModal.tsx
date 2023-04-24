import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import InsetLabelInput from "@src/components/molecules/FormInputs/InsetLabelInput";
import Modal from "@src/components/molecules/Modal/Modal";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  updateComponent,
  saveManifestDraft,
  setManifest,
  setManifestCid,
} from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import React, { useEffect, useState } from "react";
import { DriveObject } from "./types";
import {
  fetchTreeThunk,
  renameFileInCurrentDrive,
  setFileBeingRenamed,
} from "@src/state/drive/driveSlice";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { renameData } from "@src/api";

interface RenameDataModalProps {
  file: DriveObject;
}

const RenameDataModal: React.FC<RenameDataModalProps> = ({ file }) => {
  const dispatch = useSetter();
  const {
    manifest: manifestData,
    manifestCid,
    currentObjectId,
  } = useNodeReader();
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setNewName(file.name);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    dispatch(
      renameFileInCurrentDrive({ filePath: file.path!, newName: newName })
    );
    if (file.componentType === ResearchObjectComponentType.LINK) {
      const index = manifestData!.components.findIndex(
        (c) => c.id === file.componentId
      );
      if (index !== -1) {
        const oldPathSplit = file.path!.split("/");
        oldPathSplit.pop();
        oldPathSplit.push(newName);
        const newPath = oldPathSplit.join("/");
        dispatch(
          updateComponent({
            index,
            update: { name: newName, payload: { path: newPath } },
          })
        );
        dispatch(saveManifestDraft({}));
      }
      close();
    }

    const snapshotManifest = { ...manifestData! };
    const snapshotManifestCid = manifestCid;
    const component = manifestData?.components?.find(
      (c) => c.payload?.path === file.path
    );
    try {
      const { manifestCid: newManifestCid, manifest: newManifest } =
        await renameData(currentObjectId!, file.path!, newName);
      if (newManifestCid && newManifest) {
        dispatch(setManifest(newManifest));
        dispatch(setManifestCid(newManifestCid));
        dispatch(fetchTreeThunk());
        close();
      }
    } catch (e: any) {
      console.error(
        "[DATA::RENAME] Failed to rename, error: ",
        e,
        "file: ",
        file
      );
      if (component) {
        dispatch(setManifest(snapshotManifest!));
        dispatch(setManifestCid(snapshotManifestCid));
      }
      dispatch(fetchTreeThunk());
      close();
    }
  };

  const close = () => dispatch(setFileBeingRenamed(null));
  return (
    <Modal onDismiss={close} isOpen>
      <div className="py-3 px-6 !min-h-[70px] min-w-[400px]">
        <Modal.Header onDismiss={close} title={`Rename File`} />
        <div className="my-2">
          <InsetLabelInput
            label={`File Name`}
            value={newName}
            onChange={(e: any) => setNewName(e.target.value)}
            mandatory={true}
          />
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton onClick={handleSubmit}>
          {loading ? <DefaultSpinner color="black" size={24} /> : "Save"}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};

export default RenameDataModal;
