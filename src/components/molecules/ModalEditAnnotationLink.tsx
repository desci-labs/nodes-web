import PopOver from "@src/components/organisms/PopOver";
import PopOverBasic from "@src/components/atoms/PopOverBasic";
import Modal from "./Modal/Modal";
import InsetLabelInput from "./FormInputs/InsetLabelInput";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import { Switch } from "@headlessui/react";
import ToggleSwitch from "@src/components/atoms/ToggleSwitch";
import ToggleSwitchWithLabel from "@src/components/atoms/ToggleSwitchWithLabel";

interface ModalEditAnnotationLinkProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  fileName: string;
  setIsExecutable: (isExecutable: boolean) => void;
  isExecutable: boolean;
}

const ModalEditAnnotationLink = ({
  showModal,
  setShowModal,
  fileName,
  setIsExecutable,
  isExecutable,
}: ModalEditAnnotationLinkProps) => {
  return (
    <Modal
      isOpen={showModal}
      onDismiss={() => {
        setShowModal(false);
      }}
    >
      <div className="py-3 px-6 !min-h-[70px] min-w-[400px]">
        <Modal.Header
          onDismiss={() => setShowModal(false)}
          title={`Edit Annotation Link`}
        />
        <div className="my-2 flex flex-col gap-4">
          <div className="text-white flex gap-2 text-xs text-center mt-2">
            Link to
            <span className="bg-gray-300 text-black rounded-md px-1 py-0.5">
              {fileName}
            </span>
          </div>
          <InsetLabelInput
            label={`File Path`}
            value={""}
            onChange={(e: any) => "setNewName(e.target.value)"}
            mandatory={false}
          />
          <InsetLabelInput
            label={`Line Number`}
            value={""}
            onChange={(e: any) => "setNewName(e.target.value)"}
            mandatory={false}
          />
          <ToggleSwitchWithLabel
            isEnabled={isExecutable}
            setIsEnabled={setIsExecutable}
          >
            Run as Executable Jupyter Notebook
          </ToggleSwitchWithLabel>
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton onClick={() => {}}>
          {false ? <DefaultSpinner color="black" size={24} /> : "Save"}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditAnnotationLink;
