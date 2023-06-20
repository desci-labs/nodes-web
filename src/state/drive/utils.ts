import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { DRIVE_NODE_ROOT_PATH, tempDate } from "@src/components/driveUtils";
import {
  DriveObject,
  FileDir,
  FileType,
} from "@src/components/organisms/Drive";

import { BreadCrumb, DrivePath } from "./types";
import { __log } from "@src/components/utils";

export const GENERIC_NEW_FOLDER_NAME = "New Folder";
export const GENERIC_NEW_LINK_NAME = "Link";
export const CID_PENDING = "Pending";

export function neutralizePath(path: DrivePath) {
  return path.replace(/^[^/]+/, DRIVE_NODE_ROOT_PATH);
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

export const DRIVE_EXTERNAL_LINKS_PATH = "External Links";
export const DRIVE_FULL_EXTERNAL_LINKS_PATH =
  DRIVE_NODE_ROOT_PATH + "/" + DRIVE_EXTERNAL_LINKS_PATH;

export function hasPublic(tree: DriveObject): boolean {
  return tree.contains!.some((fd) => {
    const fdTyped = fd as FileDir;
    if (fdTyped.published) return true;
    if (fd.contains && fd.contains.length) return hasPublic(fd);
    return false;
  });
}

// Prevent rendering certain files in the tree in the drive view
const FILTER_LIST = [".nodeKeep", ".DS_Store"];

// Fill in the remaining details the backend tree doesn't return, so far; date format and filtering.
export function transformTree(tree: DriveObject[]) {
  tree = tree.filter((branch) => !FILTER_LIST.includes(branch.name));
  tree.forEach((branch) => {
    branch.lastModified = formatDbDate(branch.lastModified) || tempDate;
    if (
      branch.contains &&
      branch.contains.length &&
      branch.type === FileType.DIR
    ) {
      branch.contains = transformTree(branch.contains);
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

/* Matches on conditions met that DriveObject has, e.g. { cid: 123abc, componentType: PDF } */
export function bfsDriveSearch(
  rootDrive: DriveObject,
  conditions: Partial<DriveObject>
) {
  const queue = [rootDrive];
  while (queue.length) {
    const node = queue.shift() as DriveObject;
    if (
      Object.entries(conditions).every(
        ([key, value]) => node[key as keyof DriveObject] === value
      )
    )
      return node;
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
    currentDrive = currentDrive.contains?.find((d) => {
      __log("[findDriveByPath]", d.name, nextPath);
      return d.name === nextPath;
    });
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

export function getComponentCid(component: ResearchObjectV1Component) {
  if (component.payload?.url) return component.payload.url;
  return component.payload?.cid;
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

export function constructBreadCrumbs(path: DrivePath): BreadCrumb[] {
  const parts = path.split("/");
  const result: BreadCrumb[] = [];

  for (let i = 0; i < parts.length; i++) {
    const joined = parts.slice(0, i + 1).join("/");
    result.push({ name: i === 0 ? "Research Node" : parts[i], path: joined });
  }

  return result;
}

export function separateFileNameAndExtension(fileName: string): {
  fileName: string;
  extension?: string;
} {
  const splitName = fileName.split(".");
  const extension = splitName.length > 1 ? splitName.pop() : "";
  const name = splitName.join(".");
  return { fileName: name, extension };
}

export function findUniqueName(name: string, existingNames: string[]) {
  let newName = name;
  let i = 1;
  while (existingNames.includes(newName)) {
    newName = `${name} (${i})`;
    i++;
  }
  return newName;
}

/*
 ** Sortations
 */

export function defaultSort(a: DriveObject, b: DriveObject) {
  // Sorts by folders first, then by name in alphabetical order
  const aIsDir = a.type === "dir";
  const bIsDir = b.type === "dir";

  if (aIsDir !== bIsDir) {
    return bIsDir ? 1 : -1;
  }

  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
