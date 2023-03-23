import React, { useEffect } from "react";
import "./style.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetUser } from "@src/hooks/useGetUser";
import { site } from "@src/constants/routes";
export const USE_ORCID_JWT = true;

console.log(`[starting DeSci Nodes v${process.env.REACT_APP_VERSION}]`);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, error } = useGetUser();
  console.log("Render app");

  useEffect(() => {
    if (error) {
      console.error(error);
      if (location.pathname.indexOf("/nodes/start") > -1) {
        navigate(site.app);
      }
      return;
    }
    if (userData) {
      let user = userData;
      if (user) {
        if (location.pathname === "/" || location.pathname === "/login") {
          navigate(site.app);
        }
      }
    } else {
      // navigate(sie)
    }
  }, [userData, error, location.pathname, navigate]);

  return (
    <>
      <Outlet />
    </>
  );
};

export default React.memo(App);
