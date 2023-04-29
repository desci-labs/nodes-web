import {
  CodeComponent,
  ExternalLinkComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import EmptyPreview from "@src/components/molecules/EmptyPreview";
import { findTarget } from "@src/components/organisms/ComponentLibrary";
import { IconData } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import { setComponentStack, toggleMode } from "@src/state/nodes/nodeReader";
import { setShowComponentStack } from "@src/state/preferences/preferencesSlice";
import { useSetter } from "@src/store/accessors";
import { useMemo } from "react";

const ROOT_COMPONENTS_PATHS = [
  "root/Research Reports",
  "root/Code Repositories",
  "root/Data",
];
const isDriveComponent = (component: ResearchObjectV1Component) =>
  !ROOT_COMPONENTS_PATHS.includes(component.payload?.path) &&
  component.type !== ResearchObjectComponentType.DATA_BUCKET;

export default function ComponentsPreview() {
  const { manifest: manifestData } = useNodeReader();

  const components = useMemo(() => {
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

    // Remove the default 3 (data, code, reports) added components
    return componentsWithOneData?.filter(isDriveComponent);
  }, [manifestData]);

  if (!components?.length || components?.length > 7) {
    return (
      <EmptyPreview
        title="No Components"
        message="To access the data of this node, please view it on a desktop browser."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {components.map((component, i) => (
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
  const subtype =
    "subtype" in component
      ? (component["subtype"] as ResearchObjectComponentSubtypes)
      : undefined;
  const target = findTarget(component.type, subtype);
  const dispatch = useSetter();
  const { mode } = useNodeReader();

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

      case ResearchObjectComponentType.LINK:
        return (component as ExternalLinkComponent).payload.url;
    }
  };

  const onHandleClick = () => {
    if (
      [
        ResearchObjectComponentType.DATA,
        ResearchObjectComponentType.DATA_BUCKET,
        ResearchObjectComponentType.UNKNOWN,
      ].includes(component.type)
    ) {
      // dispatch(navigateToDriveByPath(component.payload.path));
      dispatch(setComponentStack([component]));
      dispatch(setShowComponentStack(true));
      mode === "editor" && dispatch(toggleMode());
    } else {
      const link = urlForComponent(component);

      if (link) return window.open(link, "_blank");
      // TODO: show toast asking users to view node in desktop
    }
  };

  return (
    <div
      className="flex w-full gap-4 items-center bg-zinc-200 bg-neutrals-black active:bg-neutrals-gray-5 rounded-lg px-4 py-2 border border-black"
      onClick={onHandleClick}
    >
      <target.icon
        width={24}
        height={24}
        wrapperClassName="w-[30px] h-[30px]"
        className="p-[3px] fill-white stroke-white"
      />
      <span className="font-bold capitalize w-[calc(100%-80px)] truncate overflow-ellipsis">
        {component.name}
      </span>
    </div>
  );
}
