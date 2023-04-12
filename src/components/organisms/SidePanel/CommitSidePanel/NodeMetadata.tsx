import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { useState } from "react";
import ComponentMetadataPopover from "@components/organisms/PopOver/ComponentMetadataPopover";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { useNodeValidator } from "@src/hooks/useNodeValidator";
import { ComponentTodoItem } from "./TodoItem";
import { useNodeReader } from "@src/state/nodes/hooks";

interface NodeMetadataProps {
  className?: string;
}

const NodeMetadata = (props: NodeMetadataProps) => {
  const { manifest: manifestData, mode, currentObjectId } = useNodeReader();

  const { nodeValidity: validationObj } = useNodeValidator();
  const [selectedComponent, setSelectedComponent] =
    useState<ResearchObjectV1Component | null>(null);

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
            manifestData?.components.map(
              (component: ResearchObjectV1Component, idx) => (
                <ComponentTodoItem
                  onHandleSelect={() => setSelectedComponent(component)}
                  currentObjectId={currentObjectId!}
                  manifestData={manifestData}
                  mode={mode}
                  key={idx}
                  component={component}
                  completed={validationObj.components[component.id]}
                />
              )
            )}
        </div>
      </CollapsibleSection>
      {selectedComponent && (
        <ComponentMetadataPopover
          componentId={selectedComponent.id}
          isVisible={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
};

export default NodeMetadata;
