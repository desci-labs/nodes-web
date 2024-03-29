import {
  CommonComponentPayload,
  DataComponentMetadata,
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";

export enum FileType {
  DIR = "dir",
  FILE = "file",
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
  componentSubtype?: ResearchObjectComponentSubtypes;
  componentId?: string | undefined;
  accessStatus: AccessStatus;
  size: number;
  metadata: DriveMetadata;
  cid: string;
  type: FileType;
  contains?: Array<DriveObject> | null;
  parent?: DriveObject | FileDir | null;
  path?: string;
  starred?: boolean;
  external?: boolean;
}

export enum AccessStatus {
  PUBLIC = "Public",
  PRIVATE = "Private",
  PARTIAL = "Partial",
  EXTERNAL = "External",
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
  toggleSelected: (
    path: string,
    componentType: ResearchObjectComponentType | DriveNonComponentTypes
  ) => void;
  canEditMetadata: boolean;
  canUse: boolean;
  deprecated?: boolean;
}
