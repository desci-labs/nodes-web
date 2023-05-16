import { PropsWithChildren, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { useSetter } from "@src/store/accessors";
import { logout, setUser } from "@src/state/user/userSlice";
import { useUser } from "@src/state/user/hooks";
import { useGetUserQuery } from "@src/state/api/auth";
// import { useLocation, useNavigate } from "react-router-dom";
// import { site } from "@src/constants/routes";

export const LOCALSTORAGE_DESCI_USER_PROFILE =
  "LOCALSTORAGE_DESCI_USER_PROFILE";

export default function UserUpdater(props: PropsWithChildren<{}>) {
  const dispatch = useSetter();
  const { data, isSuccess, isError, error } = useGetUserQuery();
  const userProfile = useUser();

  // const navigate = useNavigate();
  // const location = useLocation();

  const handleError = async (error: FetchBaseQueryError) => {
    // const reason = (error?.data as any)?.message || "";
    if (error.status === 401) {
      // if (location.pathname.includes(site.app)) {
      //   navigate(site.web);
      // } 
      console.log("Logout", userProfile)
      dispatch(logout());
    }

    // display toast or banner
    // }
  };

  useEffect(() => {
    console.log("UpserUpdater", data, userProfile);

    if (isError && error) {
      const err = error as unknown as FetchBaseQueryError;
      console.log("HandleError", err?.data, err?.status, err);
      handleError(err);
    } else if (isSuccess && userProfile && userProfile.userId !== 0) {
      dispatch(setUser(userProfile));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, error, isSuccess, userProfile, dispatch]);

  // console.log("USER PROFILE", userProfile);
  return null;
}
