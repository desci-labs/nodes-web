import {
  CommonComponentPayload,
  DataComponentMetadata,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import { DatasetMetadataInfo, MetaStaging } from "../PaneDrive";

export enum FileType {
  Dir = "dir",
  File = "file",
}
export interface FileDir {
  name: string;
  path: string;
  size: number;
  cid: string;
  type: FileType;
  contains?: Array<FileDir | DriveObject>;
  parent?: DriveObject | FileDir | null;
  uid?: string;
  date?: string;
  published?: boolean;
}

export enum DriveNonComponentTypes {
  MANIFEST = "manifest",
  UNKNOWN = "unknown",
}

export type DriveMetadata = CommonComponentPayload & DataComponentMetadata;

export interface DriveObject {
  uid: string;
  name: string;
  lastModified: string; //date later
  componentType: ResearchObjectComponentType | DriveNonComponentTypes;
  accessStatus: AccessStatus;
  size: number;
  metadata: DriveMetadata;
  cid: string;
  type: FileType;
  contains?: Array<DriveObject>;
  parent?: DriveObject | FileDir | null;
  path?: string;
  starred?: boolean;
}

export enum AccessStatus {
  PUBLIC = "Public",
  PRIVATE = "Private",
  PARTIAL = "Partial",
  UPLOADING = "Uploading",
  FAILED = "Failed",
}

export interface DriveRowProps {
  file: DriveObject;
  exploreDirectory: (
    name: FileDir["name"] | DriveObject["name"],
    drive: DriveObject
  ) => void;
  index: number;
  selected: boolean;
  isMultiselecting: boolean;
  toggleSelected: (
    index: number,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) => void;
  // setShowEditMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  // datasetMetadataInfoRef: React.MutableRefObject<DatasetMetadataInfo>;
  // setMetaStaging: React.Dispatch<React.SetStateAction<MetaStaging[]>>;
  selectedFiles: Record<
    number,
    ResearchObjectComponentType | DriveNonComponentTypes
  >;
  canEditMetadata: boolean;
  canUse: boolean;
  // setOldComponentMetadata: (
  //   value: React.SetStateAction<oldComponentMetadata | null>
  // ) => void;
}

export interface DriveJumpingParams {
  targetUid?: string;
  targetPath?: string; //fallback
  itemUid?: string;
  itemPath?: string; //fallback
}

export interface oldComponentMetadata {
  componentId: string;
  cb: () => void;
}
