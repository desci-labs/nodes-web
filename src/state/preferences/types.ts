import { TOOLBAR_ENTRY } from "@src/components/organisms/Toolbar";

export type Orcid = {
  orcidData: any;
  orcidJwt: string;
  loading: boolean;
  checking: boolean;
};

export type AppPreferences = {
  theme: "light" | "dark";
  orcid: Orcid;
  torusKey: any;
  hideHeader: boolean;
  hideFooter: boolean;
  checkingCode: boolean;
  isMobileView: boolean;
  isToolbarVisible: boolean;
  showReferralModal: boolean;
  mobileViewWarning: boolean;
  activeToolbar: TOOLBAR_ENTRY;
  showMobileComponentStack: boolean;
  showProfileRegistration: boolean;
};
