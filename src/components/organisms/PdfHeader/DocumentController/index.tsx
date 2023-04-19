import React, { useRef, useState } from "react";
import styled from "styled-components";
import Control from "./Control";
import PaginationControl from "./Control/PaginationControl";
import ZoomControl from "./Control/ZoomControl";
import { IconDownloadPdf } from "@icons";
import FitToButton from "@components/molecules/FitToButton";

import {
  PdfComponent,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import axios from "axios";
import { cleanupManifestUrl } from "@components/utils";
import ReactTooltip from "react-tooltip";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { toggleMode, toggleResearchPanel } from "@src/state/nodes/viewer";

const Wrapper = styled.div.attrs({
  className: "flex items-center relative",
})`
  margin-top: 1px;
  font-family: Mulish, "Segoe UI", Tahoma, sans-serif !important;
`;

const ControllerDivider = styled.div.attrs({
  className: "mx-4 relative",
})`
  background: rgba(255, 255, 255, 0.3);
  height: 15px;
  width: 1px;
`;

interface DocumentControllerProps {}

const DocumentController = (props: DocumentControllerProps) => {
  const { manifest: manifestData, mode, componentStack } = useNodeReader();
  const dispatch = useSetter();

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const resetTooltip = () => {
    ReactTooltip.rebuild();
    if (isMounted) {
      ReactTooltip.hide();
      ReactTooltip.show(editButtonRef.current!);
    } else {
      setIsMounted(true);
    }
  };

  return (
    <Wrapper>
      <PaginationControl />
      <ControllerDivider style={{ left: 2 }} />
      <ZoomControl />
      <ControllerDivider />
      <Control>
        <div className="flex flex-row gap-4 ml-1 mr-1">
          <FitToButton />
          <IconDownloadPdf
            width="20px"
            fill="rgb(241, 241, 241)"
            className={`cursor-pointer ${
              isDownloading
                ? "animate-[pulse_0.8s_ease-in-out_infinite]"
                : "hover:fill-neutrals-gray-5"
            } mt-[1.5px]`}
            onClick={() => {
              const selectedComponent = manifestData?.components.find(
                (a) => a.id === componentStack[componentStack.length - 1].id
              );
              setIsDownloading(true);
              postUserAction(
                AvailableUserActionLogTypes.btnDownloadManuscript,
                JSON.stringify({ objectId: selectedComponent?.id || "" })
              );
              if (
                selectedComponent &&
                selectedComponent.type === ResearchObjectComponentType.PDF
              ) {
                let url = cleanupManifestUrl(
                  (selectedComponent as PdfComponent).payload.url
                );
                axios({
                  url,
                  method: "GET",
                  responseType: "blob", // important
                })
                  .then((response: any) => {
                    const url2 = window.URL.createObjectURL(
                      new Blob([response.data])
                    );
                    const link = document.createElement("a");
                    link.href = url2;
                    link.setAttribute(
                      "download",
                      `${selectedComponent.name.replaceAll(
                        " ",
                        "_"
                      )}__nodes.desci.com__${
                        url.split("/")[url.split("/").length - 1]
                      }.pdf`
                    ); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                  })
                  .finally(() => {
                    setTimeout(() => {
                      setIsDownloading(false);
                    }, 500);
                  });
              }
            }}
          />
        </div>
      </Control>
      {/* // TODO: Only display the (Edit/Preview) button for auth & Guarded users  */}
      <div className="invisible absolute -right-36 w-36 flex h-[15px]">
        <ControllerDivider />
        <button
          ref={(ref) => ((editButtonRef as any).current = ref)}
          data-tip={mode === "editor" ? "View as a reader" : "Edit your object"}
          data-place="bottom"
          onClick={() => {
            if (mode !== "editor") {
              // setIsResearchPanelOpen(true);
              dispatch(toggleResearchPanel(true));
            }
            // toggleMode();
            dispatch(toggleMode());
            // setTimeout(triggerTooltips);
            resetTooltip();
          }}
          className={`w-20 cursor-pointer transition-colors px-4 leading-none text-xs py-0 h-[24px] rounded-md -mt-[4px] whitespace-nowrap bg-gray-900 text-gray-100 hover:bg-gray-800`}
        >
          {mode === "editor" ? "Preview" : "Edit"}
        </button>
      </div>
    </Wrapper>
  );
};

export default React.memo(DocumentController);
