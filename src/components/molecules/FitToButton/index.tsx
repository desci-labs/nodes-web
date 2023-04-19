import React, { useCallback, useEffect, useState } from "react";
import { IconHorizontalExpand, IconVerticalExpand } from "@icons";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "@components/organisms/Paper";
import { useSetter } from "@src/store/accessors";
import { toggleResearchPanel } from "@src/state/nodes/viewer";
import { usePdfReader } from "@src/state/nodes/hooks";
import { setCenteredZoom } from "@src/state/nodes/pdf";

const FitToButton = () => {
  const { zoom } = usePdfReader();
  const dispatch = useSetter();
  const [fitHorizontally, setFitHorizontally] = useState<boolean>(false);

  //will break when the values of the header/sidepanel are no longer static, would need to update it to a global state.
  const headerHeight = 55;
  // const manuscriptSidePanelWidth = 320;

  function handleFitToWidth() {
    setFitHorizontally(!fitHorizontally);
    dispatch(toggleResearchPanel(false));
    const viewWidth = window.innerWidth;
    const padding = 0.2;
    const newZoom = viewWidth / DEFAULT_WIDTH;
    const zoomMagnitude = newZoom - zoom - padding;

    dispatch(setCenteredZoom({ zoomMagnitude: zoomMagnitude }));
  }

  function getHeightMagnitude() {
    const viewHeight = window.innerHeight;
    const padding = 0.01;
    const newZoom = (viewHeight - headerHeight) / DEFAULT_HEIGHT - padding;
    const zoomMagnitude = zoom - newZoom;
    return zoomMagnitude;
  }

  function handleFitToHeight() {
    console.log("fit to height");
    setFitHorizontally(!fitHorizontally);

    const zoomMagnitude = getHeightMagnitude();

    dispatch(setCenteredZoom({ zoomMagnitude: -zoomMagnitude }));
  }

  /** auto full height */
  useEffect(() => {
    const zoomMagnitude = getHeightMagnitude();
    if (zoomMagnitude < 0) {
      handleFitToHeight();
    }
    window.scrollTo({ top: 0 });
  }, []);

  const handleHoriz = useCallback(handleFitToWidth, [handleFitToWidth]);
  const handleVert = useCallback(handleFitToHeight, [handleFitToHeight]);

  return (
    <>
      {fitHorizontally ? (
        <IconHorizontalExpand
          width="20px"
          height="20px"
          fill="rgb(241, 241, 241)"
          className="cursor-pointer hover:fill-neutrals-gray-5"
          onClick={handleHoriz}
        />
      ) : (
        <IconVerticalExpand
          width="20px"
          height="20px"
          fill="rgb(241, 241, 241)"
          className="cursor-pointer hover:fill-neutrals-gray-5"
          onClick={handleVert}
        />
      )}
    </>
  );
};

export default FitToButton;
