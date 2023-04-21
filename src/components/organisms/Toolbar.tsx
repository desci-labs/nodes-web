import React, { useEffect, useState } from "react";
import { PresentationChartBarIcon } from "@heroicons/react/outline";
import { lockScroll, restoreScroll } from "@components/utils";
import { IconAuthor, IconHelp, IconNodeCollection } from "@icons";
import PaneNodeCollection from "./PaneNodeCollection";
import PaneUserProfile from "./PaneUserProfile";
import { app, site } from "@src/constants/routes";
import { Link, useLocation } from "react-router-dom";
import PaneHelp from "./PaneHelp";
import { useGetter, useSetter } from "@src/store/accessors";
import {
  setActiveToolbar,
  toggleToolbar,
} from "@src/state/preferences/preferencesSlice";
import AdminAnalyticsScreen from "../screens/adminAnalyticsScreen";
import { useGetUser } from "@src/hooks/useGetUser";
import { AppPreferences } from "@src/state/preferences/types";

export enum TOOLBAR_ENTRY {
  collection,
  drive,
  profile,
  latex,
  help,
  adminAnalytics,
}

interface ToolbarIconsProps {
  Icon: React.FC<React.SVGProps<any> | any>;
  Pane: React.FC<any>;
  name: TOOLBAR_ENTRY;
  isActive?: boolean;
  route: string;
  isAdminOnly?: boolean;
}

const ToolbarIcon = ({ Icon, name, isActive, route }: ToolbarIconsProps) => {
  const dispatch = useSetter();

  return (
    <Link
      to={route}
      className={`flex justify-center w-full p-[12.5px] hover:bg-neutrals-gray-2 cursor-pointer ${
        isActive ? "bg-neutrals-gray-2" : ""
      }`}
      onClick={() => dispatch(setActiveToolbar(name))}
    >
      <div className="rounded-full border-[1.5px]  border-tint-primary w-10 h-10 flex justify-center items-center p-[8px]">
        <Icon fill="white" width="100%" height="100%" />
      </div>
    </Link>
  );
};

const DURATION_FADE_OUT = 300; /** Changing this is not enough, change duration-300 in shouldPaneOverlay element below as well */

const buttons: ToolbarIconsProps[] = [
  {
    Icon: IconNodeCollection,
    Pane: PaneNodeCollection,
    name: TOOLBAR_ENTRY.collection,
    route: `${site.app}${app.nodes}`,
  },
  {
    Icon: IconAuthor,
    Pane: PaneUserProfile,
    name: TOOLBAR_ENTRY.profile,
    route: `${site.app}${app.profile}`,
  },
  {
    Icon: IconHelp,
    Pane: PaneHelp,
    name: TOOLBAR_ENTRY.help,
    route: `${site.app}${app.help}`,
  },
  {
    Icon: PresentationChartBarIcon,
    Pane: AdminAnalyticsScreen,
    name: TOOLBAR_ENTRY.adminAnalytics,
    route: `${site.app}${app.adminAnalytics}`,
    isAdminOnly: true,
  },
];
const Toolbar = () => {
  const location = useLocation();
  const { userData } = useGetUser();
  const [isAdmin, setIsAdmin] = useState(false);

  const dispatch = useSetter();
  const { activeToolbar, isToolbarVisible } = useGetter(
    (state) => state.preferences
  ) as AppPreferences;

  useEffect(() => {
    if (activeToolbar == TOOLBAR_ENTRY.collection) {
      dispatch(toggleToolbar(false));
    }
  }, [activeToolbar]);

  const closePane = () => {
    restoreScroll();
  };

  const openPane = () => {
    lockScroll();
  };

  useEffect(() => {
    if (userData && userData.email?.includes("@desci.com")) {
      setIsAdmin(true);
    }
  }, [userData]);

  useEffect(() => {
    if (isToolbarVisible) {
      openPane();
    } else {
      setTimeout(() => {
        closePane();
      }, DURATION_FADE_OUT);
    }
  }, [isToolbarVisible]);

  useEffect(() => {
    if (isToolbarVisible) {
      document.onkeydown = (e) => {
        if (e.key === "Escape") {
          dispatch(toggleToolbar(false));
          closePane();
        }
      };
    }
    return () => {
      document.onkeydown = null;
    };
  }, [dispatch, isToolbarVisible]);

  const buttonsToDisplay = buttons.filter((btn) => {
    if (btn.isAdminOnly) {
      return isAdmin;
    } else {
      return true;
    }
  });

  const Pane = (buttons.find((a) => a.name === activeToolbar) || buttons[0])
    .Pane;

  return (
    <>
      <div
        className={`h-screen bg-neutrals-black-2 w-16 fixed left-0 ${
          isToolbarVisible ? "z-[103]" : ""
        } top-0 drop-shadow-md pt-14 transition-transform 
      ${
        isToolbarVisible
          ? "translate-x-0 duration-100 "
          : "-translate-x-16 duration-100"
      }`}
      >
        <div className="flex flex-col items-center z-[105] fixed left-0 bg-neutrals-black-2 h-full">
          {buttonsToDisplay.map((b) => (
            <ToolbarIcon
              {...b}
              isActive={location.pathname.includes(b.route)}
              key={b.name}
            />
          ))}
        </div>
      </div>
      <div
        className={`h-screen w-screen fixed z-[102] left-0 pl-16 pt-14 top-0 transition-opacity duration-150 bg-neutrals-black ${
          isToolbarVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Pane />
      </div>
    </>
  );
};

export default React.memo(Toolbar);
