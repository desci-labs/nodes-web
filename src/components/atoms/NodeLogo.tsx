import React, { useState } from "react";
import { IconDesciNodes } from "@icons";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { TOOLBAR_ENTRY } from "../organisms/Toolbar";
import { useNavigate } from "react-router-dom";
import { useGetter, useSetter } from "@src/store/accessors";
import {
  setActiveToolbar,
  toggleToolbar,
} from "@src/state/preferences/preferencesSlice";
import { useNodeReader } from "@src/state/nodes/hooks";
import { toggleResearchPanel } from "@src/state/nodes/viewer";

const NodeLogo = () => {
  const { isResearchPanelOpen, componentStack } = useNodeReader();
  const dispatch = useSetter();
  const { activeToolbar, isToolbarVisible } = useGetter(
    (state) => state.preferences
  );
  const [hidden] = useState(false);
  const [showing] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();

  const dismissToolbar = () => {
    dispatch(toggleToolbar(false));

    if (activeToolbar === TOOLBAR_ENTRY.help) {
      dispatch(setActiveToolbar(TOOLBAR_ENTRY.collection));
      navigate("/app");
    }

    if (!isToolbarVisible) {
      if (
        componentStack.length &&
        componentStack[componentStack.length - 1].type ===
          ResearchObjectComponentType.PDF &&
        isResearchPanelOpen
      ) {
        dispatch(toggleResearchPanel(false));
        return;
      }
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 150);
    }
  };

  return (
    <div
      className={`cursor-pointer mt-[1px] transition-all overflow-hidden rounded-3xl bg-[#191B1C] flex flex-row p-0.5 items-center ml-1 min-h-[34px] ${
        isShaking ? "shake-signal" : ""
      }`}
      style={{ width: hidden && !showing ? 42 : 150 }}
      onClick={dismissToolbar}
    >
      <div className="rounded-3xl bg-[#222429] p-1 py-0 flex items-center relative">
        <div className="px-2">
          <IconDesciNodes width={22} height={22} stroke="#28AAC4" />
        </div>
        {/* <img src="https://desci-labs-public.s3.amazonaws.com/protocol-labs-logo-white.svg" className="w-32" /> */}
        <div
          className="font-bold text-sm w-[6.3rem] text-white pl-0 min-h-[30px] leading-[30px] align-middle select-none"
          style={{ fontFamily: "Inter" }}
        >
          DeSci Nodes
          {/* <span className="text-[8px] absolute -top-1 pl-0.5 text-gray-400">Beta</span> */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NodeLogo);
