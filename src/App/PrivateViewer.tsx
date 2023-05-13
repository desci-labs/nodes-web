import useScroll from "@src/hooks/useScroll";
import { isMobile } from "react-device-detect";
import { Popovers } from "./Providers/AppWrapper";
import PdfHeader from "@src/components/organisms/PdfHeader";
import ManuscriptReader from "@src/components/organisms/ManuscriptReader";
import MobileReader from "@src/components/organisms/ManuscriptReader/MobileReader/MobileReader";

export default function PrivateViewer() {
  // page scroll behaviour init hook
  useScroll();

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
        {isMobile ? <MobileReader /> : <ManuscriptReader publicView={false} />}
      </div>
    </div>
  );
}
