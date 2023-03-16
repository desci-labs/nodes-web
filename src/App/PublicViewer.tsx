import ManuscriptReader from "@src/components/organisms/ManuscriptReader";
import PdfHeader from "@src/components/organisms/PdfHeader";
import { app, site } from "@src/constants/routes";
import useScroll from "@src/hooks/useScroll";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Popovers } from "./Providers/AppWrapper";
import { useUser } from "@src/state/user/hooks";

const auth = localStorage.getItem("auth");
export default function PublicViewer() {
  // page scroll behaviour init hook
  useScroll();
  const user = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  console.log("PublicViewer", user, auth);

  useEffect(() => {
    if (auth) {
      if (user) {
        if (location.pathname === "/" || location.pathname === "web/magic") {
          navigate(`${site.app}${app.nodes}`);
        }
      }
    } else if (location.pathname === "/") {
      // location.serach includes the "?"
      navigate(`${site.web}${location.search}`);
    }
  }, [user, location.pathname, navigate, location.search]);

  return (
    <div
      id="app-wrapper"
      className={`flex flex-col min-h-screen h-screen`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <PdfHeader />
      <Popovers />
      <div id="app" className="flex-grow">
        <ManuscriptReader publicView />
      </div>
    </div>
  );
}
