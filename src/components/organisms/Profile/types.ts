
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
    organization?: string;
    rorpid?: string;
  };
  wallets: UserProfileWallet[];
}

export interface ProfileRegistrationValues {
  name: string;
  googleScholarUrl?: string;
  organization?: string;
  rorpid?: string;
  hasAcceptedTerms: boolean;
  hasAffiliation: boolean;
}