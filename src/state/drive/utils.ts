import {
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { DRIVE_NODE_ROOT_PATH, tempDate } from "@src/components/driveUtils";
import {
  AccessStatus,
  DriveMetadata,
  DriveNonComponentTypes,
  DriveObject,
  FileDir,
  FileType,
} from "@src/components/organisms/Drive";

import { v4 as uuidv4 } from "uuid";
import { DrivePath } from "./types";

export function neutralizePath(path: DrivePath) {
  return path.replace(/^[^/]+/, DRIVE_NODE_ROOT_PATH);
}

export function generatePathCompMap(
  manifest: ResearchObjectV1
): Record<DrivePath, ResearchObjectV1Component> {
  const componentsMap: Record<DrivePath, ResearchObjectV1Component> = {};
  manifest.components.forEach((c) => {
    switch (c.type) {
      case ResearchObjectComponentType.CODE:
      case ResearchObjectComponentType.PDF:
      case ResearchObjectComponentType.DATA:
      case ResearchObjectComponentType.UNKNOWN:
        componentsMap[c.payload.path] = c;
        return;
      default:
        return;
    }
  });
  return componentsMap;
}

export function recursiveFlattenTree(tree: FileDir[] | DriveObject[]) {
  const contents: any = [];
  tree.forEach((fd) => {
    contents.push(fd);
    if (fd.type === "dir" && fd.contains) {
      contents.push(...recursiveFlattenTree(fd.contains! as any));
    }
  });
  return contents;
}

export function generateFlatPathDriveMap(
  tree: DriveObject[]
): Record<DrivePath, DriveObject> {
  const contents = recursiveFlattenTree(tree);
  const map: Record<DrivePath, DriveObject> = {};
  contents.forEach((d: DriveObject) => {
    const neutralPath = neutralizePath(d.path!);
    map[neutralPath] = d;
  });
  return map;
}

export function generatePathSizeMap(
  flatPathDriveMap: Record<DrivePath, DriveObject>
): Record<DrivePath, number> {
  const pathSizeMap: Record<DrivePath, number> = {};
  const dirKeys: DrivePath[] = [];
  Object.entries(flatPathDriveMap).forEach(([path, drive]) => {
    if (drive.type === FileType.DIR) {
      dirKeys.push(path);
    } else {
      pathSizeMap[path] = drive.size;
    }
  });

  const dirSizeMap: Record<DrivePath, number> = {};
  dirKeys.forEach((dirPath) => {
    const dirSize = Object.entries(pathSizeMap).reduce(
      (acc: number, [path, size]) => {
        if (path.startsWith(dirPath)) return acc + size;
        return acc;
      },
      0
    );
    dirSizeMap[dirPath] = dirSize || 0;
  });
  return { ...pathSizeMap, ...dirSizeMap };
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

export function inheritMetadata(
  path: DrivePath,
  pathToCompMap: Record<DrivePath, ResearchObjectV1Component>
) {
  const comp = pathToCompMap[path];
  if (comp) {
    const specificMetadata = extractComponentMetadata(comp);
    if (Object.keys(specificMetadata).length) return specificMetadata;
  }

  const pathSplit = path.split("/");
  if (pathSplit.length < 3) return {};
  while (pathSplit.length > 1) {
    pathSplit.pop();
    const parentPath = pathSplit.join("/");
    const parent = pathToCompMap[parentPath];
    if (parent) {
      const potentialMetadata = extractComponentMetadata(parent);
      if (Object.keys(potentialMetadata).length) return potentialMetadata;
    }
  }
  return {};
}

export const DRIVE_EXTERNAL_LINKS_PATH = "externallinks";

export function inheritComponentType(
  drive: DriveObject,
  pathToCompMap: Record<DrivePath, ResearchObjectV1Component>
) {
  const pathSplit = drive.path!.split("/");
  if (pathSplit.length < 3) return ResearchObjectComponentType.UNKNOWN;
  while (pathSplit.length > 1) {
    pathSplit.pop();
    const parentPath = pathSplit.join("/");
    const parent = pathToCompMap[parentPath];
    if (parent && parent.type !== ResearchObjectComponentType.UNKNOWN) {
      return parent.type;
    }
  }
  return ResearchObjectComponentType.UNKNOWN;
}

//Convert IPFS tree to DriveObject tree V2
export function convertIpfsTreeToDriveObjectTree(
  tree: DriveObject[],
  pathToCompMap: Record<DrivePath, ResearchObjectV1Component>,
  pathToSizeMap: Record<DrivePath, number>
) {
  tree.forEach((branch) => {
    const neutralPath = neutralizePath(branch.path!);
    branch.path = neutralPath;
    const component = pathToCompMap[branch.path!];
    branch.componentType =
      component?.type || inheritComponentType(branch, pathToCompMap);
    branch.accessStatus = AccessStatus.PRIVATE; // FIXME, HARDCODED, PRIVCIDMAP
    branch.metadata = inheritMetadata(branch.path, pathToCompMap);
    branch.starred = component?.starred || false;
    branch.uid = component?.id || uuidv4(); //add cached uuids
    branch.lastModified = formatDbDate(branch.lastModified) || tempDate;
    if (
      branch.contains &&
      branch.contains.length &&
      branch.type === FileType.DIR
    ) {
      branch.size = pathToSizeMap[branch.path!] || 0;
      branch.contains = convertIpfsTreeToDriveObjectTree(
        branch.contains,
        pathToCompMap,
        pathToSizeMap
      );
    }
  });
  return tree;
}

//Delete later
export function deleteAllParents(tree: DriveObject) {
  delete tree.parent;
  tree.contains?.forEach((f) => {
    delete f.parent;
    if (f.type === FileType.DIR && f.contains?.length) {
      f = deleteAllParents(f);
    }
  });
  return tree;
}

export function driveBfsByPath(rootDrive: DriveObject, targetPath: string) {
  const queue = [rootDrive];
  while (queue.length) {
    const node = queue.shift() as DriveObject;
    if (node.path && node.path === targetPath) return node;
    if (node.contains && node.contains?.length) queue.push(...node.contains);
  }
}

//Preferred over driveBfsByPath, but may not function if working with deprecated tree
export function findDriveByPath(rootDrive: DriveObject, targetPath: string) {
  if (!targetPath || !rootDrive) return null;
  const queue = targetPath.split("/");
  queue.shift();
  let currentDrive: DriveObject | undefined = rootDrive;
  while (queue.length) {
    if (!currentDrive) return null;
    const nextPath = queue.shift();
    currentDrive = currentDrive.contains?.find((d) => d.name === nextPath);
  }
  if (currentDrive?.path === targetPath) return currentDrive;
  return null;
}

/* 
Inconsistent use of URL and CID within the manifest payloads, PDFs and Code Repos use .url,
 others generally use .cid, this helper function fetches the appropriate property
  */
export function urlOrCid(cid: string, type: ResearchObjectComponentType) {
  switch (type) {
    case ResearchObjectComponentType.PDF:
    case ResearchObjectComponentType.CODE:
    case ResearchObjectComponentType.LINK:
      return { url: cid };
    case ResearchObjectComponentType.DATA:
    case ResearchObjectComponentType.DATA_BUCKET:
      return { cid };
    default:
      return { cid };
  }
}

export function formatDbDate(date: string | Date | number) {
  if (typeof date === "string") date = new Date(date);
  return new Intl.DateTimeFormat("default", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
    .format(date)
    .toString()
    .replace(/\s+(AM|PM|am|pm)/, "$1")
    .split(",")
    .join("")
    .toUpperCase();
}
