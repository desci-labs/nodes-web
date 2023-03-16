import { useGetter } from "@src/store/accessors";
import { UserProfile, Wallet } from "@src/state/api/types";

export const useUser = (): UserProfile => {
  const orcid = useGetter((state) => state.user.profile);
  return orcid;
};
export const useGetWallets = (): Wallet[] => {
  const wallets = useGetter((state) => state.user.profile.wallets);
  return wallets;
};
