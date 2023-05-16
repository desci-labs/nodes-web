import React, { useCallback, useEffect } from "react";
import "./style.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { site } from "@src/constants/routes";
import { ProfilePromptModal } from "@src/components/organisms/Profile/ProfileRegistration";
import { checkConsent } from "@src/api";
import { useSetter } from "@src/store/accessors";
import { setPreferences } from "@src/state/preferences/preferencesSlice";
import { useUser } from "@src/state/user/hooks";
export const USE_ORCID_JWT = true;

console.log(`[starting DeSci Nodes v${process.env.REACT_APP_VERSION}]`);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useSetter();
  const userProfile = useUser();

  const runCheck = useCallback(async () => {
    const { consent } = await checkConsent();
    if (!consent) {
      dispatch(setPreferences({ showProfileRegistration: true }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userProfile.userId > 0) {
      runCheck();
      if (
        !location.pathname.includes("/app/") ||
        location.pathname === "/login"
      ) {
        navigate(`${site.app}/nodes/start`);
      }
    } else {
      console.log("Redirect to login page", userProfile)
       navigate(`${site.web}`);
    }
  }, [location.pathname, navigate, runCheck, dispatch, userProfile]);

  return (
    <>
      <Outlet />
      <ProfilePromptModal />
    </>
  );
};

export default React.memo(App);
