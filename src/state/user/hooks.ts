import { useGetter } from "@src/store/accessors";
import { UserProfile, Wallet } from "@src/state/api/types";

export const useUser = (): UserProfile => {
  const user = useGetter((state) => state.user.profile);
  return user;
};
export const useGetWallets = (): Wallet[] => {
  const wallets = useGetter((state) => state.user.profile.wallets);
  return wallets;
};
