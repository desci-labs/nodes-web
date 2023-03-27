import PrimaryButton from "@components/atoms/PrimaryButton";
import PopoverFooter from "@components/molecules/Footer";
import InsetLabelInput from "@components/molecules/FormInputs/InsetLabelInput";
import { IconX } from "@icons";
import { useEffect, useState } from "react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  ManifestDataStatus,
  saveManifestDraft,
  updateComponent,
} from "@src/state/nodes/viewer";
import Modal from "@src/components/molecules/Modal/Modal";

const ComponentRenamePopover = (props: {
  isVisible: boolean;
  onClose: () => void;
  componentId: string;
}) => {
  const { manifest: manifestData, manifestStatus } = useNodeReader();
  const dispatch = useSetter();

  const [componentName, setComponentName] = useState<string>("");

  useEffect(() => {
    const index = manifestData!.components.findIndex(
      (c) => c.id === props.componentId
    );
    /**
     * extra protection because we can have a virtual component for data (see ManuscriptComponentsSection.tsx componentsWithOneData.push)
     */
    const component = manifestData?.components[index];
    if (component) {
      setComponentName(component.name!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeName = () => {
    if (manifestData) {
      const index = manifestData.components.findIndex(
        (c) => c.id === props.componentId
      );

      if (index > -1) {
        dispatch(
          updateComponent({
            index,
            update: { ...manifestData.components[index], name: componentName },
          })
        );
        dispatch(saveManifestDraft({}));
      }
    }
  };

  return (
    <Modal {...props} isOpen={props.isVisible} onDismiss={props?.onClose}>
      <div className="w-[400px]">
        <div className="px-6 py-5">
          <div className="flex flex-row justify-between items-center">
            <div className="text-2xl text-white font-bold">
              Rename Component
            </div>
            <IconX
              fill="white"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => {
                props.onClose();
              }}
            />
          </div>
          <div className="text-xs mt-6 text-neutrals-gray-5 mb-2">
            A short name for your component that best describes it.
          </div>
          <InsetLabelInput
            label="Component Name"
            className="mb-6"
            value={componentName}
            onChange={(e: any) => setComponentName(e.target.value)}
          />
        </div>
        <PopoverFooter>
          <PrimaryButton
            disabled={manifestStatus === ManifestDataStatus.Pending}
            onClick={() => {
              handleChangeName();
            }}
          >
            {manifestStatus === ManifestDataStatus.Pending
              ? "Saving..."
              : "Save Changes"}
          </PrimaryButton>
        </PopoverFooter>
      </div>
    </Modal>
  );
};

export default ComponentRenamePopover;
