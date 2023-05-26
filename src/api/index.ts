/* eslint-disable no-loop-func */
import axios, { AxiosRequestConfig } from "axios";
import {
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
  ResearchObjectPreviewResult,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import type { Profile } from "@components/organisms/UserProfileForm";
import {
  DataReference,
  Node,
  NodeVersion,
  PublicDataReference,
  PublicDataReferenceOnIpfsMirror,
} from "@src/types/client";
import {
  CidString,
  DrivePath,
  ExternalCid,
  ExternalUrl,
} from "@src/state/drive/types";
import { arrayXor } from "@src/components/utils";
import mixpanel from "mixpanel-browser";
import { segmentAnalytics } from "@src/App/App";
import * as amplitude from "@amplitude/analytics-browser";

export const SCIWEAVE_URL =
  process.env.REACT_APP_NODES_API || "http://localhost:5420";

if (SCIWEAVE_URL.indexOf("/v1") > -1) {
  alert(
    "process.env.REACT_APP_NODES_API should not include /v1. To fix edit desci-dapp/.env"
  );
}

export type ResearchObjectStub = {
  title: string;
  pdf?: string[];
  code?: string[];
  metadata?: string[];
  links?: any;
};

export const config = (preset?: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...preset,
    withCredentials: true,
    headers: {
      authorization: `Bearer ${localStorage.getItem("auth")}`,
    },
  };
};

export const magicLinkRedeem = async (email: string, code: string) => {
  const { data } = await axios.post(`${SCIWEAVE_URL}/v1/auth/magic`, {
    email,
    code,
  });
  return data;
};

export const magicLinkSend = async (email: string) => {
  const { data } = await axios.post(`${SCIWEAVE_URL}/v1/auth/magic`, { email });
  return data;
};

export const waitlistAdd = async (email: string) => {
  const { data } = await axios.post(`${SCIWEAVE_URL}/v1/waitlist`, { email });
  return data;
};

export const termsConsent = async (obj: any, uuid: string) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/consent`,
    {
      ...obj,
      uuid,
    },
    config()
  );
  return data;
};

export const getNodeVersionDetails = async (hash: string) => {
  const { data } = await axios.get<
    any,
    {
      data: {
        ok: boolean;
        node: Node;
        nodeVersion: NodeVersion;
        dataReferences: DataReference[];
        publicDataReferences: (PublicDataReference & {
          mirrors: PublicDataReferenceOnIpfsMirror[];
        })[];
      };
    }
  >(`${SCIWEAVE_URL}/v1/nodes/versionDetails?transactionId=${hash}`, config());
  return data;
};

export const createResearchObjectStub = async (obj: ResearchObjectStub) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/createDraft`,
    obj,
    config()
  );
  return data;
};

interface UpdateDraftProps {
  manifest: ResearchObjectV1;
  uuid: string;
}
export const updateDraft = async (obj: UpdateDraftProps) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/updateDraft`,
    obj,
    config()
  );
  return data;
};

interface AddComponentToDraftProps {
  manifest: ResearchObjectV1;
  uuid: string;
  componentUrl: string;
  title: string;
  componentType: ResearchObjectComponentType;
  componentSubtype?: ResearchObjectComponentSubtypes;
}

export const getRecentPublishedManifest = async (
  uuid: string
): Promise<ResearchObjectV1> => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/${uuid}${
      process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
        ? `?g=${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}`
        : ""
    }`,
    config()
  );
  return data;
};

export const getPublishedVersions = async (uuid: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/pub/versions/${uuid}`,
    config()
  );
  return data;
};

export const resolvePublishedManifest = async (
  uuid: string,
  version: string | number | undefined
): Promise<ResearchObjectV1> => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/${uuid}${version !== undefined ? `/${version}` : ""}${
      process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
        ? `?g=${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}`
        : ""
    }`
    // config()
  );
  return data;
};

export const addComponentToDraft = async (obj: AddComponentToDraftProps) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/addComponentToDraft`,
    obj,
    config()
  );
  return data;
};

export const getWaitlist = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/waitlist`, config());
  return data;
};

