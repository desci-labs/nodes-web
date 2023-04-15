import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconZoomIn, IconZoomOut } from "@icons";
import styled from "styled-components";
import Control from ".";
import { MAX_ZOOM, MIN_ZOOM } from "@components/organisms/Paper";
import { usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setZoom, zoomIn, zoomOut } from "@src/state/nodes/pdf";

const Wrapper = styled.div.attrs({
  className: "flex flex-row gap-2 -ml-1",
})``;

interface ZoomControlProps {}

const format = (num: number) => `${Math.round(num * 100)}%`;

const ZoomControl = (props: ZoomControlProps) => {
  const dispatch = useSetter();
  const { zoom } = usePdfReader();
  const [localZoom, setLocalZoom] = useState(format(zoom));

  useEffect(() => {
    setLocalZoom(format(zoom));
  }, [zoom]);

  const handleUpdate = () => {
    let newZoom = parseInt(localZoom.replaceAll("%", "")) / 100;
    if (newZoom > MAX_ZOOM) {
      newZoom = MAX_ZOOM;
    }
    if (newZoom < MIN_ZOOM) {
      newZoom = MIN_ZOOM;
    }

    dispatch(setZoom(newZoom));
    setLocalZoom(format(zoom));
  };

  const inputEl = useRef<HTMLInputElement>(null);

  return (
    <Control>
      <Wrapper>
        <IconZoomOut
          width="20px"
          fill="rgb(241, 241, 241)"
          className="cursor-pointer select-none pl-[1.5px] pr-[3px] hover:fill-neutrals-gray-5"
          onClick={useCallback(() => dispatch(zoomOut()), [dispatch, zoomOut])}
        />
        <input
          key="zoom-control-box"
          type="text"
          ref={inputEl}
          value={localZoom}
          className="px-1 py-0 bg-[#191b1c] focus:outline-none focus:border-transparent focus:ring-0 text-center font-pdf outline-none border-0 w-[44px] h-[20px]"
          style={{ fontSize: 13, touchAction: "none" }}
          onChange={(e) => {
            setLocalZoom(e.currentTarget.value.replaceAll(/[^\d%]/g, ""));
          }}
          onFocus={(e) => {
            if (inputEl && inputEl.current) {
              inputEl.current.select();
            }
          }}
          onKeyUp={(e) => {
            // handle enter
            if (e.key == "Enter") {
              handleUpdate();
            }
          }}
          onBlur={handleUpdate}
        />
        <IconZoomIn
          width="20px"
          fill="rgb(241, 241, 241)"
          className="cursor-pointer select-none hover:fill-neutrals-gray-5"
          onClick={useCallback(() => dispatch(zoomIn()), [dispatch, zoomIn])}
        />
      </Wrapper>
    </Control>
  );
};

export default ZoomControl;
