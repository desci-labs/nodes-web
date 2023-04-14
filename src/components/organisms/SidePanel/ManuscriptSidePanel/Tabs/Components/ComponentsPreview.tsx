import {
  CodeComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import EmptyPreview from "@src/components/molecules/EmptyPreview";
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

  if (!components || components?.length === 0) {
    return (
      <EmptyPreview
        title="No Components"
        message="To access the data of this node, please view it on a desktop browser."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
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

  const urlForComponent = (c: ResearchObjectV1Component) => {
    switch (c.type) {
      case ResearchObjectComponentType.PDF:
        const url =
          process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE +
          "/" +
          component.payload.url;
        return url;

      case ResearchObjectComponentType.CODE:
        return (component as CodeComponent).payload.externalUrl;
    }
  };

  return (
    <div
      className="flex gap-4 items-center bg-zinc-200 bg-neutrals-black active:bg-neutrals-gray-5 rounded-lg px-4 py-2 border border-black"
      onClick={() => {
        window.open(urlForComponent(component), "_blank");
      }}
    >
      <target.icon
        width={24}
        height={24}
        wrapperClassName="w-[30px] h-[30px]"
        className="p-[3px] fill-white stroke-white"
      />
      <span className="font-bold">{target.title}</span>
    </div>
  );
}
