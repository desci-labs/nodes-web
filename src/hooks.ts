import { MAX_MOBILE_WIDTH, MIN_DESKTOP_WIDTH } from "@components/utils";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export const useComponentSize = (comRef: any) => {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const sizeObserver = new ResizeObserver((entries, observer) => {
      entries.forEach(({ target }) => {
        setSize({ width: target.clientWidth, height: target.clientHeight });
      });
    });
    sizeObserver.observe(comRef.current);

    return () => sizeObserver.disconnect();
  }, [comRef]);

  return size;
};

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

let HAS_MOUSE = false;

export function useMouseDetection() {
  const [hasMouse, setHasMouse] = useState(HAS_MOUSE);

  useEffect(() => {
    const onMouseMoveHandler = function () {
      setHasMouse(true);
    };
    document.addEventListener("mouseover", onMouseMoveHandler);
    return () => {
      document.removeEventListener("mouseover", onMouseMoveHandler);
    };
  }, []);

  return hasMouse;
}

export const useResponsive = () => {
  const isDesktop = useMediaQuery({ minWidth: MIN_DESKTOP_WIDTH });
  const isTablet = useMediaQuery({
    minWidth: MAX_MOBILE_WIDTH + 1,
    maxWidth: MIN_DESKTOP_WIDTH - 1,
  });
  const isMobile = useMediaQuery({ maxWidth: MAX_MOBILE_WIDTH });

  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  const isRetina = useMediaQuery({ query: "(min-resolution: 2dppx)" });

  return {
    isDesktop,
    isTablet,
    isMobile,
    isPortrait,
    isRetina,
  };
};
