import { PropsWithChildren } from "react";
import { ThemeProvider } from "@components/themeContext";
import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components";
import Web3Provider from "@src/components/organisms/WalletSwitcher/Web3Provider";
import { Toaster } from "react-hot-toast";
import ReactTooltip from "react-tooltip";
import PreferencUpdater from "@src/state/preferences/updater";
import UserUpdater from "@src/state/user/updater";
export const USE_ORCID_JWT = true;

const DEFAULT_THEME = {
  colors: {
    primary: "#323367",
    onPrimary: "#FFFFFF",
    secondary: "#202020",
    onSecondary: "#FFFFFF",
    surface: "#000000",
    onSurface: "#FFFFFF",
  },
};

function Updaters() {
  return (
    <>
      <PreferencUpdater />
      <UserUpdater />
    </>
  );
}

export default function AppProviders(props: PropsWithChildren<{}>) {
  return (
    <Web3Provider>
      <Updaters />
      <StyledComponentsThemeProvider theme={DEFAULT_THEME}>
        <ThemeProvider>
          <Toaster />
          <ReactTooltip effect="solid" backgroundColor="black" />
          {props.children}
        </ThemeProvider>
      </StyledComponentsThemeProvider>
    </Web3Provider>
  );
}
