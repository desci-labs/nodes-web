import { TOOLBAR_ENTRY } from "@src/components/organisms/Toolbar";

export type Orcid = {
  orcidData: any;
  orcidJwt: string;
  loading: boolean;
  checking: boolean;
};

export type AppPreferences = {
  theme: "light" | "dark";
  torusKey: any;
  hideHeader: boolean;
  hideFooter: boolean;
  checkingCode: boolean;
  orcid: Orcid;
  isToolbarVisible: boolean;
  activeToolbar: TOOLBAR_ENTRY;
  showReferralModal: boolean;
};
