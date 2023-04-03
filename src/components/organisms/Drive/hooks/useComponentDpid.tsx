import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { useCurrentNodeVersion, useNodeReader } from "@src/state/nodes/hooks";
import {
  DriveObject,
  FileDir,
  FileType,
} from "@src/components/organisms/Drive/types";
import { useCallback, useMemo } from "react";

export default function useComponentDpid(componentToUse: DriveObject) {
  const { currentObjectId, manifest: manifestData } = useNodeReader();
  const { versions } = useCurrentNodeVersion();

  const isDpidSupported = !!manifestData?.dpid;
  const version = versions.length - 1;

  const dpidLink = useMemo(
    () =>
      isDpidSupported
        ? `https://${
            manifestData?.dpid?.prefix ? manifestData?.dpid?.prefix + "." : ""
          }dpid.org/${manifestData?.dpid?.id}/v${version || 1}`
        : "",
    [
      version,
      isDpidSupported,
      manifestData?.dpid?.id,
      manifestData?.dpid?.prefix,
    ]
  );

  const resolveDpid = useCallback((): string => {
    if (!componentToUse) return "";

    const component =
      componentToUse.type === FileType.Dir
        ? componentToUse?.contains?.[0] ?? null
        : componentToUse;
    if (!component) return dpidLink;

    let componentParent: DriveObject | FileDir = component;
    while (
      componentParent &&
      componentParent.parent &&
      componentParent.parent.cid?.length > 10
    ) {
      componentParent = componentParent?.parent!;
    }

    const index = manifestData?.components.findIndex(
      (c: ResearchObjectV1Component) =>
        c.id === component.cid || c.id === componentParent.cid
    );
    const versionString =
      index === undefined || index < 0 ? version : `${version}/${index}`;

    let fqi = isDpidSupported
      ? `${manifestData?.dpid?.id}/${versionString}`
      : `${currentObjectId?.replaceAll(".", "") ?? ""}/${versionString}`;

    let fqiDataSuffix = undefined;

    if (
      index &&
      manifestData?.components[index]?.type ===
        ResearchObjectComponentType.DATA &&
      componentParent
    ) {
      const splitPath = component.path?.split("/").filter((a) => a !== "Data");
      if (splitPath && splitPath.length > 1) {
        let newPath = splitPath.slice(1);
        newPath.unshift(componentParent.name);
        if (componentToUse.type === FileType.Dir) {
          newPath = [componentParent.name];
        }
        fqiDataSuffix = newPath.join("/");
      }
    }

    const fqDpid =
      index === undefined || index < 0
        ? dpidLink
        : `${dpidLink}/${index}${fqiDataSuffix ? `/${fqiDataSuffix}` : ""}`;

    const link = isDpidSupported
      ? fqDpid
      : `${window.location.protocol}//${window.location.host}/${fqi}${
          fqiDataSuffix ? `/${fqiDataSuffix}` : ""
        }`;

    let codeLink = `${window.location.protocol}//${window.location.host}/${fqi}`;

    return component.componentType === ResearchObjectComponentType.CODE
      ? codeLink
      : link;
  }, [
    componentToUse,
    currentObjectId,
    dpidLink,
    isDpidSupported,
    manifestData?.components,
    manifestData?.dpid?.id,
    version,
  ]);

  return resolveDpid();
}
