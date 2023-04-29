import { FlexRowSpaceBetween } from "@components/styled";
import styled from "styled-components";
import { useState } from "react";
import PrimaryButton from "@components/atoms/PrimaryButton";
import ReactDiffViewer from "react-diff-viewer";
import { SpinnerCircular } from "spinners-react";
import DiffWindow from "../DiffWindow";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { SearchIcon } from "@heroicons/react/solid";
import useNodeDiff from "./useNodeDiff";
import { useNodeReader } from "@src/state/nodes/hooks";
import Modal from "@src/components/molecules/Modal";

const ChangeNameTitle = styled.p.attrs({
  className: `text-xs`,
})``;

interface ChangesComponentProps {
  className?: string;
}

const NodeChanges = (props: ChangesComponentProps) => {
  const { manifest: manifestData } = useNodeReader();
  const { changes, isLoading, diff, diffRoot } = useNodeDiff();
  const [selectedDiff, setSelectedDiff] = useState<number>(-1);
  const [viewDiff, setViewDiff] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  return (
    <div className={props.className}>
      <CollapsibleSection
        startExpanded={false}
        className="bg-transparent dark:bg-transparent border-0 dark:border-transparent border-b-none rounded-none"
        headerClass="bg-neutrals-black dark:bg-neutrals-black"
        title={
          <span>
            Changes{" "}
            {!isLoading ? (
              <pre className="inline font-normal text-xs text-gray-300">
                ({changes.length})
              </pre>
            ) : (
              <SpinnerCircular
                size={10}
                className="ml-2 inline"
                color="white"
                secondaryColor="transparent"
              />
            )}
          </span>
        }
      >
        <div className="overflow-hidden pb-4">
          {!isLoading ? (
            <div>
              {changes.map((item: any, index: number) => (
                <FlexRowSpaceBetween
                  key={`change_${item}-${Math.random()}`}
                  className="mt-2 py-2 cursor-pointer group hover:text-tint-primary-dark font-bold"
                  onClick={() => setSelectedDiff(index)}
                >
                  <ChangeNameTitle>{item}</ChangeNameTitle>
                  <SearchIcon width={20} />
                  {/* <AddedText /> */}
                </FlexRowSpaceBetween>
              ))}
              <div className="top-2 relative select-none cursor-pointer">
                <div
                  className="text-right text-xs cursor-pointer text-gray-400 hover:text-gray-300 font-inter"
                  onClick={() => setAdvanced(!advanced)}
                >
                  Advanced Options
                </div>

                <div
                  className={`text-xs overflow-hidden transition-all cursor-pointer text-gray-400 hover:text-gray-300 font-inter ${
                    advanced ? "h-4" : "h-0"
                  }`}
                  onClick={() => setViewDiff(true)}
                >
                  View Diff
                </div>
              </div>
            </div>
          ) : (
            <div className="flex mt-4 text-xs justify-between gap-3 mb-2">
              <SpinnerCircular
                size={20}
                color="white"
                secondaryColor="transparent"
              />{" "}
              Loading recently published version to compare changes
            </div>
          )}
        </div>
      </CollapsibleSection>
      <Modal
        $minHeight={20}
        $scrollOverlay={true}
        isOpen={viewDiff}
        onDismiss={() => setViewDiff(false)}
      >
        <Modal.Header onDismiss={() => setViewDiff(false)} />
        <div className="text-[10px] leading-3">
          <ReactDiffViewer
            useDarkTheme={true}
            oldValue={JSON.stringify(diffRoot, null, 2)}
            newValue={JSON.stringify(Object.assign({}, manifestData), null, 2)}
            splitView={true}
          />
        </div>
      </Modal>
      <Modal
        isOpen={selectedDiff > -1 && !!diff}
        onDismiss={() => setSelectedDiff(-1)}
      >
        <div className="p-4 text-white">
          <Modal.Header
            title="Diff Viewer"
            onDismiss={() => setSelectedDiff(-1)}
          />
          <DiffWindow diff={diff && diff[selectedDiff]} />
        </div>
        <Modal.Footer>
          <PrimaryButton
            disabled={false}
            className={`w-[140px] flex justify-center`}
            onClick={() => setSelectedDiff(-1)}
          >
            Done
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NodeChanges;
