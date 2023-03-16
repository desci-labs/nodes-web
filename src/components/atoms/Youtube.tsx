import { IconPlay } from "@icons";
import React, { useEffect } from "react";
import YoutubePlayer from "react-yt";
import styled from "styled-components";

const VideoResponsive = styled.div`
  overflow: hidden;
  padding-bottom: 56.25%;
  position: relative;
  height: 0;

  iframe {
    left: 0;
    top: 0;
    position: fixed;
    top: calc(55px - 80px);
    width: calc(100% - 320px);
    height: calc(100vh - 58px + 260px);
    // max-height: calc(82vh - 58px);
    .ytp-impression-link {
      display: none;
    }
  }
`;

const Youtube = ({ embedId }: any) => {
  useEffect(() => {
    // setTimeout(() => {
    //   const iframe = document.getElementById("video-frame");
    //   (
    //     (iframe as any).contentWindow.document.getElementsByClassName("ytp-impression-link")[0] as any
    //   ).style.display = "none";
    // }, 1000);
  });
  return (
    <VideoResponsive>
      <YoutubePlayer
        color="white"
        controls={0}
        videoId={embedId}
        render={({ iframe, playVideo, pauseVideo, getPlayerState }: any) => (
          <div>
            {getPlayerState() !== 1 && (
              <button
                style={{
                  position: "fixed",
                  top: "calc(50vh + 20px)",
                  left: "calc(50% - 210px)",
                  zIndex: 101,
                  height: 100,
                  width: 100,
                  background: "#333",
                  paddingLeft: 12,
                }}
                className="rounded-xl"
                onClick={(event) => playVideo()}
              >
                <IconPlay height={60} width={80} fill={"#999"} />
              </button>
            )}
            {getPlayerState() == 1 && (
              <button
                style={{
                  position: "fixed",
                  top: "calc(50vh + 20px)",
                  left: "calc(50% - 210px)",
                  zIndex: 99,
                  height: 100,
                  width: 100,
                  paddingLeft: 12,
                }}
                className="group hover:bg-[#333333] rounded-xl"
                onClick={(event) => pauseVideo()}
              >
                <div className="invisible group-hover:visible ">
                  <div className="border-8 border-t-0 border-b-0 border-[#999999] w-12 mx-auto ml-3 h-14"></div>
                </div>
              </button>
            )}
            <div style={{ position: "relative", pointerEvents: "none" }}>
              <div className="pointer-events-none">{iframe}</div>
            </div>
          </div>
        )}
      />
    </VideoResponsive>
  );
};

export default Youtube;