export const getUsers = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/users`, config());
  return data;
};

export const __adminWaitlistPromote = async (id: string) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/waitlist/promote/${id}`,
    {},
    config()
  );
  return data;
};

export const getResearchObjectStub = async (id: string, shareId?: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/nodes/${id}`,
    config({
      params: {
        shareId: shareId,
        g: process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
          ? process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
          : "",
      },
    })
  );
  return data;
};

export const resolvePrivateResearchObjectStub = async (
  id: string,
  shareId?: string
) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/nodes/showPrivate/${id}`,
    config({
      params: {
        shareId: shareId,
        g: process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
          ? process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
          : "",
      },
    })
  );
  return data;
};
export const verifyPrivateShareLink = async (shareId?: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/nodes/share/verify/${shareId}`,
    config()
  );
  return data;
};

export const getResearchObjectVersions = async (uuid: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/pub/versions/${uuid}`,
    config()
  );
  return data;
};

export const getArcs = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/arcs`);
  return data;
};

export const getArc = async (id: string) => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/arcs/${id}`);
  return data;
};

export const getNodesForUser = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/nodes`, config());
  return data.nodes;
};

export const retrieveDoi = async (
  doi: string
): Promise<ResearchObjectPreviewResult> => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/doi`,
    { doi },
    config()
  );
  return data;
};

export const getUserData = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/auth/profile`, config());
  return data;
};

export const getResearchFields = async (search: string = "") => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/researchFields?q=${search}`,
    config()
  );
  return data;
};

export const getAccountNonce = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/nonce`, config());
  return data;
};

export const associateWallet = async (
  address: string,
  message: string,
  signature: string
) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/users/associate`,
    { walletAddress: address, message, signature },
    config()
  );
  return data;
};

export const updateProfile = async (profile: Profile) => {
  const { data } = await axios.patch(
    `${SCIWEAVE_URL}/v1/users/updateProfile`,
    { profile: profile },
    config()
  );
  return data;
};

export const logout = async () => {
  // await axios.delete(`${SCIWEAVE_URL}/v1/auth/logout`, config());
  localStorage.removeItem("auth");
  stopTracking();
  return {};
};

export const publishResearchObject = async (input: {
  uuid: string;
  cid: string;
  manifest: ResearchObjectV1;
  transactionId: string;
}) => {
  const options: AxiosRequestConfig = config();
  options.headers["content-type"] = "application/json";

  const { data } = await axios.post<{ okay: boolean }>(
    `${SCIWEAVE_URL}/v1/nodes/publish`,
    JSON.stringify(input),
    options
  );
  return data;
};

export const getDatasetTree = async (
  cid: string,
  nodeUuid: string,
  pub = false,
  shareId = ""
) => {
  const route = pub ? "pubTree" : "retrieveTree";
  console.log("fetch dataset tree", pub, route);
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/data/${route}/${nodeUuid}/${cid}${
      shareId ? "/" + shareId : ""
    }`,
    config()
  );
  return data;
};

export const getDataUsage = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/users/usage`, config());
  return data;
};

