import React, {
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useEffect, useState } from "react";
import { Page } from "react-pdf/dist/esm/entry.webpack";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import "./TextLayer.css";
import PageAnnotations from "../PageAnnotations";
import styled, { keyframes, StyledComponent } from "styled-components";
import "../style.scss";
import { PDF_PAGE_SPACING } from "..";
import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";
import AnnotationEditCanvas from "@components/molecules/AnnotationEditCanvas";
import { __log, EMPTY_FUNC } from "@components/utils";
import { useResponsive } from "hooks";
import { Desktop } from "@hocs/ResponsiveHOCs";
import AnnotationLayer from "./AnnotationLayer";
import { IconAddComment } from "@icons";
import toast from "react-hot-toast";
import usePageMetadata, { PageMetadata } from "../usePageMetadata";
import { HighlightCallbackProps } from "@components/textSelectUtils";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { setZoom } from "@src/state/nodes/pdf";
import { useSetter } from "@src/store/accessors";
import _ from "lodash";

const pulse = keyframes`
0%{
  background-position: 0 -100%;
}
60% {
  background-position: 0 130%;
}

100% {
  background-position: 0 130%;
}
`;

export const PaperLoader: StyledComponent<"div", any, any> = styled.div`
  height: 100%;
  width: 856px;
  background-color: #fff;
  animation-delay: 1s;
  ${(params) => (params.hidden ? "visibility: hidden;" : "")}
  background: linear-gradient(
      to bottom,
      rgba(231, 231, 231, 0),
      rgba(231, 231, 231, 0.3) 50%,
      rgba(231, 231, 231, 0) 80%
    ),
    white;
  background-repeat: no-repeat;
  background-size: 100% 30%;
  background-position: 0 -100%;
  animation: ${pulse} 2s infinite ease-in;
`;
const PageWrapper = styled.div.attrs({
  className:
    "flex flex-row w-full justify-center items-center shadow-lg shadow-zinc-700",
})`
  position: relative;
  transition: opacity ease-in 10ms;
`;

const PageComponent = React.memo((props: any) => {
  const {
    pageNumber,
    renderMode = "canvas",
    canvasRef,
    pageWidth,
    // zoom,
    onRenderSuccess = EMPTY_FUNC,
    onLoadSuccess = EMPTY_FUNC,
    visible,
    cacheKey,
    pageMetadata,
    ratio,
  } = props;

  const [isRendered, setIsRendered] = useState<boolean>(false);

  const [zoomChanged, setZoomChanged] = useState(false);
  const timeKey = `time_${cacheKey}`;
  const dispatch = useSetter();
  const { zoom } = usePdfReader();

  // if (!isRendered) {
  //   console.time(timeKey);
  // }
  console.log(timeKey, isRendered);

  useEffect(() => {
    setTimeout(() => {
      setIsRendered(false);
    });
  }, [zoom]);

  useEffect(() => {
    if (!visible) {
      setIsRendered(true);
    }
  }, [visible]);

  const renderSuccess = useCallback(() => {
    if (!zoomChanged && isRendered) return;
    onRenderSuccess();

    setZoomChanged(false);
    // console.timeEnd(timeKey);
  }, [onRenderSuccess, zoomChanged, setZoomChanged, isRendered, setIsRendered]);
  const loading = useCallback(() => <></>, []);
  const pageMetadataSafe = pageMetadata
    ? pageMetadata
    : { width: pageWidth, height: pageWidth * ratio };
  const RenderedPage = useMemo(() => {
    return (
      <Page
        canvasRef={canvasRef}
        renderMode={isRendered ? "none" : renderMode}
        width={pageMetadataSafe.width}
        height={pageMetadataSafe.height}
        pageNumber={pageNumber}
        // @ts-ignore
        enhanceTextSelection={true}
        className={`!static ${visible ? "" : "invisible"} bg-transparent ${
          props.className
        }`}
        onLoadSuccess={onLoadSuccess}
        onRenderSuccess={renderSuccess}
        renderTextLayer={true}
        scale={zoom}
        loading={loading}
        renderInteractiveForms={false}
        // customTextRenderer={(textItem: any) => {
        //   return <div className="text-red-500"><textItem/></div>;
        // }}
      ></Page>
    );
  }, [
    renderSuccess,
    loading,
    pageMetadata,
    isRendered,
    zoom,
    canvasRef,
    zoomChanged,
    pageMetadataSafe,
  ]);

  return (
    <div
      className="relative"
      key={`page_component_${cacheKey}`}
      style={{
        width: pageMetadataSafe.width * zoom,
        height: pageMetadataSafe.height * zoom,
      }}
    >
      {RenderedPage}
    </div>
  );
});

export const PAGE_RENDER_DISTANCE = 5;

