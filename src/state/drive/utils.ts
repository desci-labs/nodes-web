import {
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { DRIVE_NODE_ROOT_PATH } from "@src/components/driveUtils";
import {
  AccessStatus,
  DriveMetadata,
  DriveNonComponentTypes,
  DriveObject,
  FileType,
} from "@src/components/organisms/Drive";

import { v4 as uuidv4 } from "uuid";

export type cidString = string;
export type componentId = string;

export function generateCidCompMap(
  manifest: ResearchObjectV1
): Record<cidString, ResearchObjectV1Component> {
  const componentsMap: Record<cidString, ResearchObjectV1Component> = {};
  manifest.components.forEach((c) => {
    switch (c.type) {
      case ResearchObjectComponentType.CODE:
      case ResearchObjectComponentType.PDF:
        componentsMap[c.payload.url] = c;
        return;
      case ResearchObjectComponentType.DATA:
        componentsMap[c.payload.cid] = c;
        return;
      default:
        return;
    }
  });
  return componentsMap;
}

export function extractComponentMetadata(
  component: ResearchObjectV1Component
): DriveMetadata {
  if (!component) return {};
  const metadata: DriveMetadata = {};
  const validMetadataKeys: (keyof DriveMetadata)[] = [
    "title",
    "keywords",
    "description",
    "licenseType",
    "ontologyPurl",
    "controlledVocabTerms",
  ];

  validMetadataKeys.forEach((k) => {
    if (k in component.payload) metadata[k] = component.payload[k];
  });

  return metadata;
}

export const DRIVE_EXTERNAL_LINKS_PATH = "externallinks";

//Convert IPFS tree to DriveObject tree V2
export function convertIpfsTreeToDriveObjectTree(
  tree: DriveObject[],
  cidToCompMap: Record<cidString, ResearchObjectV1Component>
) {
  tree.forEach((branch) => {
    const component = cidToCompMap[branch.cid];
    branch.componentType = component.type || DriveNonComponentTypes.UNKNOWN;
    branch.accessStatus = AccessStatus.PRIVATE; // FIXME, HARDCODED, PRIVCIDMAP
    branch.metadata = extractComponentMetadata(component);
    branch.starred = component.starred || false;
    branch.uid = component.id || uuidv4(); //add cached uuids
    const pathSplit = branch.path?.split("/");
    if (pathSplit) {
      pathSplit[0] = DRIVE_NODE_ROOT_PATH;
      branch.path = pathSplit.join("/");
    }
    if (
      branch.contains &&
      branch.contains.length &&
      branch.type === FileType.Dir
    ) {
      branch.contains = convertIpfsTreeToDriveObjectTree(
        branch.contains,
        cidToCompMap
      );
    }
  });
  return tree;
}

export function deleteAllParents(tree: DriveObject) {
  delete tree.parent;
  tree.contains?.forEach((f) => {
    delete f.parent;
    if (f.type === FileType.Dir && f.contains?.length) {
      f = deleteAllParents(f);
    }
  });
  return tree;
}
