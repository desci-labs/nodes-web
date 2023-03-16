import React from "react";
import "./style.scss";
import AppWrapper from "./Providers/AppWrapper";
import Views from "./Views";
export const USE_ORCID_JWT = true;

console.log(`[starting DeSci Nodes v${process.env.REACT_APP_VERSION}]`);

const App = () => {
  return (
    <AppWrapper>
      <div id="app" className="flex-grow">
        <Views />
      </div>
    </AppWrapper>
  );
};

export default React.memo(App);
