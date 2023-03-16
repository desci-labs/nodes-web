import { FlexRowSpaceBetween } from "@components/styled";
import styled from "styled-components";
import { useState } from "react";
import PopOver from "@components/organisms/PopOver";
import PrimaryButton from "@components/atoms/PrimaryButton";
import { IconX } from "@icons";
import ReactDiffViewer from "react-diff-viewer";
import { SpinnerCircular } from "spinners-react";
import DiffWindow from "../DiffWindow";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { SearchIcon } from "@heroicons/react/solid";
import useNodeDiff from "./useNodeDiff";
import { useNodeReader } from "@src/state/nodes/hooks";

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
      <PopOver
        className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900 "
        containerStyle={{
          backgroundColor: "#3A3A3ABF",
        }}
        footer={() => <></>}
        onClose={() => setViewDiff(false)}
        isVisible={viewDiff}
        style={{ marginLeft: 0, marginRight: 0, width: 720 }}
      >
        <div className="text-[10px] leading-3">
          <div className="flex flex-row justify-end items-center">
            <IconX
              fill="white"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => {
                setViewDiff(false);
              }}
            />
          </div>
          <ReactDiffViewer
            useDarkTheme={true}
            oldValue={JSON.stringify(diffRoot, null, 2)}
            newValue={JSON.stringify(Object.assign({}, manifestData), null, 2)}
            splitView={true}
          />
        </div>
      </PopOver>
      {selectedDiff > -1 && diff ? (
        <PopOver
          isVisible={true}
          containerStyle={{
            backgroundColor: "#3A3A3ABF",
          }}
          footer={() => (
            <div
              className={`mt-10 flex flex-row justify-end items-center h-16 w-full dark:bg-[#272727] border-t border-t-[#81C3C8] rounded-b-lg p-4`}
            >
              <PrimaryButton
                disabled={false}
                className={`w-[140px] flex justify-center`}
                onClick={() => setSelectedDiff(-1)}
              >
                Done
              </PrimaryButton>
            </div>
          )}
          className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900"
          style={{ marginLeft: 0, marginRight: 0, width: 720 }}
        >
          <div className="p-4">
            <div className="flex flex-row justify-end items-center">
              <IconX
                fill="white"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedDiff(-1);
                }}
              />
            </div>
            <h1 className="text-lg font-bold mb-10 -mt-5">Diff Viewer</h1>
            <DiffWindow diff={diff[selectedDiff]} />
          </div>
        </PopOver>
      ) : null}
    </div>
  );
};

export default NodeChanges;
