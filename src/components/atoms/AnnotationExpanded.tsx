import AnnotationContextMenu from "@components/molecules/AnnotationContextMenu";
import { Annotation } from "@desci-labs/desci-models";
import SlideDown from "react-slidedown";
import ButtonCopyLink from "@components/atoms/ButtonCopyLink";
import { IconLeftArrowThin, IconRightArrowThin } from "@icons";
import AnnotationEditor from "@components/molecules/AnnotationEditor";
import { getPublishedVersions } from "@api/index";
import React, { useEffect, useState } from "react";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setAnnotationSwitchCall } from "@src/state/nodes/pdf";
interface AnnotationExpandedProps {
  DURATION_BASE_MS: number;
  annotationTitle: string;
  annotationText: string;
  annotation: Annotation;
  mode: string;
  darkMode?: boolean;
}

const AnnotationExpanded = ({
  DURATION_BASE_MS,
  annotationTitle,
  annotationText,
  annotation,
  mode,
  darkMode,
}: AnnotationExpandedProps) => {
  const dispatch = useSetter();

  const {
    manifest: manifestData,
    currentObjectId,
    componentStack,
  } = useNodeReader();
  const { hoveredAnnotationId, selectedAnnotationId } = usePdfReader();
  const [copyLink, setCopyLink] = useState<string>("");
  const [visible, setVisible] = useState(hoveredAnnotationId != annotation.id);

  useEffect(() => {
    const getCopyLink = async () => {
      const selectedComponent = componentStack[0];
      const componentIndex = manifestData?.components.findIndex(
        (c) => c.id === selectedComponent.id
      );

      const annotationIndex = selectedComponent?.payload.annotations.findIndex(
        (a: any) => a.id === annotation.id
      );

      //default set the version to 0, assuming no version has yet been published
      let ver: number = 0;
      //if the user provides a desired version in the uri, set it to that version
      const path = window.location.pathname.split("/");
      console.log("path[1]: ", path[1]);
      if (path.length > 1 && !isNaN(parseInt(path[1]))) {
        ver = parseInt(path[1]);
      } else {
        //if desired version doesn't exist in path, try get the latest version and assign it if it exists
        try {
          const versionData = await getPublishedVersions(currentObjectId!);
          if (versionData) ver = versionData.versions.length - 1;
        } catch (e: any) {
          console.log("unpublished");
        }
      }

      //version/componentIndex/a{annotationIndex}
      const link = `${window.location.protocol}//${window.location.host}/${currentObjectId}/${ver}/${componentIndex}/a${annotationIndex}`;
      setCopyLink(link);
    };
    getCopyLink();

    setVisible(true);
  }, []);

  const isHovered = hoveredAnnotationId === annotation.id;
  const isSelected = selectedAnnotationId === annotation.id;

  return (
    <div className={`${isHovered && !isSelected ? "cursor-pointer" : ""}`}>
      <div
        className={`rounded-xl px-4 shadow-2xl annotation-item 
        ${isHovered && !isSelected ? "pointer-events-none" : ""} ${
          darkMode ? "bg-neutrals-gray-1" : "bg-white"
        } ${visible ? "opacity-100" : "opacity-0"} duration-100 relative`}
        style={{
          width: 355,
          transition: `opacity ease-in 250ms, width 0ms ease, border-bottom-right-radius 0s`,
        }}
      >
        <header
          className={`border-b ${
            darkMode ? "border-neutrals-gray-2" : "border-neutrals-gray-7"
          } border-dark flex items-center justify-between h-[40px]`}
        >
          <div className={`flex gap-1 -ml-[10px]`}>
            <div
              className={`cursor-pointer ${
                darkMode
                  ? "hover:bg-neutrals-gray-3 active:bg-black"
                  : "hover:bg-neutrals-gray-7 text-black"
              } flex justify-center items-center rounded-lg w-7 h-7`}
              onClick={() => dispatch(setAnnotationSwitchCall("prev"))}
            >
              <IconLeftArrowThin
                height={12}
                stroke={darkMode ? "white" : "black"}
              />
            </div>
            <div
              className={`cursor-pointer ${
                darkMode
                  ? "hover:bg-neutrals-gray-3 active:bg-black"
                  : "hover:bg-neutrals-gray-7 text-black"
              } flex justify-center items-center rounded-lg w-7 h-7`}
              onClick={() => dispatch(setAnnotationSwitchCall("next"))}
            >
              <IconRightArrowThin
                height={12}
                stroke={darkMode ? "white" : "black"}
              />
            </div>
          </div>
          <div className={`flex items-center gap-1`}>
            <ButtonCopyLink invert={!darkMode} size={20} text={copyLink} />
            {mode === "editor" && (
              <AnnotationContextMenu annotation={annotation} />
            )}
          </div>
        </header>

        <main
          className={`transition-opacity ease-out opacity-100 py-2`}
          style={{ transitionDuration: `${DURATION_BASE_MS * 1.25}ms` }}
        >
          <SlideDown className="overflow-hidden min-h-[40px]">
            <div
              className={`${
                darkMode ? "text-white" : "text-black"
              } text-base pb-2 max-h-[174px] flex flex-col min-h-0`}
              // onScrollY={container => console.log(`scrolled to: ${container.scrollTop}.`)}
            >
              <b className="break-words w-full">{annotationTitle}</b>
              <AnnotationEditor rawMarkdown={annotationText} readOnly />
            </div>
          </SlideDown>
        </main>
      </div>
    </div>
  );
};

export default React.memo(AnnotationExpanded);
