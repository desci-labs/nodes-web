import { getUserData } from "@src/api";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { setUser } from "@src/state/user/userSlice";
import { useSetter } from "@src/store/accessors";
import useSWR from "swr";

export function useGetUser() {
  const { setWallets } = useManuscriptController();
  const dispatch = useSetter();

  const { data: userData, error } = useSWR("getUserData", getUserData, {
    shouldRetryOnError: false,
    onSuccess(data) {
      setWallets(data.wallets);
      if (JSON.stringify(userData) !== JSON.stringify(data)) {
        dispatch(setUser(data));
      }
    },
  });

  return { userData, error };
}
