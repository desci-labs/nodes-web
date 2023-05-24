import Footer from "@src/components/organisms/Footer";
import PdfHeader from "@src/components/organisms/PdfHeader";
import { PropsWithChildren } from "react";
import useScroll from "@src/hooks/useScroll";
import useCheckOrcid from "@src/hooks/useCheckOrcid";
import Toolbar from "@src/components/organisms/Toolbar";
import { useUser } from "@src/state/user/hooks";
import ProfilePopOver from "@src/components/screens/Profile";
import { useGetter } from "@src/store/accessors";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

export default function AppWrapper(props: PropsWithChildren<{}>) {
  const userProfile = useUser();
  const { hideFooter, checkingCode, isMobileView } = useGetter(
    (state) => state.preferences
  );

  // page scroll behaviour init hook
  useScroll();

  // Orchid checker init
  useCheckOrcid();

  return (
    <>
      <div
        id="app-wrapper"
        className={`flex flex-col min-h-screen h-screen`}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {!isMobileView && (
          <>
            <PdfHeader />
            <Toolbar />
            <Popovers />
          </>
        )}

        {checkingCode ||
        ((!userProfile || !(userProfile as any).userId) &&
          localStorage.getItem("auth")) ? (
          <div className="fixed z-[101] bg-[#525659] h-screen w-screen">
            {!isMobileView && <PdfHeader />}
            <div className="w-full absolute z-[102] top-[52px] rounded-full h-[3px]">
              <div
                className={`${"bg-tint-primary"} h-[3px]`}
                style={{
                  width: `7px`,
                  animation: "pulse 0.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              ></div>
            </div>
          </div>
        ) : null}
        {props.children}
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}

export function Popovers() {
   const { showProfileUpdater, setShowProfileUpdater } = useManuscriptController([
     "showProfileUpdater",
   ]);
  return (
    <>
      {showProfileUpdater && <ProfilePopOver onClose={() => setShowProfileUpdater(false)} />}
    </>
  );
}
