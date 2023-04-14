import CopyBox, { CodeBox } from "@components/atoms/CopyBox";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconWarning } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import WarningSign from "@src/components/atoms/warning-sign";
import DividerSimple from "@src/components/atoms/DividerSimple";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import {
  DriveNonComponentTypes,
  DriveObject,
  FileType,
  oldComponentMetadata,
} from "@src/components/organisms/Drive";
import useComponentDpid from "@src/components/organisms/Drive/hooks/useComponentDpid";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import useActionHandler from "@src/components/organisms/Drive/ContextMenu/useActionHandler";
import { useRef, useState } from "react";
import {
  findRootComponentCid,
  isRootComponentDrive,
} from "@src/components/driveUtils";
import {
  DatasetMetadataInfo,
  MetaStaging,
} from "@components/organisms/PaneDrive";
interface UseModalProps {
  datasetMetadataInfoRef: React.MutableRefObject<DatasetMetadataInfo>;
  setOldComponentMetadata: (
    value: React.SetStateAction<oldComponentMetadata | null>
  ) => void;
  setMetaStaging: React.Dispatch<React.SetStateAction<MetaStaging[]>>;
  isMultiselecting: boolean;
  setShowEditMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  componentToUse: DriveObject;
  index: number;
  selectedFiles: Record<
    number,
    ResearchObjectComponentType | DriveNonComponentTypes
  >;
}

