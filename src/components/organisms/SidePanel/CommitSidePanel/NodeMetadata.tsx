import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { useNodeValidator } from "@src/hooks/useNodeValidator";
import { ComponentTodoItem } from "./TodoItem";
import { useNodeReader } from "@src/state/nodes/hooks";
import { showMetadataForComponent } from "@src/state/drive/driveSlice";
import { useDispatch } from "react-redux";

interface NodeMetadataProps {
  className?: string;
}

const NodeMetadata = (props: NodeMetadataProps) => {
  const { manifest: manifestData, mode, currentObjectId } = useNodeReader();
  const dispatch = useDispatch();
  const { nodeValidity: validationObj } = useNodeValidator();

  // one entry for each component, one entry for wallet, one entry for network
  const count = manifestData?.components.length || 0;

  return (
    <div className={props.className}>
      <CollapsibleSection
        startExpanded={true}
        className="bg-transparent dark:bg-transparent border-0 dark:border-transparent border-b-none rounded-none"
        headerClass="bg-neutrals-black dark:bg-neutrals-black"
        title={
          <span>
            Update Node Metadata{" "}
            <pre className="inline font-normal text-xs text-gray-300">
              ({count})
            </pre>
          </span>
        }
      >
        <div>
          {manifestData &&
            manifestData?.components
              .filter((a) => a.type != ResearchObjectComponentType.DATA_BUCKET)
              .map((component: ResearchObjectV1Component, idx) => (
                <ComponentTodoItem
                  onHandleSelect={() =>
                    dispatch(showMetadataForComponent(component))
                  }
                  currentObjectId={currentObjectId!}
                  manifestData={manifestData}
                  mode={mode}
                  key={idx}
                  component={component}
                  completed={validationObj.components[component.id]}
                />
              ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default NodeMetadata;