export const getDataset = async (cid: string, nodeUuid: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/data/downloadDataset/${nodeUuid}/${cid}`,
    config()
  );
  return data;
};

export interface UpdateDag {
  uuid: string;
  files?: FileList | FileSystemEntry[] | File[];
  manifest: ResearchObjectV1;
  contextPath: DrivePath;
  componentType?: ResearchObjectComponentType;
  componentSubtype?: ResearchObjectComponentSubtypes;
  externalCids?: ExternalCid[];
  externalUrl?: ExternalUrl;
  newFolderName?: string;
  onProgress?: (e: ProgressEvent) => void;
}

interface FileEntryBase extends FileSystemEntry {}
interface FileEntry extends FileEntryBase, FileSystemFileEntry {}

export const updateDag = async ({
  uuid,
  files,
  manifest,
  contextPath,
  onProgress,
  componentType,
  componentSubtype,
  externalCids,
  externalUrl,
  newFolderName,
}: UpdateDag) => {
  if (
    !arrayXor([
      files?.length,
      externalCids?.length,
      externalUrl,
      newFolderName?.length,
    ])
  )
    return { error: "Can only update DAG using a single update method" };
  if (
    !files?.length &&
    !externalCids?.length &&
    !externalUrl?.path?.length &&
    !externalUrl?.url?.length &&
    !newFolderName?.length
  )
    return { error: "Missing content, files, externalUrl or externalCid" };

  const formData = new FormData();
  formData.append("uuid", uuid);
  formData.append("manifest", JSON.stringify(manifest));
  if (newFolderName) formData.append("newFolderName", newFolderName);
  if (componentType) formData.append("componentType", componentType);
  if (componentSubtype) formData.append("componentSubtype", componentSubtype);
  if (externalCids?.length)
    formData.append("externalCids", JSON.stringify(externalCids));
  formData.append("contextPath", contextPath);
  // debugger;
  if (externalUrl?.path?.length && externalUrl?.url?.length)
    formData.append("externalUrl", JSON.stringify(externalUrl));
  if (files?.length) {
    if (
      files[0].toString() === "[object FileEntry]" ||
      files[0].toString() === "[object FileSystemFileEntry]"
    ) {
      const entryList = files as FileEntryBase[];
      for (let i = 0; i < entryList.length; i++) {
        const f = entryList[i];
        const p = new Promise<File>((res, rej) => {
          (f as FileEntry).file((v) => res(v), rej);
        });
        const tempFile = await p;
        const fileName = entryList[i].fullPath;

        formData.append("files", new File([tempFile], fileName));
      }
    } else {
      Array.prototype.forEach.call(files, (f) => {
        formData.append("files", f);
      });
    }
  }

  const adjustedConfig: any = config();
  adjustedConfig.headers["content-type"] = "multipart/form-data";
  if (onProgress) {
    adjustedConfig.onUploadProgress = (e: ProgressEvent) => onProgress(e);
  }

  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/data/update`,
    formData,
    adjustedConfig
  );
  return data;
};

export const deleteData = async (uuid: string, path: string) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/data/delete`,
    {
      uuid,
      path,
    },
    config()
  );
  return data;
};

export const renameData = async (
  uuid: string,
  path: string,
  newName: string,
  renameComponent?: boolean
) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/data/rename`,
    {
      uuid,
      path,
      newName,
      renameComponent,
    },
    config()
  );
  return data;
};

export const query = async (query: string) => {
  const payload = JSON.stringify({
    query,
  });
  const { data } = await axios.post(
    "https://graph-goerli-dev.desci.com/subgraphs/name/desoc",
    payload
  );
  if (data.errors) {
    console.error(
      `graph index query err ${query}`,
      JSON.stringify(data.errors)
    );
    throw Error(JSON.stringify(data.errors));
  }
  return data.data;
};

export const postSendFriendReferrals = async (emails: string[]) => {
  const options: AxiosRequestConfig = config();
  const { data } = await axios.post<{
    referrals: string[];
    sentEmails: string[];
  }>(`${SCIWEAVE_URL}/v1/referral`, { emails }, options);
  return data;
};

export enum FriendReferralStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}
export interface FriendReferral {
  createdAt: string;
  id: number;
  uuid: string;
  senderUserId: number;
  receiverEmail: string;
  status: FriendReferralStatus;
  awardedStorage: boolean;
  amountAwardedStorageGb: number;
  updatedAt: string;
}
export const getFriendReferrals = async () => {
  const options: AxiosRequestConfig = config();
  const resp = await axios.get<{
    referrals: FriendReferral[];
  }>(`${SCIWEAVE_URL}/v1/referral`, options);
  return resp.data.referrals;
};

export const patchAcceptFriendReferral = async (referralUuid: string) => {
  const options: AxiosRequestConfig = config();
  const resp = await axios.patch(
    `${SCIWEAVE_URL}/v1/referral/${referralUuid}/accept`,
    {},
    options
  );
  return resp.data;
};
/**
 * TODO: Put this in desci-models?
 */
