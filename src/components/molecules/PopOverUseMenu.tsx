import CopyBox from "@components/atoms/CopyBox";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconWarning, IconX } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import PopoverFooter from "./Footer";
import Modal from "./Modal/Modal";

const PopOverUseMenu = () => {
  const { useMenuCids, setUseMenuCids } = useManuscriptController([
    "useMenuCids",
  ]);
  const { manifest: manifestData } = useNodeReader();

  function close() {
    setUseMenuCids([]);
  }

  const isDpidSupported = !!manifestData?.dpid;

  return (
    <Modal
      isOpen={!!useMenuCids.length}
      onDismiss={() => {
        close();
      }}
      $maxWidth={600}
    >
      <div className="px-6 py-5 text-white relative">
        <div className="flex flex-row justify-between items-center ">
          <div className="">
            <p className="text-xl font-bold">Content Identifier</p>
            <p className="text-neutrals-gray-5 text-sm">
              Copy the CID (Content Identifier) link, which represents this file
              on the IPFS network. Use the CID for compute over data (COD)
              functionalities
            </p>
          </div>
          <div
            className="cursor-pointer p-5 absolute right-1 top-1 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
            onClick={close}
          >
            <IconX />
          </div>
        </div>
        <section id="cid-use">
          <CopyBox
            className="mt-8 w-full"
            title="CID"
            copyText={`https://ipfs.desci.com/ipfs/${useMenuCids[0]}`}
          >
            <>
              {/* https://ipfs.desci.com/ipfs/ <br /> */}
              {useMenuCids[0]}
            </>
          </CopyBox>
          <div className="flex justify-center my-8">
            <PrimaryButton
              className="flex items-center gap-2"
              onClick={() =>
                window.open(
                  "https://docs.bacalhau.org/getting-started/installation",
                  "_blank"
                )
              }
            >
              <div className="">
                <svg
                  width="22.27"
                  height="10"
                  viewBox="0 0 69 31"
                  fill="black"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 13.0767L1.61769 15.4062L0.0240847 17.7745L18.8476 30.4404H31.0934V0H18.8329L0 13.0767ZM27.1461 3.94588V26.4945H20.0505L3.56855 15.4035L20.0666 3.94588H27.1461Z"
                    fill="#0"
                  />
                  <path
                    d="M18.4798 14.8041C20.0707 14.8041 21.3646 13.5102 21.3646 11.9193C21.3646 10.3283 20.0707 9.03445 18.4798 9.03445C16.8889 9.03445 15.595 10.3283 15.595 11.9193C15.595 13.5102 16.8889 14.8041 18.4798 14.8041ZM18.4798 11.0081C18.9829 11.0081 19.391 11.4175 19.391 11.9193C19.391 12.421 18.9815 12.8305 18.4798 12.8305C17.978 12.8305 17.5686 12.421 17.5686 11.9193C17.5686 11.4175 17.978 11.0081 18.4798 11.0081Z"
                    fill="#0"
                  />
                  <path d="M42.246 0H36.3091V30.4404H42.246V0Z" fill="#000" />
                  <path
                    d="M47.6887 4.69116V25.7492H53.6256V4.69116H50.6565H47.6887Z"
                    fill="#0"
                  />
                  <path
                    d="M69.0001 3.34376L66.241 2.24924L63.482 1.15472L57.9077 15.2055L57.9452 15.2202L57.9077 15.2349L63.482 29.2857L69.0001 27.0966L64.2888 15.2202L69.0001 3.34376Z"
                    fill="#0"
                  />
                </svg>
              </div>
              Run Compute Jobs Over This Data
            </PrimaryButton>
          </div>
          {!isDpidSupported && (
            <div className="text-neutrals-gray-7 text-sm border-yellow-300 gap-4 bg-neutrals-gray-3 p-4 rounded-md flex flex-row items-center">
              <IconWarning height={16} /> This node version has no dPID. A dPID
              is assigned upon publishing.
              <br />
              Data will not be available until node is published.
            </div>
          )}
        </section>
      </div>
      <PopoverFooter>
        <PrimaryButton onClick={close}>Done</PrimaryButton>
      </PopoverFooter>
    </Modal>
  );
};

export default PopOverUseMenu;
