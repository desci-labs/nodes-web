import React, { useEffect } from "react";
import "./style.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetUser } from "@src/hooks/useGetUser";
import { site } from "@src/constants/routes";
import { ProfilePromptModal } from "@src/components/organisms/Profile/ProfileRegistration";
export const USE_ORCID_JWT = true;

console.log(`[starting DeSci Nodes v${process.env.REACT_APP_VERSION}]`);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, error } = useGetUser();

  useEffect(() => {
    if (error) {
      if (location.pathname.indexOf("/app") > -1) {
        navigate(site.web);
      }
      return;
    }

    if (userData) {
      let user = userData;
      if (user) {
        if (
          !location.pathname.includes("/app/") ||
          location.pathname === "/login"
        ) {
          navigate(`${site.app}/nodes/start`);
        }
      }
    }
  }, [userData, error, location.pathname, navigate]);

  return (
    <>
      <Outlet />
      <ProfilePromptModal />
    </>
  );
};

export default React.memo(App);
