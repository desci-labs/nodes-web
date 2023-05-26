import React, { useEffect } from "react";
import "./style.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetUser } from "@src/hooks/useGetUser";
import { site } from "@src/constants/routes";
import { useEffectOnce } from "react-use";
import mixpanel from "mixpanel-browser";
import { AnalyticsBrowser } from "@segment/analytics-next";
import * as amplitude from "@amplitude/analytics-browser";
export const USE_ORCID_JWT = true;

console.log(`[starting DeSci Nodes v${process.env.REACT_APP_VERSION}]`);

export const segmentAnalytics: AnalyticsBrowser = new AnalyticsBrowser();

if (process.env.REACT_APP_SEGMENT_TOKEN) {
  segmentAnalytics.load({
    writeKey: process.env.REACT_APP_SEGMENT_TOKEN,
  });
}

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, error } = useGetUser();

  useEffectOnce(() => {
    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, { debug: true });
    }
    if (process.env.REACT_APP_AMPLITUDE_TOKEN) {
      amplitude.init(process.env.REACT_APP_AMPLITUDE_TOKEN, undefined, {
        defaultTracking: {
          sessions: true,
          pageViews: true,
          formInteractions: true,
          fileDownloads: true,
        },
      });
    }
  });

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
        mixpanel.identify(user.id);

        segmentAnalytics.identify({
          userId: user.id,
        });

        amplitude.setUserId(user.id);

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
    </>
  );
};

export default React.memo(App);
