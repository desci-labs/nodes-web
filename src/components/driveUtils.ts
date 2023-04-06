import { getDatasetTree } from "@api/index";
import {
  DataComponentMetadata,
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import CID from "cids";
import { ButtonState } from "./atoms/StatusButton";
import { BreadCrumb } from "./molecules/DriveBreadCrumbs";
import {
  AccessStatus,
  DriveMetadata,
  DriveNonComponentTypes,
  DriveObject,
  FileDir,
  FileType,
} from "./organisms/Drive";
import { UploadQueueItem } from "./organisms/UploadPanel";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./molecules/AnnotationEditor/components";

export const tempDate = "12/02/2022 7:00PM";

export enum SessionStorageKeys {
  lastDirUid = "Drive::lastDirUid",
  lastNodeId = "Drive::lastNodeId",
  pathUidMap = "Drive::pathUidMap",
}

interface VirtualDriveArgs {
  name: string;
  componentType: ResearchObjectComponentType | DriveNonComponentTypes;
  size?: number;
  contains?: Array<DriveObject>;
  lastModified?: string;
  accessStatus?: AccessStatus;
  metadata?: {};
  cid?: string;
  parent?: DriveObject | FileDir | null;
  path?: string;
  uid?: string;
}
export function createVirtualDrive({
  name,
  componentType,
  size,
  contains,
  lastModified,
  accessStatus,
  metadata,
  cid,
  parent,
  path,
  uid,
}: VirtualDriveArgs): DriveObject {
  return {
    name: name,
    componentType: componentType,
    size: size || 0,
    contains: contains || [],
    lastModified: lastModified || tempDate,
    accessStatus: accessStatus || AccessStatus.PRIVATE,
    metadata: metadata || {},
    cid: cid || "",
    type: FileType.Dir,
    parent: parent || null,
    path: path || undefined,
    uid: uid || uuidv4(),
  };
}

export const enum VirtualDrivePaths {
  DRIVE_DATA_PATH = "Data",
}
export const DRIVE_DATA_PATH = "Data";
export const DRIVE_RESEARCH_REPORT_PATH = "ResearchReport";
export const DRIVE_CODE_PATH = "Code";

export function manifestToVirtualDrives(
  manifest: ResearchObjectV1,
  cid: string,
  privCidMap: Record<string, boolean>
): DriveObject {
  const virtualData = createVirtualDrive({
    name: "Data",
    componentType: ResearchObjectComponentType.DATA,
    path: DRIVE_DATA_PATH,
    metadata: {},
  });
  const virtualPdfs = createVirtualDrive({
    name: "Research Reports",
    componentType: ResearchObjectComponentType.PDF,
    path: DRIVE_RESEARCH_REPORT_PATH,
    metadata: {},
  });
  const virtualCodeRepos = createVirtualDrive({
    name: "Code Repositories",
    componentType: ResearchObjectComponentType.CODE,
    path: DRIVE_CODE_PATH,
    metadata: {},
  });

  manifest.components.forEach((c) => {
    const componentMetadata: DriveMetadata = {};
    componentMetadata.keywords = c.payload.keywords;
    componentMetadata.description = c.payload.description;
    componentMetadata.licenseType = c.payload.licenseType;
    componentMetadata.title = c.payload.title || c.name;
    if (c.type === ResearchObjectComponentType.PDF) {
      const accessState =
        c.payload.url in privCidMap
          ? AccessStatus.PRIVATE
          : AccessStatus.PUBLIC;
      const driveObj: DriveObject = {
        name: c.name,
        cid: c.payload.url,
        lastModified: tempDate, //HARDCODED
        componentType: ResearchObjectComponentType.PDF,
        accessStatus: accessState,
        size: 0, //HARDCODED
        metadata: componentMetadata,
        type: FileType.File,
        path: `${DRIVE_RESEARCH_REPORT_PATH}/${c.id}`,
        uid: uuidv4(),
      };
      virtualPdfs.contains?.push(driveObj);
    }
    if (c.type === ResearchObjectComponentType.CODE) {
      const accessState =
        c.payload.url in privCidMap
          ? AccessStatus.PRIVATE
          : AccessStatus.PUBLIC;
      const driveObj: DriveObject = {
        name: c.name,
        cid: c.payload.url,
        lastModified: tempDate, //HARDCODED
        componentType: ResearchObjectComponentType.CODE,
        accessStatus: accessState,
        size: 0, //HARDCODED
        metadata: componentMetadata,
        type: FileType.File,
        path: `${DRIVE_CODE_PATH}/${c.id}`,
        uid: uuidv4(),
      };
      virtualCodeRepos.contains?.push(driveObj);
    }
    if (c.type === ResearchObjectComponentType.DATA) {
      const accessState =
        c.payload.cid in privCidMap
          ? AccessStatus.PRIVATE
          : AccessStatus.PUBLIC;
      componentMetadata.ontologyPurl = c.payload.ontologyPurl;
      componentMetadata.controlledVocabTerms = c.payload.controlledVocabTerms;
      const driveObj: DriveObject = {
        name: c.name,
        cid: c.payload.cid,
        lastModified: tempDate, //HARDCODED
        componentType: ResearchObjectComponentType.DATA,
        accessStatus: accessState,
        size: 0, //HARDCODED
        metadata: componentMetadata,
        type: FileType.Dir,
        path: `${DRIVE_DATA_PATH}/${c.payload.cid}`,
        uid: uuidv4(),
      };
      virtualData.contains?.push(driveObj);
    }
  });
  const nodeDrived: DriveObject = {
    name: "Research Node", //should be replaced with title once it's apart of metadata
    lastModified: tempDate,
    componentType: DriveNonComponentTypes.MANIFEST,
    accessStatus: AccessStatus.PRIVATE, //to-fix, HARDCODED
    size: 0, //to-fix HARDCODED
    metadata: {}, //TO ADD METADATA
    cid: cid,
    type: FileType.Dir,
    path: DRIVE_NODE_ROOT_PATH,
    contains: [virtualData, virtualPdfs, virtualCodeRepos],
    uid: uuidv4(),
  };
  nodeDrived.contains?.forEach((vd) => {
    vd.parent = nodeDrived;
    const pubStatus = determineAccessStatus(vd);
    vd.accessStatus = pubStatus;
  });
  return nodeDrived;
}

export const DRIVE_NODE_ROOT_PATH = "NodeRoot/";

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

interface GetAllTreesOptions {
  pathUidMap?: Record<string, string>;
  public?: boolean;
}

//mutable
export async function getAllTrees(
  nodeDrived: DriveObject,
  nodeUuid: string,
  manifest: ResearchObjectV1,
  options?: GetAllTreesOptions,
  shareId?: string
) {
  if (!Array.isArray(nodeDrived.contains)) return nodeDrived;
  const dataDriveIdx = nodeDrived?.contains?.findIndex(
    (drv) => (drv.path = DRIVE_DATA_PATH)
  );

  if (dataDriveIdx === -1) return nodeDrived;

  const dates: Date[] = [];
  const dataDrive = nodeDrived.contains[dataDriveIdx];
  const newData = await Promise.all(
    dataDrive.contains!.map(async (dataComp) => {
      const { tree, date } = await getDatasetTree(
        dataComp.cid!,
        nodeUuid,
        options?.public,
        shareId
      );
      if (!tree) return dataComp;
      // debugger;
      gracefullyAssignTreeUids(tree, dataComp.contains, options?.pathUidMap!);
      if (date) dates.push(new Date(date));
      tree.forEach((fd: any) => (fd.parent = dataComp));
      dataComp.contains = tree;
      dataComp.parent = dataDrive;

      const formattedDate = formatDbDate(date);
      if ("lastModified" in dataComp) dataComp.lastModified = formattedDate;
      dataComp.contains!.forEach(
        (fd, idx) =>
          (dataComp.contains![idx] = ipfsTreeToDriveTree(
            fd,
            formattedDate,
            manifest
          ))
      );
      dataComp.accessStatus = determineAccessStatus(dataComp);
      return dataComp;
    })
  );

  const latestDate = dates.reduce(
    (a: Date, b: Date) => (a > b ? a : b),
    new Date(1)
  );
  if ("lastModified" in dataDrive)
    dataDrive.lastModified = formatDbDate(latestDate.toString());

  if (!newData) return nodeDrived;
  nodeDrived.contains[dataDriveIdx].contains = newData;
  //size filling needs real world testing if a rerender is required
  fillOuterSizes(nodeDrived.contains[dataDriveIdx]);
  return nodeDrived;
}

//mutable
export function fillOuterSizes(drive: DriveObject) {
  drive.contains?.forEach((fd) => {
    const totalSize = fd.contains?.reduce((acc, item) => acc + item.size, 0);
    fd.size = totalSize || 0;
  });
  return drive;
}

export const DEFAULT_CID_PENDING = "pending";

export function parentLastModified(
  drive: DriveObject | FileDir
): string | undefined {
  if (!("lastModified" in drive) && drive.parent) {
    return parentLastModified(drive.parent);
  }
  if ("lastModified" in drive && drive.lastModified) {
    return drive.lastModified;
  }
}

export function ipfsTreeToDriveTree(
  fileDirObj: FileDir | DriveObject,
  date: string,
  manifest: ResearchObjectV1
): DriveObject {
  const driveObject = fileDirToDriveObj(fileDirObj, date, manifest);
  const fixedParents = resetParents(driveObject);
  //fill metadata
  findAndInheritSubMetadata(manifest, fixedParents);

  return fixedParents;
}

export function fileDirToDriveObj(
  fileDirObj: FileDir | DriveObject,
  date: string,
  manifest: ResearchObjectV1
): DriveObject {
  fileDirObj.contains?.forEach((fd: any, idx: number) => {
    const driveObj: DriveObject = {
      ...fd,
      lastModified: formatDbDate(fd.date) || date,
      accessStatus: fd.published ? AccessStatus.PUBLIC : AccessStatus.PRIVATE,
      metadata: {},
      componentType: ResearchObjectComponentType.DATA,
      uid: fd.uid || uuidv4(),
    };

    if (fd.type === FileType.Dir) ipfsTreeToDriveTree(fd, date, manifest);
    fileDirObj.contains![idx] = driveObj;
  });

  const filDirDate = formatDbDate((fileDirObj as FileDir).date!) || date;
  const filDirIsPub = (fileDirObj as FileDir).published!
    ? AccessStatus.PUBLIC
    : AccessStatus.PRIVATE;

  const driveObj = {
    ...fileDirObj,
    lastModified: filDirDate || date,
    accessStatus: filDirIsPub,
    metadata: {}, //TO ADD METADATA
    componentType: ResearchObjectComponentType.DATA,
    uid: fileDirObj.uid || uuidv4(),
  } as DriveObject;
  fileDirObj = driveObj;
  return fileDirObj;
}

//mutable
export function resetParents(driveObj: DriveObject) {
  if (driveObj.contains?.length) {
    driveObj.contains.forEach((c) => {
      c.parent = driveObj;
      if (c.type === FileType.Dir) resetParents(c);
    });
  }
  return driveObj;
}

export function addPlaceholderDataset(dataDrive: DriveObject, name?: string) {
  if (!name) {
    name = dataDrive.contains?.length
      ? `Dataset ${dataDrive.contains!.length + 1}`
      : `Dataset 1`;
  }

  const date = formatDbDate(Date.now());
  const placeholderData: DriveObject = {
    name: name,
    componentType: ResearchObjectComponentType.DATA,
    size: 0, //should be available
    contains: [],
    lastModified: date,
    accessStatus: AccessStatus.UPLOADING,
    metadata: {}, //TO ADD METADATA
    cid: DEFAULT_CID_PENDING,
    parent: dataDrive,
    type: FileType.Dir,
    uid: uuidv4(),
  };

  return placeholderData;
}

//returns the component root cid for files/dirs within dags
// export function findRootComponentCid(driveObj: DriveObject): string | void {
//   const rootComponentPaths = [DRIVE_DATA_PATH];
//   if (driveObj.parent === null || driveObj.parent === undefined) return;
//   if (driveObj.parent.path && rootComponentPaths.includes(driveObj.parent.path))
//     return driveObj.cid;
//   const isRootComponentDrive = rootComponentPaths.some(
//     (rootPath) => driveObj.path === `${rootPath}/${driveObj.cid}`
//   );
//   if (isRootComponentDrive) {
//     console.log("does this ever return with the driveCid: ", driveObj.cid);
//     return driveObj.cid;
//   }

//   return findRootComponentCid(driveObj.parent as DriveObject);
// }
export const rootComponentPaths = [
  DRIVE_DATA_PATH,
  DRIVE_CODE_PATH,
  DRIVE_RESEARCH_REPORT_PATH,
];

//checks if the passed in drive's a virtual drive that wraps a particular component type from the manifest
//e.g. 'Dataset 1' should return true, 'Data' should return false
//'Data' is a virtual drive, however it is not a root component drive.
export function isRootComponentDrive(drive: DriveObject): boolean {
  if (!drive.path || rootComponentPaths.includes(drive.path)) return false;
  const firstPath = drive.path?.split("/")[0];
  return rootComponentPaths.some((rootPath) => firstPath === `${rootPath}`);
}

export function isNodeRootDrive(drive: DriveObject): boolean {
  return rootComponentPaths.some((p) => drive.path === p);
}

//returns the rootCid if the passed drive is a part of a nested directory
export function findRootComponentCid(driveObj: DriveObject): string | void {
  // debugger;
  if (isRootComponentDrive(driveObj)) {
    const pathSplit = driveObj.path?.split("/");
    if (pathSplit && strIsCid(pathSplit[1])) return pathSplit[1];
    return;
  }

  const pathSplit = driveObj.path?.split("/");
  if (pathSplit) return pathSplit[0];
}

//mutable
export function findAndInheritSubMetadata(
  manifest: ResearchObjectV1,
  drive: DriveObject
) {
  const rootParentCid = findRootComponentCid(drive);
  const manifestRootParentComp = manifest.components.find(
    (c) => c.payload.cid === rootParentCid
  );

  const componentRootMeta = {
    licenseType: manifestRootParentComp?.payload.licenseType || "",
    title: manifestRootParentComp?.payload.title || "",
    description: manifestRootParentComp?.payload.description || "",
    keywords: manifestRootParentComp?.payload.keywords || [],
    ontologyPurl: manifestRootParentComp?.payload.ontologyPurl || "",
    controlledVocabTerms:
      manifestRootParentComp?.payload.controlledVocabTerms || [],
  };

  const subMetaTree = manifestRootParentComp?.payload.subMetadata || {};

  inheritSubMetadata(drive, { componentRootMeta, subMetaTree });
}

export interface MetadataSrc {
  componentRootMeta: DataComponentMetadata;
  subMetaTree: Record<string, DataComponentMetadata>;
}

//mutable
export function inheritSubMetadata(
  parentDrive: DriveObject,
  metaSrc: MetadataSrc
) {
  const matches = Object.keys(metaSrc.subMetaTree).filter((p) =>
    parentDrive.path?.includes(p)
  );
  if (matches.length) {
    const longestPath = matches.reduce((acc, path) =>
      path.length > acc.length ? path : acc
    );
    parentDrive.metadata = metaSrc.subMetaTree[longestPath];
  } else {
    parentDrive.metadata = metaSrc.componentRootMeta;
  }

  parentDrive.contains?.forEach((fd: DriveObject) => {
    const matches = Object.keys(metaSrc.subMetaTree).filter(
      (p) => parentDrive.path?.includes(p) || fd.path === p
    );
    if (matches.length) {
      const longestPath = matches.reduce((acc, path) =>
        path.length > acc.length ? path : acc
      );
      fd.metadata = metaSrc.subMetaTree[longestPath];
    } else {
      fd.metadata = metaSrc.componentRootMeta;
    }

    if (fd.type === FileType.Dir) inheritSubMetadata(fd, metaSrc);
  });
}

export function getVirtualDriveMetadataStatus(drive: DriveObject) {
  // remove since we have default license required
  // if (!drive.metadata.licenseType) return ButtonState.ERROR;
  // FORCING green to not confuse users temporarily
  return ButtonState.SUCCESS;
  if (drive.type === FileType.Dir && drive.contains) {
    if (!noChildrenError(drive)) return ButtonState.ERROR;
    if (!noChildrenPending(drive)) return ButtonState.PENDING;
  }
  return ButtonState.SUCCESS;
}

export function getMetadataStatus(drive: DriveObject) {
  // remove since we have default license required
  // if (!drive.metadata.licenseType) return ButtonState.ERROR;
  // FORCING green to not confuse users temporarily
  return ButtonState.SUCCESS;

  if (drive.type === FileType.Dir) {
    if (!noChildrenError(drive)) return ButtonState.ERROR;
    if (!noChildrenPending(drive)) return ButtonState.PENDING;
  }

  const allFilled = Object.entries(drive.metadata).every(
    (kv) =>
      kv[0] === "ontologyPurl" ||
      kv[0] === "description" ||
      kv[0] === "keywords" ||
      kv[0] === "licenseType" ||
      kv[1]?.length
  );
  if (allFilled) return ButtonState.SUCCESS;

  return ButtonState.PENDING;
}

export function noChildrenPending(drive: DriveObject): boolean {
  const allFilled = Object.entries(drive.metadata).every(
    (kv) =>
      kv[0] === "ontologyPurl" ||
      kv[0] === "description" ||
      kv[0] === "keywords" ||
      kv[0] === "licenseType" ||
      kv[1]?.length
  );
  if (!allFilled) return false;

  if (drive.type === FileType.Dir && drive.contains?.length) {
    return Object.values(drive.contains).every((child) =>
      Object.entries(child.metadata).every((kv) => {
        if (
          kv[0] === "ontologyPurl" ||
          kv[0] === "description" ||
          kv[0] === "keywords" ||
          kv[0] === "licenseType" ||
          (kv[1] && kv[1].length)
        ) {
          if (child.type === FileType.File) return true;
          if (child.type === FileType.Dir) return noChildrenPending(child);
        }
        return false;
      })
    );
  }
  return true;
}

export function noChildrenError(drive: DriveObject): boolean {
  if (!drive.metadata.licenseType && !isNodeRootDrive(drive)) return false;
  if (drive.type === FileType.Dir && drive.contains?.length) {
    return Object.values(drive.contains).every((child) => {
      if (child.metadata.licenseType && child.metadata.licenseType?.length) {
        if (child.type === FileType.File) return true;
        if (child.type === FileType.Dir) return noChildrenError(child);
      }
    });
  }
  return true;
}

export function isDataComponent(
  manifest: ResearchObjectV1,
  componentCid: string
) {
  const comp = manifest.components.find((c) => c.payload.cid === componentCid);
  if (!comp) return false;
  if (comp.type === ResearchObjectComponentType.DATA) {
    return true;
  }
  return false;
}

//FOR DEBUGGING, REMOVE WHEN NO LONGER NEEDED
export function stringifyMaxDepth(obj: any, depth = 1) {
  // recursion limited by depth arg
  if (!obj || typeof obj !== "object") return JSON.stringify(obj);

  let curDepthResult = '"<?>"'; // too deep
  if (depth > 0) {
    curDepthResult = Object.keys(obj)
      .map((key) => {
        let val = stringifyMaxDepth(obj[key], depth - 1);
        if (val === undefined) val = "null";
        return `"${key}": ${val}`;
      })
      .join(", ");
    curDepthResult = `{${curDepthResult}}`;
  }

  return JSON.stringify(JSON.parse(curDepthResult));
}

//used for ipfs dirs, returns a child drive that matches the path
// export function findDriveByPath(
//   parentDrive: DriveObject,
//   path: string
// ): DriveObject | undefined {
//   if (parentDrive.path === path) return parentDrive;
//   if (!parentDrive.contains && !parentDrive.contains!.length) return undefined;
//   const node: DriveObject | undefined = parentDrive.contains?.find((drv) => {
//     if (drv.path === path) return true;
//     if (drv.contains && drv.contains.length) {
//       return findDriveByPath(drv, path);
//     }
//     return false;
//   });
//   return node;
// }

export function findDriveByPath(
  parentDrive: DriveObject,
  path: string
): DriveObject | undefined {
  if (parentDrive.path === path) return parentDrive;
  if (!parentDrive.contains && !parentDrive.contains!.length) return undefined;
  for (let idx = 0; idx < parentDrive.contains?.length!; idx++) {
    const node = parentDrive.contains![idx];
    if (node.path === path) return node;
    if (node.contains && node.contains.length)
      return findDriveByPath(node, path);
  }
  return undefined;
}

export function strIsCid(cid: string) {
  try {
    const cidObj = new CID(cid);
    CID.isCID(cidObj);
    CID.validateCID(cidObj);
    return true;
  } catch (e) {
    return false;
  }
}

export function popUploadQueue(queue: UploadQueueItem[]) {
  if (!queue.length) return [];
  const latestBatch = queue[0].batchUid;
  while (queue[0].batchUid === latestBatch) {
    queue.pop();
    if (!queue.length) return [];
  }
  return queue;
}

export function removeFromUploadQueue(
  queue: UploadQueueItem[],
  batchUid: string
) {
  return queue.filter((qI) => qI.batchUid !== batchUid);
}

export function constructBreadCrumbs(drive: DriveObject): BreadCrumb[] {
  const breadCrumbs: BreadCrumb[] = [];
  breadCrumbs.unshift({ name: drive.name, drive: drive });
  if (drive.parent)
    return [
      ...constructBreadCrumbs(drive.parent as DriveObject),
      ...breadCrumbs,
    ];

  return breadCrumbs;
}

export function driveBfsByUid(rootDrive: DriveObject, targetUid: string) {
  if (!targetUid) return;
  const queue = [rootDrive];
  // debugger;
  while (queue.length) {
    const node = queue.shift() as DriveObject;
    if (node.uid && node.uid === targetUid) return node;
    // console.log(
    //   `[DRIVE BFS] TARGET: ${targetUid}, MATCHING AGAINST: ${node.uid}`
    // );
    if (node.contains && node.contains?.length) queue.push(...node.contains);
  }
  return;
}

export function driveBfsByPath(rootDrive: DriveObject, targetPath: string) {
  const queue = [rootDrive];
  while (queue.length) {
    const node = queue.shift() as DriveObject;
    if (node.path && node.path.includes(targetPath)) return node;
    if (node.contains && node.contains?.length) queue.push(...node.contains);
  }
}

//mutable
//takes in a fresh tree from the root level, and its root-level-component's(i.e. 'Dataset 1') contents(.contains), assigns their old UID or a new one if non existent
//used for re-assiging a fresh ipfs tree to a dataset/code component, persisting existing UIDs
export function gracefullyAssignTreeUids(
  freshTree: FileDir[],
  rootComponentContents?: DriveObject[], //mandatory on first call to generate map
  oldPathUidMap?: undefined | Record<string, string>
) {
  //create map if doesn't exist
  if (!oldPathUidMap && rootComponentContents) {
    // debugger;
    const flatTree = recursiveFlattenTree(rootComponentContents);
    const latestCid = freshTree[0].path.split("/")[0];
    const map = flatTree.map((e: FileDir | DriveObject) => {
      const pathSplit = e.path!.split("/");
      pathSplit[0] = latestCid;
      e.path = pathSplit?.join("/");
      return [e.path, e.uid];
    });
    oldPathUidMap = Object.fromEntries(map);
  }
  if (!oldPathUidMap) return;
  console.log(`[DRIVE UPDATE] PATH-UID-MAP: ${JSON.stringify(oldPathUidMap)}`);
  freshTree.forEach((fd) => {
    if (fd.path in oldPathUidMap!) {
      fd.uid = oldPathUidMap![fd.path];
      // console.log(`[DRIVE UPDATE] MATCHED ${fd.path} WITH UID: ${fd.uid}`);
    } else {
      console.log(`[DRIVE UPDATE] NO MATCH FOUND FOR PATH: ${fd.path}`);
    }
    fd.uid = fd.uid || uuidv4();
    if (fd.contains && fd.contains.length)
      gracefullyAssignTreeUids(fd.contains as any, undefined, oldPathUidMap);
  });
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

export function generateFlatPathUidMap(drive: DriveObject) {
  const flatTree = recursiveFlattenTree(drive.contains!);
  const map = flatTree.map((e: FileDir | DriveObject) => {
    return [e.path, e.uid];
  });
  return Object.fromEntries(map);
}

export function removeCidsFromPath(path: string): string {
  const cidlessPathSplit = path.split("/").filter((str) => !strIsCid(str));
  return cidlessPathSplit.join("/");
}

//determines access status for dirs
export function determineAccessStatus(drive: DriveObject) {
  const hasPub = drive.contains!.some(
    (fd) =>
      fd.accessStatus === AccessStatus.PUBLIC ||
      fd.accessStatus === AccessStatus.PARTIAL
  );
  const hasPriv = drive.contains!.some(
    (fd) => fd.accessStatus === AccessStatus.PRIVATE
  );
  if (!hasPub && hasPriv) return AccessStatus.PRIVATE;
  if (hasPub && hasPriv) return AccessStatus.PARTIAL;
  if (hasPub && !hasPriv) return AccessStatus.PUBLIC;
  return AccessStatus.PUBLIC;
}

//mutable, resets the drive access status for all dirs
export function resetAccessStatus(drive: DriveObject) {
  drive.contains!.forEach((d) => {
    if (d.type === "dir" && d.contains?.length) {
      resetAccessStatus(d);
      d.accessStatus = determineAccessStatus(d);
    }
  });
  return drive;
}
