import ManuscriptReader from "@src/components/organisms/ManuscriptReader";
import PdfHeader from "@src/components/organisms/PdfHeader";
import useScroll from "@src/hooks/useScroll";
import { useLocation } from "react-router-dom";
import { Popovers } from "./Providers/AppWrapper";
import { useUser } from "@src/state/user/hooks";

// const auth = localStorage.getItem("auth");
export default function PrivateViewer() {
  // page scroll behaviour init hook
  useScroll();
  const user = useUser();
  const location = useLocation();
  // const navigate = useNavigate();
  console.log("Private Viewer", user, location);

  // useEffect(() => {
  //   if (auth) {
  //     if (user) {
  //       if (location.pathname === "/" || location.pathname === "web/magic") {
  //         navigate(`${site.app}${app.nodes}`);
  //       }
  //     }
  //   } else if (location.pathname === "/") {
  //     navigate(`${site.web}${location.search}`);
  //   }
  // }, [user, location.pathname, navigate, location.search]);

  return (
    <div
      id="app-wrapper"
      className={`flex flex-col min-h-screen h-screen`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <PdfHeader />
      <Popovers />
      <div id="app" className="flex-grow">
        <ManuscriptReader />
      </div>
    </div>
  );
}
