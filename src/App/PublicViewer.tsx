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

const auth = localStorage.getItem("auth");
export default function PublicViewer() {
  // page scroll behaviour init hook
  useScroll();
  const user = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      if (user) {
        if (location.pathname === "/" || location.pathname === "web/magic") {
          navigate(`${site.app}${app.nodes}`);
        }
      }
    } else if (location.pathname === "/") {
      navigate(`${site.web}${location.search}`);
    }
  }, [user, location.pathname, navigate, location.search]);

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
