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

const DEFAULT_VALUE = { dpid: "", fqi: "", license: "Not Specified" };

export default function useComponentDpid(componentToUse: DriveObject) {
  const versionIndex = useCurrentNodeVersion();
  const { currentObjectId, manifest: manifestData } = useNodeReader();

  const isDpidSupported = !!manifestData?.dpid;
  const version = versionIndex?.versions.length - 1 || 1;
  console.log("versions", isDpidSupported, versionIndex, manifestData);
  const dpidLink = useMemo(
    () =>
      isDpidSupported
        ? `https://${
            manifestData?.dpid?.prefix ? manifestData?.dpid?.prefix + "." : ""
          }dpid.org/${manifestData?.dpid?.id}/v${version}`
        : "",
    [
      version,
      isDpidSupported,
      manifestData?.dpid?.id,
      manifestData?.dpid?.prefix,
    ]
  );

  const resolveDpid = useCallback((): {
    dpid: string;
    fqi: string;
    license: string;
  } => {
    if (!componentToUse) return DEFAULT_VALUE;

    const component =
      componentToUse.type === FileType.Dir
        ? componentToUse?.contains?.[0] ?? null
        : componentToUse;

    if (!component) return DEFAULT_VALUE;

    const license =
      component.metadata.licenseType ||
      manifestData?.defaultLicense ||
      DEFAULT_VALUE.license;

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

    const dpid = isDpidSupported
      ? component.componentType === ResearchObjectComponentType.CODE
        ? codeLink
        : link
      : "";

    return { dpid, fqi, license };
  }, [
    componentToUse,
    currentObjectId,
    dpidLink,
    isDpidSupported,
    manifestData?.components,
    manifestData?.defaultLicense,
    manifestData?.dpid?.id,
    version,
  ]);

  return resolveDpid();
}
