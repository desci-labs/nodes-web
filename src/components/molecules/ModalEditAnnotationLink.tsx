import PopOver from "@src/components/organisms/PopOver";
import PopOverBasic from "@src/components/atoms/PopOverBasic";
import Modal from "./Modal";
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
  const { url, exec, path, line } = config;
  const params = [
    exec ? `exec=${exec}` : undefined,
    path ? `path=${path}` : undefined,
    line ? `line=${line}` : undefined,
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
  const { url, path, line, exec } = annotationLinkConfig;
  const [newConfig, setNewConfig] = useState<AnnotationLinkConfig>({
    url,
    exec,
    path,
    line,
  });
  useEffect(() => {
    setNewConfig({ url, exec, path, line });
  }, [url, path, line, exec, annotationLinkConfig]);

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
        setNewConfig({ url, exec, path, line });
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
            value={`${newConfig.path || ""}`}
            onChange={(e) => {
              setNewConfig({
                ...newConfig,
                path: (e.target as any).value,
              });
            }}
            mandatory={false}
          />
          <InsetLabelInput
            label={`Line/Cell Number`}
            value={`${newConfig.line || ""}`}
            onChange={(e) => {
              setNewConfig({
                ...newConfig,
                line: parseInt((e.target as any).value),
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
