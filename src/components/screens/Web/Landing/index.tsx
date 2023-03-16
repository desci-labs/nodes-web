import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import "./style.scss";
import { IconTriangleLeft } from "@icons";
import FormLandingPage from "@src/components/molecules/FormLandingPage";
import { app, site, web } from "@src/constants/routes";
import { useGetUser } from "@src/hooks/useGetUser";
import OrcidButton from "@src/components/molecules/OrcIdAuthButton/OrcIdAuthButton";
import MagicLinkExpired from "../../MagicLinkExpired";
import MagicLink from "../../MagicLink";
import LinkAuth from "../../LinkAuth";

const isOrcIdLoginEnabled = process.env.REACT_APP_ENABLE_ORCID;

/**
 * 
        {isOrcIdLoginEnabled && (
          <div className="text-white my-10">
            <OrcidButton action="AUTH" />
          </div>
        )}
 */

const Landing = () => {
  const { userData, error } = useGetUser();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const refVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth && userData) {
      const shouldRouteToUpdateEmail =
        !userData.email || (userData.email as string).includes("orcid:");

      const shouldRouteToStart =
        location.pathname === "/" ||
        location.pathname === "web/magic" ||
        location.pathname === "/web";

      if (shouldRouteToUpdateEmail && isOrcIdLoginEnabled) {
        navigate(`${site.app}${app.updateEmail}`);
      } else if (shouldRouteToStart) {
        navigate(`${site.app}${app.nodes}/start`);
      }
    }
  }, [userData, error, location.pathname, navigate]);

  useEffect(() => {
    if (!refVideo.current) {
      return;
    }

    //open bug since 2017 that you cannot set muted in video element https://github.com/facebook/react/issues/10389
    refVideo.current.defaultMuted = true;
    refVideo.current.muted = true;
  }, []);

  const WaitlistDisplay = () => {
    return (
      <div className="lg:mt-20">
        <div className="mt-6 sm:max-w-xl">
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-4xl">
            You're on the waitlist!
          </h1>
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-primary ml-2">
            We'll send you an email when your invite is ready.
          </span>
          <span
            className="mt-10 ml-2 flex w-32 items-center text-primary opacity-50 hover:opacity-100 cursor-pointer"
            onClick={() => setDone(false)}
          >
            <IconTriangleLeft fill="rgb(82, 168, 193)" height={12} width={12} />{" "}
            Back
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black lg:min-h-screen lg:-mb-48">
      <div className="py-2 text-tint-primary bg-black w-full font-bold text-center relative z-10">
        DeSci Nodes is in closed alpha (invite-only)
      </div>
      {/* <VideoPlayer /> */}
      <video
        ref={refVideo}
        className="faded-video w-full rounded-md shadow-xl ring-1 ring-black ring-opacity-5 lg:h-full lg:w-3/4 lg:max-w-none lg:absolute lg:-mt-32 lg:-left-40"
        muted={true}
        autoPlay={true}
        loop={true}
        playsInline={true}
        poster="https://d3ibh1pfr1vlpk.cloudfront.net/nodes-cover.jpg"
      >
        <source
          src="https://d3ibh1pfr1vlpk.cloudfront.net/cube-node.webm"
          type="video/webm"
        />
        <source
          src="https://d3ibh1pfr1vlpk.cloudfront.net/cube-node.mp4"
          type="video/mp4"
        />
      </video>
      <div className="bg-black pb-8 sm:pb-12">
        <div className="pt-8 overflow-hidden sm:pt-12 sm:relative lg:py-48 z-10">
          <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 md:px-8 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-24">
            <div></div>
            <Routes>
              <Route
                index
                element={
                  done ? (
                    <WaitlistDisplay />
                  ) : (
                    <div className="flex flex-col">
                      (
                      <FormLandingPage
                        errorMessage={errorMessage}
                        loading={loading}
                        setDone={setDone}
                        setErrorMessage={setErrorMessage}
                        setLoading={setLoading}
                      />
                      )
                      {isOrcIdLoginEnabled && (
                        <div className="text-white my-10">
                          <OrcidButton action="AUTH" />
                        </div>
                      )}
                    </div>
                  )
                }
              />
              <Route
                path={`${web.magicExpired}`}
                element={<MagicLinkExpired />}
              />
              <Route path={web.magic} element={<MagicLink />} />
              <Route path={web.authLink} element={<LinkAuth />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
