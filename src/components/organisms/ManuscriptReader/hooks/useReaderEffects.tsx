import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { site } from "@src/constants/routes";
import { useSetter } from "@src/store/accessors";
import { setPreferences } from "@src/state/preferences/preferencesSlice";
import jwtDecode from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOOLBAR_ENTRY } from "../../Toolbar";
import { useManuscriptController } from "../ManuscriptController";
import useParseObjectID from "../useParseObjectID";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { useUser } from "@src/state/user/hooks";
import { useNodeReader } from "@src/state/nodes/hooks";
import { setComponentStack, toggleMode } from "@src/state/nodes/viewer";

export default function useReaderEffects(publicView: boolean = false) {
  const cid = useParseObjectID();
  const dispatch = useSetter();
  const { isAddingComponent, isAddingSubcomponent, setIsAddingComponent } =
    useManuscriptController(["isAddingComponent", "isAddingSubcomponent"]);
  const {
    manifest: manifestData,
    mode,
    currentObjectId,
    componentStack,
  } = useNodeReader();

  const navigate = useNavigate();
  const userProfile = useUser();
  const [, setMounted] = useState(false);

  useEffect(() => {
    dispatch(setPreferences({ hideFooter: true, hideHeader: true }));
    if (publicView && mode !== "reader") {
      dispatch(toggleMode());
    } else {
      setMounted(true);
    }

    return () => {
      dispatch(setPreferences({ hideFooter: false, hideHeader: false }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, publicView]);

  /**
   * Ensure user is auth'd
   */
  // TODO: move to auth provider logic to refresh expired jwt token
  useEffect(() => {
    if (userProfile?.userId > 0) {
      if (!cid || !cid.length) {
        //  || cid.startsWith(RESEARCH_OBJECT_NODES_PREFIX)
        console.log(
          "RESOLVE::=====================================================>",
          cid
        );
        let invalidJwt = true;
        let token = localStorage.getItem("auth");

        try {
          if (token) {
            const decoded: any = jwtDecode<any>(token);
            invalidJwt = !decoded.email;
            // setUserProfile(userData);
            api.util.invalidateTags([tags.user]);
            console.log("[useReaderEffects]::Refresh User data");
          }
        } catch (err) {
          console.error("jwt decode", err);
        }

        if (invalidJwt) {
          console.error("no user auth, go to /", userProfile);
          navigate(site.web);
        }

        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  /**
   * isNew = show the Create Node Screen
   */
  useEffect(() => {
    if (!cid || !cid.length || cid.includes("/start")) {
      if (userProfile && mode !== "reader") {
        /**
         * Default view when on nodes/start
         */
        dispatch(
          setPreferences({
            isToolbarVisible: true,
            activeToolbar: TOOLBAR_ENTRY.collection,
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  /**
   * Ensure the Node drive is not seen without a component added
   */
  useEffect(() => {
    if (
      !currentObjectId &&
      !isAddingSubcomponent &&
      !isAddingComponent &&
      (manifestData?.components.length || 0) < 1 &&
      window.location.pathname === "app/nodes/start"
    ) {
      setIsAddingComponent(true);
    }
  }, [
    isAddingComponent,
    manifestData,
    setIsAddingComponent,
    isAddingSubcomponent,
    currentObjectId,
  ]);

  /**
   * Check to make sure if there are no components, to render the drive
   */
  useEffect(() => {
    const nonDataComponents = manifestData?.components
      ? manifestData.components.filter(
          (a) =>
            a.type !== ResearchObjectComponentType.DATA &&
            a.type !== ResearchObjectComponentType.DATA_BUCKET &&
            a.type !== ResearchObjectComponentType.UNKNOWN
        )
      : [];

    if (nonDataComponents.length < 1 && componentStack.length > 0) {
      // console.log("Clear component stack", nonDataComponents);
      // setComponentStack([]);
      dispatch(setComponentStack([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentStack, manifestData]);
}
