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
