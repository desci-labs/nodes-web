import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import "flowbite"; // required for react tooltip
import "react-loading-skeleton/dist/skeleton.css";
// fix ugly scrollbars in windows browsers
import "react-perfect-scrollbar/dist/css/styles.css";
import { site } from "@src/constants/routes";
import PublicViewer from "@src/App/PublicViewer";
import Placeholder from "@src/components/organisms/ManuscriptReader/Placeholder";
import Invite from "@src/components/screens/Invite";
import AdminPanel from "@src/components/screens/AdminPanel";
import {
  OrcIdAuthParseJwt,
  OrcIdConnectUpdateProfile,
} from "@src/components/screens/OrcIdOAuth/OrcIdOAuthScreen";
import PoiLookup from "@src/components/screens/PoiLookup";
import Nodes, { manuscriptLoader } from "@src/components/screens/Nodes";
import Profile from "@src/components/organisms/PaneUserProfile";
import UpdateEmailScreen from "@src/components/organisms/UpdateEmail/UpdateEmailScreen";
import AdminAnalyticsScreen from "@src/components/screens/adminAnalyticsScreen";
import PaneHelp from "@src/components/organisms/PaneHelp";
import AppWrapper from "@src/App/Providers/AppWrapper";
import PaneNodeCollection from "@src/components/organisms/PaneNodeCollection";
import ManuscriptReader from "@src/components/organisms/ManuscriptReader";

const Terms = lazy(() => import("@src/components/screens/Terms"));
const Privacy = lazy(() => import("@src/components/screens/Privacy"));
const App = lazy(() => import("@src/App/App"));
const BetaWeb = lazy(() => import("@src/components/screens/Web/BetaWeb"));

export const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path={`${site.app}/*`}
        loader={(args) => {
          console.log("Load App Data", args);
          return { args };
        }}
        element={
          <Suspense fallback={<Placeholder isLoading={true} fullHeight />}>
            <AppWrapper>
              <div id="app" className="flex-grow">
                <App />
              </div>
            </AppWrapper>
          </Suspense>
        }
      >
        <Route path="orcid/connect" element={<OrcIdConnectUpdateProfile />} />
        <Route path="orcid/auth" element={<OrcIdAuthParseJwt />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="admin/analytics" element={<AdminAnalyticsScreen />} />
        <Route path="invite" element={<Invite />} />
        <Route path="poi-lookup" element={<PoiLookup />} />
        <Route path="nodes/*" element={<Nodes />}>
          <Route path="start" element={<PaneNodeCollection />} />
          <Route path="objects/*">
            <Route
              path=":cid"
              loader={manuscriptLoader}
              element={<ManuscriptReader />}
            />
          </Route>
          <Route index element={<Navigate to="start" />} />
        </Route>
        <Route path="profile" element={<Profile />} />
        <Route path="updateEmail" element={<UpdateEmailScreen />} />
        <Route path="help" element={<PaneHelp />} />
        <Route path=":url*(/+)" element={<Navigate replace to="nodes/*" />} />
        {/* <Route path="/*" element={<Nodes />} /> */}
      </Route>
      <Route
        path={`${site.web}/*`}
        element={
          <Suspense fallback={<Placeholder isLoading={true} fullHeight />}>
            <BetaWeb />
          </Suspense>
        }
      />
      <Route
        path={site.terms}
        element={
          <Suspense fallback={<Placeholder isLoading={true} fullHeight />}>
            <Terms />
          </Suspense>
        }
      />
      <Route
        path={site.privacy}
        element={
          <Suspense fallback={<Placeholder isLoading={true} fullHeight />}>
            <Privacy />
          </Suspense>
        }
      />
      <Route path="/*" element={<PublicViewer />} loader={manuscriptLoader} />
    </>
  )
);
