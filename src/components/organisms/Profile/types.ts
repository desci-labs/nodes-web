
export interface UserProfileWallet {
  address: string;
  nickname: string;
  extra: string;
}
export interface UserProfileApiData {
  userId: string;
  email: string;
  profile: {
    name: string;
    googleScholarUrl: string;
    orcid?: string;
  };
  wallets: UserProfileWallet[];
}
