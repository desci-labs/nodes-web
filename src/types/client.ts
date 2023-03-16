/**
 * Model Node
 *
 */
export type Node = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  cid: string;
  state: NodeState;
  isFeatured: boolean;
  manifestUrl: string;
  restBody: JSON;
  replicationFactor: number;
  ownerId: number;
  uuid: string | null;
};
/**
 * Model NodeVersion
 *
 */
export type NodeVersion = {
  id: number;
  manifestUrl: string;
  cid: string;
  transactionId: string | null;
  nodeId: number | null;
};

// DataReferences
export type DataReference = {
  id: number
  createdAt: Date
  updatedAt: Date
  name: string | null
  description: string | null
  cid: string
  root: boolean
  rootCid: string | null
  path: string | null
  directory: boolean
  size: number
  type: DataType
  nodeId: number
  userId: number
  versionId: number | null
}


export type PublicDataReference = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  description: string | null;
  cid: string;
  root: boolean;
  directory: boolean;
  size: number;
  type: DataType;
  nodeId: number;
  userId: number;
  versionId: number | null;
};

export type PublicDataReferenceOnIpfsMirror = {
  dataReferenceId: number;
  mirrorId: number;
  status: PublishState;
  retryCount: number;
  providerCount: number;
};

export const DataTypeObj = {
  MANIFEST: "MANIFEST",
  DATASET: "DATASET",
  IMAGES: "IMAGES",
  VIDEOS: "VIDEOS",
  CODE_REPOS: "CODE_REPOS",
};
export type DataType = keyof typeof DataTypeObj;
export const NodeStateObj = {
  NEW: "NEW",
  PENDING_DAO_APPROVAL: "PENDING_DAO_APPROVAL",
  DAO_APPROVED: "DAO_APPROVED",
  PENDING_VALIDATION: "PENDING_VALIDATION",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
};
export type NodeState = keyof typeof NodeStateObj;
export const PublishStateObj = {
  WAITING: "WAITING",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};
export type PublishState = keyof typeof PublishStateObj;

export type ResearchFields = {
  id: number;
  name: string;
};