import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PopOverBasic from "@src/components/atoms/PopOverBasic";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PopoverFooter from "@src/components/molecules/Footer";
import InsetLabelInput from "@src/components/molecules/FormInputs/InsetLabelInput";
import { useNodeReader } from "@src/state/nodes/hooks";
import { saveManifestDraft } from "@src/state/nodes/saveManifestDraft";
import { updateComponent } from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import React, { useEffect, useState } from "react";
import { DriveObject } from "./types";

interface RenameDataModalProps {
  renameComponentId: string | null;
  setRenameComponentId: React.Dispatch<React.SetStateAction<string | null>>;
  setDirectory: React.Dispatch<React.SetStateAction<DriveObject[]>>;
}

export function getComponentString(
  type: ResearchObjectComponentType | undefined
) {
  switch (type) {
    case ResearchObjectComponentType.PDF:
      return "Research Report";
    case ResearchObjectComponentType.DATA:
      return "Dataset";
    case ResearchObjectComponentType.CODE:
      return "Code Repo";
    default:
      return "Component";
  }
}

const RenameDataModal: React.FC<RenameDataModalProps> = ({
  renameComponentId,
  setRenameComponentId,
  setDirectory,
}) => {
  const dispatch = useSetter();
  const { manifest: manifestData } = useNodeReader();
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [compType, setCompType] = useState<
    ResearchObjectComponentType | undefined
  >();
  useEffect(() => {
    if (!manifestData || !renameComponentId) return;
    const comp = manifestData.components.find(
      (c) => c.id === renameComponentId
    );
    if (comp) {
      setCompType(comp.type);
      setNewName(comp.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renameComponentId]);

  const handleSubmit = async () => {
    setLoading(true);
    const manifestClone: ResearchObjectV1 = { ...manifestData! };
    const datasetIdx = manifestClone.components!.findIndex(
      (c) => c.id === renameComponentId
    );
    if (datasetIdx !== -1) {
      dispatch(
        updateComponent({
          index: datasetIdx,
          update: { ...manifestClone.components[datasetIdx], name: newName },
        })
      );
    }

    try {
      dispatch(
        saveManifestDraft({
          onSaveCallback: () => {
            setLoading(false);
            setDirectory((oldDir) => {
              let compCid = renameComponentId;
              const comp = manifestClone!.components![datasetIdx];
              if (comp.type === ResearchObjectComponentType.DATA) {
                //TODO: in the future a similar action as done in this block may be required for code components, or any component where cid !== id
                compCid = comp.payload.cid;
              }

              const driveObjIdx = oldDir.findIndex(
                (driveObj) => driveObj.cid === compCid
              );
              const newDir = [...oldDir];
              newDir[driveObjIdx].name = newName;
              return newDir;
            });
            setRenameComponentId(null);
          },
        })
      );
    } catch (e: any) {
      console.log(`[DRIVE] Failed to update dataset name, error: ${e}`);
    }
  };

  const componentString = getComponentString(compType);

  return (
    <div>
      <PopOverBasic
        bodyClassNames="!min-h-[70px]"
        onClose={() => {
          setRenameComponentId(null);
        }}
        title={`Rename ${componentString}`}
        isVisible={true}
        footer={() => (
          <PopoverFooter>
            <PrimaryButton onClick={handleSubmit}>
              {loading ? <DefaultSpinner color="black" size={24} /> : "Save"}
            </PrimaryButton>
          </PopoverFooter>
        )}
      >
        <InsetLabelInput
          label={`${componentString} Name`}
          value={newName}
          onChange={(e: any) => setNewName(e.target.value)}
          mandatory={true}
        />
      </PopOverBasic>
    </div>
  );
};

export default RenameDataModal;
