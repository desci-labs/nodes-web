import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { findTarget } from "@src/components/organisms/ComponentLibrary";
import { IconData } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";

export default function ComponentsPreview() {
  const { manifest: manifestData } = useNodeReader();

  const hasDataComponent =
    manifestData &&
    manifestData.components.filter(
      (c) => c.type === ResearchObjectComponentType.DATA
    ).length;
  const components = manifestData && manifestData.components;
  let componentsWithOneData = components;

  if (hasDataComponent) {
    componentsWithOneData = components?.filter(
      (c) => c.type !== ResearchObjectComponentType.DATA
    );

    componentsWithOneData?.push({
      name: "Node Data",
      id: "__virtual_node_data",
      payload: {},
      type: ResearchObjectComponentType.DATA,
      icon: IconData,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {components?.map((component, i) => (
        <ComponentPreview key={i} component={component} />
      ))}
    </div>
  );
}

function ComponentPreview({
  component,
}: {
  component: ResearchObjectV1Component;
}) {
  const target = findTarget(component);
  if (!target) return null;
  return (
    <div className="flex gap-2 items-center bg-zinc-200 dark:bg-neutrals-black rounded-lg px-4 py-2 border border-black">
      <target.icon wrapperClassName="w-[30px] h-[30px]" className="p-[4px]" />
      <span>{target.title}</span>
    </div>
  );
}
