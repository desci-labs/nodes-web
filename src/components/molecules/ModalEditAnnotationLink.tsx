import PopOver from "@src/components/organisms/PopOver";
import PopOverBasic from "@src/components/atoms/PopOverBasic";
import Modal from "./Modal/Modal";
import InsetLabelInput from "./FormInputs/InsetLabelInput";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import { Switch } from "@headlessui/react";
import ToggleSwitch from "@src/components/atoms/ToggleSwitch";
import ToggleSwitchWithLabel from "@src/components/atoms/ToggleSwitchWithLabel";
import { AnnotationLinkConfig } from "./AnnotationEditor/components";
import { useEffect, useState } from "react";

interface ModalEditAnnotationLinkProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  fileName: string;
  annotationLinkConfig: AnnotationLinkConfig;
  setAnnotationLinkConfig: (annotationLinkConfig: AnnotationLinkConfig) => void;
  href: string;
  setHref: (href: string) => void;
}

const outputAnnotationLink = (config: AnnotationLinkConfig) => {
  const { url, isExecutable, extraPath, lineNumber } = config;
  const params = [
    isExecutable ? `isExecutable=${isExecutable}` : undefined,
    extraPath ? `extraPath=${extraPath}` : undefined,
    lineNumber ? `lineNumber=${lineNumber}` : undefined,
  ]
    .filter((x) => x)
    .join("&");
  return `${[url, params].filter(Boolean).join("?")}`;
};

const ModalEditAnnotationLink = ({
  showModal,
  setShowModal,
  fileName,
  annotationLinkConfig,
  setAnnotationLinkConfig,
  setHref,
  href,
}: ModalEditAnnotationLinkProps) => {
  const { url, extraPath, lineNumber, isExecutable } = annotationLinkConfig;
  const [newConfig, setNewConfig] = useState<AnnotationLinkConfig>({
    url,
    isExecutable,
    extraPath,
    lineNumber,
  });
  useEffect(() => {
    setNewConfig({ url, isExecutable, extraPath, lineNumber });
  }, [url, extraPath, lineNumber, isExecutable, annotationLinkConfig]);

  const save = () => {
    const link = outputAnnotationLink(newConfig);
    setHref(link);
    setShowModal(false);
  };

  return (
    <Modal
      isOpen={showModal}
      onDismiss={() => {
        setShowModal(false);
        setNewConfig({ url, isExecutable, extraPath, lineNumber });
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
            value={`${newConfig.extraPath || ""}`}
            onChange={(e) => {
              setNewConfig({
                ...newConfig,
                extraPath: (e.target as any).value,
              });
            }}
            mandatory={false}
          />
          <InsetLabelInput
            label={`Line/Cell Number`}
            value={`${newConfig.lineNumber || ""}`}
            onChange={(e) => {
              setNewConfig({
                ...newConfig,
                lineNumber: parseInt((e.target as any).value),
              });
            }}
            mandatory={false}
          />
          {/* <ToggleSwitchWithLabel
            isEnabled={newConfig.isExecutable}
            setEnabled={() =>
              setNewConfig({
                ...newConfig,
                isExecutable: !newConfig.isExecutable,
              })
            }
          >
            Run as Executable Jupyter Notebook
          </ToggleSwitchWithLabel> */}
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton onClick={save}>
          {false ? <DefaultSpinner color="black" size={24} /> : "Save"}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditAnnotationLink;