interface PageComponentHOCProps {
  width: number;
  pageNumber: number; // 1-based
  pageAnnotations: ResearchObjectComponentAnnotation[];
  setPageAnnotations: (anno: ResearchObjectComponentAnnotation[]) => void;
  dirtyComment?: boolean;
  onLoadSuccess?: any;
  isActiveComponent?: boolean;
  isScrolling?: boolean;
  isPinching?: boolean;
  highlightPrompt?: HighlightCallbackProps;
  setHighlightPrompt?: (val: HighlightCallbackProps | undefined | null) => void;
  // cachedPageDimensions: Map<number, number[]>;
  zoom: number;
  selectedAnnotationId: string | undefined;
  pdfUrl: string;
  pageMetadata: PageMetadata;
  isIntersecting: boolean;
  // setPageMetadata: (pm: PageMetadata) => void;
}

const imageCache: { [key: string]: string } = {};

console.log("IMAGE CACHE", imageCache);

const PageComponentHOC = ({
  width: pageWidth,
  pageNumber,
  pageAnnotations,
  setPageAnnotations,
  dirtyComment,
  onLoadSuccess,
  isActiveComponent,
  isScrolling,
  isPinching,
  highlightPrompt,
  setHighlightPrompt,
  // cachedPageDimensions,
  pageMetadata,
  isIntersecting,
  zoom,
  selectedAnnotationId,
  pdfUrl,
}: // setPageMetadata,
PageComponentHOCProps) => {
  const pageRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const [opacity, setOpacity] = useState<number>(0);

  const imageCacheKey = (pageNumber: number) => `${pageNumber}_${pdfUrl}`;
  const cacheKey: string = imageCacheKey(pageNumber);
  const [image, setImage] = useState<string | undefined>(imageCache[cacheKey]);

  // const dimData = cachedPageDimensions.get(pageNumber) || [1, 1];
  const ratio = pageMetadata.ratio;

  const { isDesktop } = useResponsive();

  const SCROLL_AWAY_PAGE_DISMISS_THRESHOLD = zoom < 1 ? 4 : 4;

  const [isIntersectingAfterScroll, setIsIntersectingAfterScroll] =
    useState<boolean>(false);

  /**
   * When scrolling off the page, we don't want the original canvas (which might have the cursor on it)
   * to disappear. This will disrupt the scrolling event. So wait until scrolling is complete to update
   * setIsIntersectingAfterScroll.
   */
  useEffect(() => {
    if (!isScrolling) {
      setIsIntersectingAfterScroll(isIntersecting);
    }
  }, [isIntersecting, isScrolling]);

  const showCanvas = isIntersectingAfterScroll && !isPinching;

  // TODO: UNCOMMENT FOR SCROLL AWAY CODE
  // useEffect(() => {
  //   // if (intersection && intersection.isIntersecting && !isScrolling) {
  //   if (isIntersecting) {
  //     // setPdfCurrentPage(pageNumber);
  //     // DISMISS any previously selected annotation if we scroll away 2 pages
  //     if (selectedAnnotationId) {
  //       const annotations =
  //         componentStack[componentStack.length - 1].payload.annotations;
  //       if (annotations) {
  //         const selectedAnnotation = annotations.find(
  //           (e: ResearchObjectComponentAnnotation) =>
  //             e.id === selectedAnnotationId
  //         );
  //         if (
  //           selectedAnnotation &&
  //           Math.abs(selectedAnnotation.pageIndex! - pageNumber) >
  //             SCROLL_AWAY_PAGE_DISMISS_THRESHOLD
  //         ) {
  //           console.log('setting annotation id to undefined now')
  //           setHoveredAnnotationId(undefined);
  //           setSelectedAnnotationId(undefined);
  //         }
  //       }
  //     }
  //   }
  // }, [isIntersecting, isScrolling]);

  const [under, setUnder] = useState(false);
  useEffect(() => {
    if (selectedAnnotationId) {
      setUnder(true);
    } else {
      setUnder(false);
    }
  }, [selectedAnnotationId]);

  const thisPageAnnotations = pageAnnotations?.filter((a: any) => {
    return a.pageIndex == pageNumber - 1;
  });

  // __log("[Page.tsx] PageComponentHOC::render index=", pageNumber);

  const onPageClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      /**
       * Handle external links in new browser tab
       */
      const target = e.target as HTMLAnchorElement;
      if (target.tagName.toLowerCase() === "a") {
        if (target.classList.contains("internalLink")) return;
        e.preventDefault();
        window.open(target.href);
      } else {
        /**
         * Dismiss highlight prompt unless text is still selected
         */

        e.stopPropagation();
        setTimeout(() => {
          const selection = window.getSelection()!;

          if (selection.toString().trim() === "" && setHighlightPrompt) {
            setHighlightPrompt(null);
          }
        }, 0);
      }
    },
    [setHighlightPrompt]
  );

  const onRenderSuccess = useCallback(() => {
    if (!image) {
      //FIXME add {willReadFrequently: true}
      // https://github.com/fserb/canvas2D/blob/master/spec/will-read-frequently.md
      const blob = canvasRef.current?.toDataURL();
      imageCache[cacheKey] = blob;
      setTimeout(() => {
        setImage(blob);
      }, 50);
    }
    setOpacity(1);
  }, [image, setImage, setOpacity, canvasRef]);

  return (
    <>
      <PageWrapper
        ref={pageRef}
        style={{
          position: "relative",
          width: pageMetadata.width * zoom,
          height: pageMetadata.height * zoom,

          marginBottom: PDF_PAGE_SPACING,
        }}
        onLoad={useCallback(
          () => __log(`<PageWrapper> ${pageNumber} loaded`),
          [pageNumber]
        )}
        onClick={onPageClick}
      >
        {isIntersecting && thisPageAnnotations.length ? (
          <Desktop>
            <PageAnnotations
              annotations={thisPageAnnotations}
              pageHeight={pageMetadata.height * zoom}
              pageWidth={pageMetadata.width * zoom}
              isActiveComponent={isActiveComponent}
            />
          </Desktop>
        ) : null}
        {/* {
            Math.abs(pdfCurrentPage - pageNumber) < PAGE_RENDER_DISTANCE ? ( */}

        {isIntersecting ? (
          <>
            <AnnotationEditCanvas
              pageIndex={pageNumber - 1}
              setAnnotations={setPageAnnotations}
              annotations={pageAnnotations}
              className={`relative ${under ? "" : "z-50"} w-full h-full`}
            >
              <img
                src={image}
                key={`img_${cacheKey}`}
                alt=""
                className={`pointer-events-none absolute top-0 left-0 right-0 bottom-0 ${
                  under ? "" : "z-[50]"
                } w-full h-full ${
                  1 // image ? "opacity-100" : "opacity-0"
                } z-[-10]   ease-in`}
              />

              <div className={`z-back-on-annotate h-fit w-fit`}>
                <PageComponent
                  cacheKey={`pagecomponent_${cacheKey}`}
                  pageNumber={pageNumber}
                  canvasRef={canvasRef}
                  pageWidth={pageMetadata.width}
                  isActiveComponent={isActiveComponent}
                  zoom={zoom}
                  ratio={ratio}
                  isScrolling={isScrolling}
                  isPinching={isPinching}
                  onRenderSuccess={onRenderSuccess}
                  visible={!image || showCanvas}
                />
              </div>
              <div
                className={` z-50 absolute ${
                  highlightPrompt ? "opacity-100" : "opacity-0"
                }`}
                style={
                  highlightPrompt
                    ? {
                        top: highlightPrompt.boundingRect.top,
                        left: highlightPrompt.rects[0].left - 22 + 3,
                        height: 0,
                        width: 44,
                      }
                    : {}
                }
              >
                <div
                  className="-mt-12 flex justify-center cursor-pointer group"
                  onMouseDown={() => {
                    if (highlightPrompt) {
                      toast.error("Coming soon", {
                        duration: 2000,
                        position: "top-center",
                        style: {
                          marginTop: 60,
                          borderRadius: "10px",
                          background: "#111",
                          color: "#fff",
                        },
                      });
                    }
                  }}
                >
                  <div className="bg-neutrals-black w-[44px] h-[37px] flex items-center justify-center rounded-md shadow-xl drop-shadow-lg group-hover:bg-neutrals-gray-1">
                    <IconAddComment fill="#28AAC4" width={20} />
                  </div>
                  <div className="bg-neutrals-black w-[12px] h-[12px] absolute bottom-2 rotate-45 rounded-sm shadow-xl drop-shadow-lg group-hover:bg-neutrals-gray-1"></div>
                </div>
              </div>

              {thisPageAnnotations.length > 0 ? (
                <AnnotationLayer
                  thisPageAnnotations={thisPageAnnotations}
                  under={under}
                  isScrolling={isScrolling}
                  isPinching={isPinching}
                  pageRef={pageRef}
                />
              ) : null}

              {/*  Used as a cover on top of the page to capture gestures because the text on the
          pdf stops event propagation so zooming can't occur when pinching on top of the text */}
              {
                // !hasMouse ? (
                !isDesktop ? (
                  <div
                    ref={overlayRef}
                    className={`absolute top-0 left-0 right-0 bottom-0 z-11 touch-pan-x touch-pan-y`}
                    onClick={(e: React.MouseEvent) => {
                      /**
                       * Find the next element underneath this one at this coordinate and trigger a click event
                       */
                      const elements: Element[] = document.elementsFromPoint(
                        e.nativeEvent.pageX,
                        e.nativeEvent.pageY
                      );
                      // @ts-ignore
                      if (elements[1] && elements[1].click) {
                        // @ts-ignore
                        elements[1].click();
                      }
                    }}
                  />
                ) : null
              }
            </AnnotationEditCanvas>

            {!image ? (
              <PaperLoader
                className={`absolute top-0 left-0 right-0 bottom-0 shadow-2xl z-10`}
                style={{
                  width: pageMetadata.width * zoom,
                  height: pageMetadata.height * zoom,
                }}
              />
            ) : null}
          </>
        ) : null}
      </PageWrapper>
    </>
  );
};

export { PageComponentHOC };
