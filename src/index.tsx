import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "flowbite"; // required for react tooltip
import "react-loading-skeleton/dist/skeleton.css";
// fix ugly scrollbars in windows browsers
import "react-perfect-scrollbar/dist/css/styles.css";
import "./index.css";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import reportWebVitals from "./reportWebVitals";
import { site } from "./constants/routes";
import AppProviders from "./App/Providers/AppProviders";
import PublicViewer from "./App/PublicViewer";
import Placeholder from "./components/organisms/ManuscriptReader/Placeholder";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
const Terms = lazy(() => import("./components/screens/Terms"));
const Privacy = lazy(() => import("./components/screens/Privacy"));
const App = lazy(() => import("@src/App/App"));
const BetaWeb = lazy(() => import("./components/screens/Web/BetaWeb"));
const Web = lazy(() => import("./components/screens/Web"));

if (
  process.env.REACT_APP_NODES_API &&
  process.env.REACT_APP_NODES_API.indexOf("localhost") < 0
) {
  Sentry.init({
    release: "desci-nodes-dapp@" + process.env.REACT_APP_VERSION,
    dsn: "https://c360e0383cf844aa9ad2092ef338d5a6@o1330109.ingest.sentry.io/6592441",
    integrations: [new BrowserTracing()],
    environment:
      process.env.REACT_APP_NODES_API.indexOf("-dev") < 0
        ? "production"
        : "dev",
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProviders>
          <BrowserRouter>
            <Suspense fallback={<Placeholder isLoading={true} fullHeight />}>
              <Routes>
                <Route path={`${site.app}/*`} element={<App />} />
                <Route path={`${site.web}/*`} element={<BetaWeb />} />
                <Route path={site.terms} element={<Terms />} />
                <Route path={site.privacy} element={<Privacy />} />
                <Route path="/*" element={<PublicViewer />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppProviders>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
(window as any).reportWebVitals = reportWebVitals;

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
