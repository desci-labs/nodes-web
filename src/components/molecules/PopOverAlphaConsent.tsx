import PrimaryButton from "@components/atoms/PrimaryButton";
import PopOver from "@components/organisms/PopOver";
import { useState } from "react";
import { useSetter } from "@src/store/accessors";
import { useNodeReader } from "@src/state/nodes/hooks";
import { setIsNew } from "@src/state/nodes/viewer";

const PopOverAlphaConsent = (props: any) => {
  const dispatch = useSetter();
  const { isNew } = useNodeReader();

  const onClose = () => {
    setConsented(true);
    localStorage.setItem("consented", "1");
    setTimeout(() => {
      dispatch(setIsNew(true));
    });
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    onClose();
  };

  // alpha test consent
  const [consented, setConsented] = useState(
    !!localStorage.getItem("consented")
  );

  return (
    <PopOver
      {...props}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      isVisible={isNew && !consented}
      onClose={onClose}
      displayCloseIcon={false}
      className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900"
    >
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5">
          <div className="flex flex-row justify-between items-center">
            <div className="text-lg font-bold text-white">
              DeSci Nodes Alpha {process.env.REACT_APP_VERSION}
            </div>
          </div>
          <div className="py-2 text-white dark:text-white">
            <div className="py-1 text-sm">
              <b>Welcome to the alpha release of DeSci Nodes</b>.
              <br />
              <br />
              The Composer is a browser-based interface to create research
              objects as connected knowledge-graphs.
              <br />
              <br />
              Important information:
              <ul>
                <li>
                  Data is stored on a private IPFS node separated from the IPFS
                  network.
                </li>
              </ul>
              <br />
              Supported formats:
              <ul>
                <li>Document uploads via PDF or DOI links are supported</li>
              </ul>
              <br />
              Release features:
              <ul>
                <li>Annotation editor (Markdown/Latex)</li>
                <li>Component navigation and basic editing</li>
              </ul>
              <br />
              Encouraged use-cases:
              <ul>
                <li>Use it to support your journal club</li>
                <li>Create your own knowledge-graph</li>
              </ul>
              <br />
              Our goals for the Alpha release is to gather feedback on UI/UX. We
              want the product to feel great and intuitive to work with. We will
              be steadily rolling out features over the summer.
            </div>
          </div>
        </div>

        <div
          className={`flex flex-row justify-end items-center h-16 w-full dark:bg-[#272727] border-t border-t-[#81C3C8] rounded-b-lg p-4`}
        >
          <PrimaryButton
            disabled={false}
            className={`w-[140px] flex justify-center`}
            type="submit"
          >
            I'm ready
          </PrimaryButton>
        </div>
      </form>
    </PopOver>
  );
};

export default PopOverAlphaConsent;
