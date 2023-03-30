export interface NavigateToDriveByPathAction {
  payload: {
    path: string;
  };
}

export interface AddFilesToDrivePayload {
  files: FileList | FileSystemEntry[];
  overwritePathContext?: string;
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
