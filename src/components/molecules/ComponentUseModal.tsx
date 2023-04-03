import CopyBox from "@components/atoms/CopyBox";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconWarning } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import WarningSign from "@src/components/atoms/warning-sign";
import DividerSimple from "@src/components/atoms/DividerSimple";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import { DriveObject } from "../organisms/Drive";
import useComponentDpid from "../organisms/Drive/hooks/useComponentDpid";

const ComponentUseModal = (
  props: ModalProps & { componentToUse: DriveObject }
) => {
  const { componentToUse, setComponentToUse } = useManuscriptController([
    "componentToUse",
  ]);
  const { manifest: manifestData } = useNodeReader();
  const { dpid, fqi } = useComponentDpid(componentToUse!);

  function close() {
    setComponentToUse(null);
  }

  const isDpidSupported = !!manifestData?.dpid;

  const pythonImport = componentToUse
    ? `with desci.fetch([('${componentToUse.name}.py', '${componentToUse.name}')], "${fqi}"):`
    : "";

  return (
    <Modal
      {...props}
      onDismiss={() => {
        close();
      }}
      $scrollOverlay={true}
    >
      <div className="px-6 py-5 text-white relative max-w-[90vw]">
        <Modal.Header
          title="Interact with Node using dPID"
          subTitle="You can use the granular dPID of the file you have selected interact with the associated data."
          onDismiss={close}
        />
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 place-content-center lg:justify-items-start justify-items-center mt-8 overflow-hidden overflow-x-scroll">
          <section className="hidden lg:block"> video section</section>
          <section id="cid-use" className="max-w-[600px]">
            <div>
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
                title="dPid"
                copyButtonText="Copy dPID"
                className="my-8 w-full overflow-hidden pr-2"
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
                className="my-8 w-full overflow-hidden pr-2"
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
              <ButtonSecondary className="mt-4 w-full">
                Preview in Nodes IDE
              </ButtonSecondary>
            </div>
            {!isDpidSupported && (
              <div className="text-neutrals-gray-7 text-sm border-yellow-300 gap-4 bg-neutrals-gray-3 p-4 rounded-md flex flex-row items-center">
                <IconWarning height={16} /> This node version has no dPID. A
                dPID is assigned upon publishing.
                <br />
                Data will not be available until node is published.
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
                These content identifiers refer to the latest committed node
                state. Uncommitted files are not included.
              </span>
            </div>
            <span className="text-sm flex gap-2">
              <span className="inline-block">License Type: CCO </span>
              <button className="text-tint-primary">Edit Metadata</button>
            </span>
          </div>
          <PrimaryButton onClick={close}>Done</PrimaryButton>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ComponentUseModal;
