import {
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
} from "@src/../../nodes/desci-models/dist";
import { DriveObject } from "@src/components/organisms/Drive";

export interface NavigateToDriveByPathAction {
  payload: {
    path: string;
  };
}

export interface AddFilesToDrivePayload {
  files?: FileList | FileSystemEntry[];
  externalCids?: ExternalCid[];
  overwritePathContext?: string;
  componentType?: ResearchObjectComponentType;
  componentSubType?: ResearchObjectComponentSubtypes;
}

export interface UploadQueueItem {
  nodeUuid: string;
  path: string;
  batchUid: string;
}
export interface AddItemsToUploadQueueAction {
  payload: {
    items: UploadQueueItem[];
  };
}
export interface removeBatchFromUploadQueueAction {
  payload: {
    batchUid: string;
  };
}
export interface UpdateBatchUploadProgressAction {
  payload: {
    batchUid: string;
    progress: number;
  };
}

export interface StarComponentThunkPayload {
  item: DriveObject;
}
export interface AssignTypeThunkPayload {
  item: DriveObject;
  type: ResearchObjectComponentType;
  subType?: ResearchObjectComponentSubtypes;
}

export type DrivePath = string;
export type CidString = string;
export type ComponentId = string;

//Path expected here is the same as regular file drop path, i.e. /hey.txt, or /folder/hey.txt
type Path = string;
export type ExternalCid = Record<Path, CidString>;