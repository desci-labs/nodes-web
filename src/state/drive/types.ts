import { UploadQueueItem } from "@src/components/organisms/UploadPanel";

export interface NavigateToDriveByPathAction {
  payload: {
    path: string;
  };
}

export interface AddFilesToDrivePayload {
  files: FileList | FileSystemEntry[];
  overwriteContext?: string;
}
export interface AddItemsToUploadQueueAction {
  payload: {
    items: UploadQueueItem[];
  };
}

export interface UpdateBatchUploadProgressAction {
  payload: {
    batchUid: string;
    batchProgress: number;
  };
}