export enum AvailableUserActionLogTypes {
  btnDownloadData = "btnDownloadData",
  btnDownloadManuscript = "btnDownloadManuscript",
  btnShare = "btnShare",
  btnPublish = "btnPublish",
  btnAddComponentFab = "btnAddComponentFab",
  btnAddComponentDrive = "btnAddComponentDrive",
  btnAddComponentDriveNewComponent = "btnAddComponentDriveNewComponent",
  btnAddComponentDriveNewFolder = "btnAddComponentDriveNewFolder",
  driveNavigateBreadcrumb = "driveNavigateBreadcrumb",
  btnFigureAnnotate = "btnFigureAnnotate",
  btnContinuePublish = "btnContinuePublish",
  btnReviewBeforePublish = "btnReviewBeforePublish",
  dismissCommitAdditionalInfo = "dismissCommitAdditionalInfo",
  dismissCommitStatus = "dismissCommitStatus",
  completePublish = "completePublish",
  btnSignPublish = "btnSignPublish",
  commitPanelDismiss = "commitPanelDismiss",
  viewWalletSettings = "viewWalletSettings",
  walletMoreOptions = "walletMoreOptions",
  walletSwitchChain = "walletSwitchChain",
  walletClickCard = "walletClickCard",
  walletError = "walletError",
  walletDisconnect = "walletDisconnect",
  connectWallet = "connectWallet",
  btnComponentCardCite = "btnComponentCardCite",
  btnComponentCardViewFile = "btnComponentCardViewFile",
  btnComponentCardUse = "btnComponentCardUse",
  btnComponentCardViewLink = "btnComponentCardViewLink",
  btnComponentCardViewMetadata = "btnComponentCardViewMetadata",
  viewDrive = "viewDrive",
  btnDriveCite = "btnDriveCite",
  btnDriveUse = "btnDriveUse",
  btnDriveStarToggle = "btnDriveStarToggle",
  saveMetadata = "saveMetadata",
  btnInspectMetadata = "btnInspectMetadata",
  ctxDriveRename = "ctxDriveRename",
  ctxDrivePreview = "ctxDrivePreview",
  ctxDriveDownload = "ctxDriveDownload",
  ctxDriveDelete = "ctxDriveDelete",
  ctxDriveAssignType = "ctxDriveAssignType",
  ctxDriveEditMetadata = "ctxDriveEditMetadata",
  btnCreateNewNode = "btnCreateNewNode",
  btnCreateNodeModalSave = "btnCreateNodeModalSave",
  errNodeCreate = "errNodeCreate",
  viewedNode = "viewedNode",
}
export const postUserAction = async (
  action: AvailableUserActionLogTypes,
  message?: string
) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/log/action`,
    { action, message },
    config()
  );

  track(action, message);

  return data;
};

export const track = async (action: string, message?: string) => {
  if (process.env.REACT_APP_MIXPANEL_TOKEN) {
    mixpanel.track(action, {
      message,
    });
  }
  if (process.env.REACT_APP_SEGMENT_TOKEN) {
    segmentAnalytics.track(action, {
      message,
    });
  }
  if (process.env.REACT_APP_AMPLITUDE_TOKEN) {
    amplitude.track(action, {
      message,
    });
  }
};

export const trackPage = async (route: string) => {
  if (process.env.REACT_APP_MIXPANEL_TOKEN) {
    mixpanel.track("page", {
      route,
    });
  }
  if (process.env.REACT_APP_SEGMENT_TOKEN) {
    segmentAnalytics.page();
  }
  if (process.env.REACT_APP_AMPLITUDE_TOKEN) {
    amplitude.track("page", {
      route,
    });
  }
};

export const stopTracking = async () => {
  if (process.env.REACT_APP_MIXPANEL_TOKEN) {
    mixpanel.reset();
  }
  if (process.env.REACT_APP_SEGMENT_TOKEN) {
    segmentAnalytics.reset();
  }
  if (process.env.REACT_APP_AMPLITUDE_TOKEN) {
    amplitude.reset();
  }
};
