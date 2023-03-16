import AdminPanel from "@src/components/screens/AdminPanel";
import Invite from "@src/components/screens/Invite";
import {
  OrcIdAuthParseJwt,
  OrcIdConnectUpdateProfile,
} from "@src/components/screens/OrcIdOAuth/OrcIdOAuthScreen";
import PoiLookup from "@src/components/screens/PoiLookup";
import { Navigate, useNavigate } from "react-router-dom";
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nodes from "@src/components/screens/RouteNodes";
import { app, site } from "@src/constants/routes";
import { useGetUser } from "@src/hooks/useGetUser";
import Profile from "@src/components/organisms/PaneUserProfile";
import UpdateEmailScreen from "@src/components/organisms/UpdateEmail/UpdateEmailScreen";
import AdminAnalyticsScreen from "@src/components/screens/adminAnalyticsScreen";
import PaneHelp from "@src/components/organisms/PaneHelp";

export default function Views() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, error } = useGetUser();

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
    <Routes>
      <Route path="/orcid/connect" element={<OrcIdConnectUpdateProfile />} />
      <Route path="/orcid/auth" element={<OrcIdAuthParseJwt />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsScreen />} />
      <Route path="/invite" element={<Invite />} />
      <Route path="/poi-lookup" element={<PoiLookup />} />
      <Route path="/nodes/*" element={<Nodes />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/updateEmail" element={<UpdateEmailScreen />} />
      <Route path={app.help} element={<PaneHelp />} />
      <Route
        path="/:url*(/+)"
        element={<Navigate replace to={location.pathname.slice(0, -1)} />}
      />
      <Route path="/*" element={<Nodes />} />
    </Routes>
  );
}
