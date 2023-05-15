import { PropsWithChildren, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { useSetter } from "@src/store/accessors";
import { setUser } from "@src/state/user/userSlice";
import { useUser } from "@src/state/user/hooks";
import { useGetUserQuery } from "@src/state/api/auth";

export const LOCALSTORAGE_DESCI_USER_PROFILE =
  "LOCALSTORAGE_DESCI_USER_PROFILE";

export default function UserUpdater(props: PropsWithChildren<{}>) {
  const dispatch = useSetter();
  const { isSuccess, isError, error } = useGetUserQuery();
  const userProfile = useUser();

  const handleError = async (reason: string) => {
    if (reason.toLowerCase() === "unauthorized") {
    }
  };

  useEffect(() => {
    if (isError && error) {
      const err = error as unknown as FetchBaseQueryError;
      console.log("HandleError", err?.data, err?.status, err);
      handleError((err?.data as string) ?? "");
    } else if (isSuccess && userProfile && userProfile.userId !== 0) {
      dispatch(setUser(userProfile));
    }
  }, [isError, error, isSuccess, userProfile, dispatch]);

  // console.log("USER PROFILE", userProfile);
  return null;
}