const ComponentUseModal = ({
  index,
  setOldComponentMetadata,
  isMultiselecting,
  datasetMetadataInfoRef,
  setMetaStaging,
  setShowEditMetadata,
  componentToUse,
  selectedFiles,
  ...restProps
}: ModalProps & UseModalProps) => {
  const { setComponentToUse } = useManuscriptController(["componentToUse"]);
  const { manifest: manifestData } = useNodeReader();
  const { dpid, fqi, license } = useComponentDpid(componentToUse!);
  const handler = useActionHandler();

  const file = componentToUse;

  const handleEditMetadata = () => {
    // debugger;
    if (!file) return;

    if (file.componentType !== ResearchObjectComponentType.DATA) {
      const component = manifestData?.components.find(
        (c: ResearchObjectV1Component) => c.id === file.cid
      );
      if (!component) return;
      setOldComponentMetadata({
        componentId: component.id,
        cb: () => {
          const { keywords, description, licenseType } = component.payload;

          const newMetadata = { keywords, description, licenseType };
          file.metadata = newMetadata;
        },
      });
    }

    if (file.componentType === ResearchObjectComponentType.DATA) {
      // debugger;
      if (!isMultiselecting)
        setMetaStaging([
          {
            file: file,
            index: index,
          },
        ]);

      if (isMultiselecting) {
        datasetMetadataInfoRef.current.prepopulateFromName = file.name;
        const staging = Object.keys(selectedFiles).map((fileIndex: string) => {
          const parentDriveObj = file.parent;
          const selectedFile = parentDriveObj?.contains![
            parseInt(fileIndex)
          ] as DriveObject;
          return {
            file: selectedFile!,
          };
        });
        setMetaStaging(staging);
      }

      //dag file/dir (submetadata)
      if (!isRootComponentDrive(file)) {
        const rootCid = findRootComponentCid(file);
        if (rootCid) datasetMetadataInfoRef.current.rootCid = rootCid;
      }
      datasetMetadataInfoRef.current.prepopulateMetadata = file.metadata;

      if (setShowEditMetadata) setShowEditMetadata(true);
    }
  };

  function close() {
    setComponentToUse(null);
    restProps?.onDismiss?.();
  }

  const isDpidSupported = !!manifestData?.dpid;

  const pythonImport = componentToUse
    ? `with desci.fetch([('${componentToUse.name}.py', '${componentToUse.name}')], "${fqi}"):`
    : "";

  const canPreview =
    componentToUse &&
    ResearchObjectComponentType.CODE ===
      (componentToUse.componentType as ResearchObjectComponentType);

  return (
    <Modal
      {...restProps}
      onDismiss={() => {
        close();
      }}
      $scrollOverlay={true}
    >
      <div className="px-6 py-5 text-white relative lg:max-w-[90vw]">
        <Modal.Header
          title="Interact with Node using dPID"
          subTitle="You can use the granular dPID of the file you have selected interact with the associated data."
          onDismiss={close}
        />
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 place-content-center lg:justify-items-center gap-4 justify-items-center mt-8 overflow-hidden overflow-x-auto">
          <section className="hidden lg:block w-full">
            <VideoAnimation />{" "}
          </section>
          <section id="cid-use" className="max-w-[600px]">
            <div className="lg:hidden">
              <CodeBox
                title="License Type"
                label="Edit Metadata"
                className="my-6 w-full overflow-hidden pr-2"
                onHandleClick={handleEditMetadata}
              >
                <>{license}</>
              </CodeBox>
              <DividerSimple />
            </div>
            <div className="mt-6">
              <h1 className="font-bold">Use Edge Compute</h1>
              <span className="text-neutrals-gray-4">
                Copy the dPID to run compute jobs without moving the data using
                Bacalhau.{" "}
                <a
                  className="text-tint-primary hover:text-tint-primary-hover"
                  href="https://docs.bacalhau.org/getting-started/installation"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Bacalhau documentation.
                </a>
              </span>
              <CopyBox
                title="dPID"
                copyButtonText="Copy dPID"
                className="my-6 w-full overflow-hidden pr-2"
                copyText={dpid}
              >
                <>{dpid}</>
              </CopyBox>
              <DividerSimple />
            </div>
            <div className="my-6">
              <h1 className="font-bold">Import Locally</h1>
              <span className="text-neutrals-gray-4">
                Copy the syntax below to import the selected file via DeSci
                Fetch.{" "}
                <a
                  className="text-tint-primary hover:text-tint-primary-hover"
                  href="https://docs.bacalhau.org/getting-started/installation"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn More
                </a>
              </span>
              <CopyBox
                title="Python syntax"
                copyButtonText="Copy Syntax"
                className="my-6 w-full overflow-hidden pr-2"
                copyText={pythonImport}
              >
                <>{pythonImport}</>
              </CopyBox>
              <DividerSimple />
            </div>
            <div className="my-6">
              <h2>Preview in Nodes IDE</h2>
              <span className="text-neutrals-gray-4">
                View data and run compute directly in Nodes IDE.
              </span>
              <div className="w-full flex items-center justify-center lg:justify-start">
                <ButtonSecondary
                  disabled={!canPreview}
                  className="mt-4 lg:w-full text-center"
                  onClick={() => {
                    const c =
                      componentToUse?.type === FileType.File
                        ? componentToUse
                        : componentToUse?.contains?.find(
                            (c) => c.type === FileType.File
                          );
                    handler["PREVIEW"]?.(c!);
                    close();
                  }}
                >
                  Preview in Nodes IDE
                </ButtonSecondary>
              </div>
            </div>
            {!isDpidSupported && (
              <div className="text-neutrals-gray-7 text-sm border-yellow-300 gap-4 bg-neutrals-gray-3 p-4 rounded-md flex flex-row items-center">
                <IconWarning height={16} /> This Node version has no dPID. A
                dPID is assigned upon publishing.
                <br />
                Data will not be available until Node is published.
              </div>
            )}
          </section>
        </div>
      </div>
      <Modal.Footer>
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col text-white">
            <div className="flex gap-2 items-center">
              <WarningSign width={25} />{" "}
              <span className="text-sm">
                These content identifiers refer to the latest committed Node
                state. Uncommitted files are not included.
              </span>
            </div>
            <span className="text-sm gap-2 hidden lg:flex">
              <span className="inline-block">
                License Type: <b>{license}</b>{" "}
              </span>
              <button
                className="text-tint-primary hover:text-tint-primary-hover"
                onClick={handleEditMetadata}
              >
                Edit Metadata
              </button>
            </span>
          </div>
          <PrimaryButton onClick={close}>Done</PrimaryButton>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

const VideoAnimation = () => {
  const refVideo = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const borderRadius = "72%";

  return (
    <div
      className={`overflow-hidden relative min-w-[300px] h-full flex items-center justify-center`}
    >
      <div
        className="w-full h-full p-8 relative"
        style={{
          borderRadius,
          width: "400px",
          overflow: "hidden",
          border: "none",
          boxShadow: "0em 0em 3em 15px rgba(0, 0, 0, .5)",
          maxHeight: "91%",
        }}
      >
        <div
          className="absolute top-0 left-0 bg-transparent z-50"
          style={{
            borderRadius,
            width: "100%",
            height: "100%",
            boxShadow: "inset 0em 0em 40px 35px rgba(0, 0, 0, .3)",
          }}
        ></div>
        <img
          src="https://desci-labs-public.s3.amazonaws.com/node-front-preview.png"
          alt="desci nodes use animation poster"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius,
            transform: "scale(1.5)",
            visibility: !loaded ? "visible" : "hidden",
          }}
        />
        <video
          loop
          ref={refVideo}
          onLoadedData={(e) => {
            setLoaded(true);
          }}
          playsInline
          autoPlay
          key={`cube-panel`}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius,
            transform: "scale(1.5)",
            visibility: loaded ? "visible" : "hidden",
          }}
          src={`https://desci-labs-public.s3.amazonaws.com/node-front.mp4`}
          preload="metadata"
          poster="https://desci-labs-public.s3.amazonaws.com/node-front-preview.png"
        >
          <source
            src="https://desci-labs-public.s3.amazonaws.com/node-front.mp4#t=0.1"
            type="video/mp4"
          />
        </video>
      </div>
    </div>
  );
};
export default ComponentUseModal;
