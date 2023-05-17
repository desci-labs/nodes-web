import ButtonSecondary from "@components/atoms/ButtonSecondary";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ClassNameProp } from "nodesTypes";
import DataUsage from "./DataUsage";
import {
  getNonDataComponentsFromManifest,
  getStarredNonDataComponentsFromManifest,
} from "../utils";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/nodeReader";
import React, { HTMLProps, useState } from "react";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";

export const DriveToggleButton = (props: HTMLProps<HTMLButtonElement>) => {
  const { setIsAddingComponent } = useManuscriptController();
  const dispatch = useSetter();
  const { componentStack, manifest: manifestData } = useNodeReader();
  const [lastComponentStack, setLastComponentStack] = useState<
    ResearchObjectV1Component[]
  >([]);

  const shouldShowDrive = componentStack.length;
  const firstStarredPdf = manifestData
    ? getStarredNonDataComponentsFromManifest(manifestData)
    : [];
  const nonDataComponents = manifestData
    ? firstStarredPdf
      ? firstStarredPdf
      : getNonDataComponentsFromManifest(manifestData)
    : [];

  const defaultClick = () => {
    if (shouldShowDrive) {
      setLastComponentStack(componentStack);
      dispatch(setComponentStack([]));
    } else {
      const firstComponent =
        lastComponentStack && lastComponentStack.length
          ? lastComponentStack[lastComponentStack.length - 1]
          : nonDataComponents[0]!;

      if (!firstComponent) {
        setIsAddingComponent(true);
      } else {
        dispatch(setComponentStack([firstComponent]));
      }
    }
  };
  return (
    <ButtonSecondary onClick={props.onClick ?? defaultClick} className="w-full">
      {shouldShowDrive ? "View Node Drive" : "Hide Node Drive"}
    </ButtonSecondary>
  );
};

const NodeDrive = ({ className }: ClassNameProp) => {
  return (
    <div className={`px-4 mb-4 ${className}`}>
      <div
        className={`border-[1px] bg-white border-zinc-400 dark:border-muted-900 dark:bg-muted-500 rounded-lg w-full text-sm font-bold py-4 gap-2 flex flex-col overflow-visible`}
      >
        <div className="px-4 pb-2 border-neutrals-black flex flex-col gap-2">
          <DataUsage />
          <p className="text-[10px] inline-block font-light text-neutrals-gray-5 leading-3">
            Your private drive space is freed when you publish
          </p>
        </div>
        <div className="px-4 pt-4 border-t dark:border-muted-900">
          <DriveToggleButton />
        </div>
      </div>
    </div>
  );
};

export default React.memo(NodeDrive);
