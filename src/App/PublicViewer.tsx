import { useEffect } from "react";
import useScroll from "@src/hooks/useScroll";
import { useUser } from "@src/state/user/hooks";
import { isMobile } from "react-device-detect";
import { app, site } from "@src/constants/routes";
import { Popovers } from "./Providers/AppWrapper";
import { useLocation, useNavigate } from "react-router-dom";
import PdfHeader from "@src/components/organisms/PdfHeader";
import ManuscriptReader from "@src/components/organisms/ManuscriptReader";
import MobileReader from "@src/components/organisms/ManuscriptReader/MobileReader/MobileReader";
import { useSetter } from "@src/store/accessors";
import { tags } from "@src/state/api/tags";
import { api } from "@src/state/api";

// const auth = localStorage.getItem("auth");
export default function PublicViewer() {
  // page scroll behaviour init hook
  useScroll();
  const user = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useSetter();

  useEffect(() => {
    dispatch(api.util.invalidateTags([{ type: tags.user }]));
    // console.log("auth", auth, user);

    // if (!auth && location.pathname === "/") {
    //   navigate(`${site.web}${location.search}`);
    //   return;
    // }

    if (user && user.userId > 0) {
      if (location.pathname === "/" || location.pathname === "web/magic") {
        navigate(`${site.app}${app.nodes}/start`);
      }
    } else {
      // navigate(`${site.web}${location.search}`);
      // localStorage.removeItem("auth");
    }
  }, [user, location.pathname, navigate, location.search, dispatch]);

  return (
    <div
      id="app-wrapper"
      className={`flex flex-col min-h-screen h-screen`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {!isMobile && (
        <>
          <PdfHeader />
          <Popovers />
        </>
      )}
      <div id="app" className="flex-grow">
        {isMobile ? (
          <MobileReader publicView />
        ) : (
          <ManuscriptReader publicView />
        )}
      </div>
    </div>
  );
}
