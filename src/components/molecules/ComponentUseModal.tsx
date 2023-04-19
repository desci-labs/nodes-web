import CopyBox, { CodeBox } from "@components/atoms/CopyBox";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { IconWarning } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import WarningSign from "@src/components/atoms/warning-sign";
import DividerSimple from "@src/components/atoms/DividerSimple";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { DriveObject, FileType } from "@src/components/organisms/Drive";
import useComponentDpid from "@src/components/organisms/Drive/hooks/useComponentDpid";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import useActionHandler from "@src/components/organisms/Drive/ContextMenu/useActionHandler";
import { useEffect, useRef, useState } from "react";
import {
  setFileBeingUsed,
  setFileMetadataBeingEdited,
} from "@src/state/drive/driveSlice";
import { useSetter } from "@src/store/accessors";

interface ComponentUseModalProps {
  file: DriveObject;
}

const ComponentUseModal = ({
  file,
  ...restProps
}: ModalProps & ComponentUseModalProps) => {
  const { manifest: manifestData } = useNodeReader();
  const { dpid, fqi, license } = useComponentDpid(file);
  const handler = useActionHandler();
  const dispatch = useSetter();

  const handleEditMetadata = () => {
    dispatch(setFileMetadataBeingEdited(file!));
  };

  function close() {
    dispatch(setFileBeingUsed(null));
    restProps?.onDismiss?.();
  }

  const isDpidSupported = !!manifestData?.dpid;

  const pythonImport = file
    ? `with desci.fetch([('${file.name}.py', '${file.name}')], "${fqi}"):`
    : "";

  const canPreview =
    file &&
    ResearchObjectComponentType.CODE ===
      (file.componentType as ResearchObjectComponentType);

  return (
    <Modal
      {...restProps}
      onDismiss={() => {
        close();
      }}
      $scrollOverlay={true}
    >
      <div className="max-w-[1150px]">
        <div className="px-6 py-5 text-white relative lg:max-w-[90vw]">
          <Modal.Header
            title="Interact with Node using dPID"
            subTitle="You can use the granular dPID of the file you have selected interact with the associated data."
            onDismiss={close}
          />
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 place-content-center gap-4 justify-items-center mt-8 overflow-hidden overflow-x-auto">
            <section className="hidden max-h-[700px] lg:block max-w-[512px]">
              {/* Max height should roughly match the right side of this modal */}
              <VideoAnimation />
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
                  Copy the dPID to run compute jobs without moving the data
                  using Bacalhau.{" "}
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
                        file?.type === FileType.FILE
                          ? file
                          : file?.contains?.find(
                              (c) => c.type === FileType.FILE
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

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    });

    return () => setIsMounted(false);
  }, []);

  return (
    <div
      className={`overflow-hidden relative w-full h-full flex items-center justify-center  ${
        isMounted ? "!opacity-100" : "!opacity-0"
      }  transition-opacity delay-[0s] duration-[2s] ease-in`}
    >
      <div
        className="absolute top-0 w-full h-full left-0 z-50"
        style={{
          backgroundImage:
            "radial-gradient(50.00% 50.77% at 50% 50%, rgba(0, 0, 0, 0) 59.77%, rgb(25, 27, 28) 100%)",
        }}
      ></div>
      {/* This cover image needs replacement, flip the loaded booleans around to test */}
      <img
        src="https://desci-labs-public.s3.amazonaws.com/node-front-preview.png"
        alt="desci nodes use animation poster"
        className={`w-full h-full absolute top-0 left-0 object-cover`}
        style={{
          objectFit: "cover",
          // overflow: "hidden",
          visibility: !loaded ? "visible" : "hidden",
          width: 1920,
          height: 1080,
          top: -190,
          transform: "scale(0.825)",
          // transform: "scaleX(3.1) scaleY(0.83)",
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
        className="object-cover max-w-none max-h-[900px]"
        style={{
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
  );
};
export default ComponentUseModal;
