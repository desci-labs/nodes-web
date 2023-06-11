import {
  ResearchObjectContributorRole,
  ResearchObjectCredits,
} from "@desci-labs/desci-models";
import { Organization } from "@src/types/client";

export interface Wallet {
  address: string;
  nickname: string;
  extra: any;
}

export interface UserProfile {
  email: string;
  userId: number;
  vscode: string;
  profile: {
    googleScholarUrl: string;
    name: string;
    orcid: string;
    // rorPid?: string[];
    userOrganization?: Organization[];
  };
  wallets: Wallet[];
}

export interface MagicLinkResponse {
  user: { token: string };
}

export interface ResearchNode {
  cid: string;
  createdAt: string;
  index: VersionResponse[];
  isPublished: boolean;
  manifestUrl: string;
  ownerId: number;
  title: string;
  updatedAt: string;
  uuid: string;
}

export interface VersionResponse {
  id: string;
  id10: string;
  owner: string;
  recentCid: string;
  versions: VersionResponseVersion[];
}

interface VersionResponseVersion {
  cid: string;
  id: string;
  time: string;
}

export type NodeCreditRoles = {
  id: number;
  credit: ResearchObjectCredits;
  role: ResearchObjectContributorRole;
};

export type NodeAccess = {
  id: number;
  uuid: string;
  userId: number;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthorInvite = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  senderId: number;
  receiverId: number | null;
  nodeId: number;
  roleId: number;
  inviteCode: string;
  status: AuthorInviteStatus;
  expired: boolean;
  expiresAt: Date;
};

export type AuthorInviteStatus =
  | "ACCEPTED"
  | "REJECTED"
  | "PENDING"
  | "EXPIRED";

export type InviteResponse = AuthorInvite & {
  sender: { id: true; email: string; name: string };
  receiver: { id: true; email: string; name: string };
  role: NodeCreditRoles;
};

export type AccessRolesResponse = NodeCreditRoles & {
  name: string;
};

export type Contributor = NodeAccess & {
  user: { id: true; email: string; name: string };
  role: NodeCreditRoles;
};

export type ApiResponse<T> = { data: T, ok: boolean };