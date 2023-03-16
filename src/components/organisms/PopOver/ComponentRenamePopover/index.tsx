import PrimaryButton from "@components/atoms/PrimaryButton";
import PopoverFooter from "@components/molecules/Footer";
import InsetLabelInput from "@components/molecules/FormInputs/InsetLabelInput";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconX } from "@icons";
import React, { useEffect, useState } from "react";
import PopOver from "../.";
import useSaveManifest from "@src/hooks/useSaveManifest";
import { useNodeReader } from "@src/state/nodes/hooks";

const ComponentRenamePopover = (props: any) => {
  const { manifest: manifestData } = useNodeReader();
  const { saveManifest, isSaving } = useSaveManifest();

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
    } else {
      console.log("data component");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeName = () => {
    const manifestDataCopy = Object.assign({}, manifestData);
    if (manifestDataCopy) {
      const index = manifestDataCopy.components.findIndex(
        (c) => c.id === props.componentId
      );
      if (index > -1) {
        manifestDataCopy.components[index].name = componentName;
      }
      saveManifest(manifestDataCopy, props.onClose);
    }
    // props.onClose();
  };

  return (
    <PopOver
      {...props}
      style={{
        width: 375,
        maxWidth: "100%",
        margin: "3rem 0.75rem",
        overflow: "visible",
      }}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      displayCloseIcon={true}
      className="rounded-lg bg-zinc-100 dark:bg-zinc-900"
    >
      <div className="px-6 py-5">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl font-bold">Rename Component</div>
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
          disabled={isSaving}
          onClick={() => {
            handleChangeName();
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </PrimaryButton>
      </PopoverFooter>
    </PopOver>
  );
};

export default ComponentRenamePopover;
