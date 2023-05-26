import React, { useEffect } from "react";
import "./style.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { site } from "@src/constants/routes";
// import { checkConsent } from "@src/api";
// import { useSetter } from "@src/store/accessors";
// import { setPreferences } from "@src/state/preferences/preferencesSlice";
import { useUser } from "@src/state/user/hooks";
import { useEffectOnce } from "react-use";
import mixpanel from "mixpanel-browser";
import { AnalyticsBrowser } from "@segment/analytics-next";
import * as amplitude from "@amplitude/analytics-browser";
import { trackPage } from "@src/api";
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
  // const dispatch = useSetter();
  const userProfile = useUser();

  // const runCheck = useCallback(async () => {
  //   const { consent } = await checkConsent();
  //   if (!consent) {
  //     dispatch(setPreferences({ showProfileRegistration: true }));
  //   }
  // }, [dispatch]);

  useEffectOnce(() => {
    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {
        debug: true,
        persistence: "localStorage",
      });
    }
    if (process.env.REACT_APP_AMPLITUDE_TOKEN) {
      amplitude.init(process.env.REACT_APP_AMPLITUDE_TOKEN, undefined, {
        defaultTracking: {
          sessions: true,
          pageViews: true,
          formInteractions: true,
          fileDownloads: true,
        },
        minIdLength: 1,
      });
    }
  });

  useEffect(() => {
    const userId = userProfile.userId;

    if (userId > 0) {
      if (process.env.REACT_APP_MIXPANEL_TOKEN) {
        mixpanel.identify(`${userId}`);
      }
      if (process.env.REACT_APP_SEGMENT_TOKEN) {
        segmentAnalytics.identify(`${userId}`);
      }
      if (process.env.REACT_APP_AMPLITUDE_TOKEN) {
        amplitude.setUserId(`${userId}`);
      }

      if (
        !location.pathname.includes("/app/") ||
        location.pathname === "/login"
      ) {
        navigate(`${site.app}/nodes/start`);
      }
    } else {
      // console.log("Redirect to login page", userProfile);
      // navigate(`${site.web}`);
    }
  }, [userProfile, location.pathname, navigate]);

  useEffect(() => {
    trackPage(location.pathname);
  }, [location]);

  return (
    <>
      <Outlet />
    </>
  );
};

export default React.memo(App);
