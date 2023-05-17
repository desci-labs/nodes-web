import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import InsetLabelInput from "@src/components/molecules/FormInputs/InsetLabelInput";
import Modal from "@src/components/molecules/Modal";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  updateComponent,
  saveManifestDraft,
  setManifest,
  setManifestCid,
} from "@src/state/nodes/nodeReader";
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
import { useDrive } from "@src/state/drive/hooks";
import ToggleSwitch from "@src/components/atoms/ToggleSwitch";

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
  const { currentDrive } = useDrive();
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [renameComponentCard, setRenameComponentCard] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewName(file.name);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    if (currentDrive?.contains!.some((f) => f.name === newName)) {
      setError("File with this name already exists in current directory");
      setLoading(false);
      return;
    }

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
      return;
    }

    const snapshotManifest = { ...manifestData! };
    const snapshotManifestCid = manifestCid;
    const component = manifestData?.components?.find(
      (c) => c.payload?.path === file.path
    );
    try {
      const { manifestCid: newManifestCid, manifest: newManifest } =
        await renameData(
          currentObjectId!,
          file.path!,
          newName,
          renameComponentCard
        );
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
      <div className="py-3 px-6 !min-h-[70px] min-w-[400px] text-white">
        <Modal.Header onDismiss={close} title={`Rename File`} />
        <div className="my-3">
          <InsetLabelInput
            label={`File Name`}
            value={newName}
            onChange={(e: any) => setNewName(e.target.value)}
            mandatory={true}
          />
        </div>
        {file.starred &&
          file.componentType !== ResearchObjectComponentType.LINK && (
            <div className="flex items-center gap-2">
              <ToggleSwitch
                isEnabled={() => renameComponentCard}
                toggle={() => setRenameComponentCard(!renameComponentCard)}
              />
              <span className="text-sm">
                Rename component card in navigate panel?
              </span>
            </div>
          )}

        <p className="text-rose-400 text-xs mt-2">{error}</p>
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
