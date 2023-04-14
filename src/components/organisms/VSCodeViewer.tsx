import AnnotationExpanded from "@components/atoms/AnnotationExpanded";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  Annotation,
  CodeComponent,
  PdfComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useUser } from "@src/state/user/hooks";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";

interface CodeViewerProps extends ResearchObjectV1Component {
  // payload: CodeComponent["payload"];
}

let eventLogger = (e: any, data: any) => {
  console.log("Event: ", e);
  console.log("Data: ", data);
};
let lastCode = "";
const VSCodeViewer = () => {
  const { selectedAnnotationId } = usePdfReader();
  const { requestedCodeFile, setRequestedCodeFile } = useManuscriptController([
    "requestedCodeFile",
  ]);
  const {
    manifest: manifestData,
    mode,
    componentStack,
    annotationLinkConfig,
  } = useNodeReader();

  const [activeAnnotation, setActiveAnnotation] = useState(false);
  const [activeDraggable, setActiveDraggable] = useState(false);

  const codeComponent = componentStack[
    componentStack.length - 1
  ] as CodeComponent;

  const userProfile = useUser();

  useEffect(() => {
    if (!selectedAnnotationId || codeComponent?.type !== "code") {
      setActiveAnnotation(false);
      setActiveDraggable(false);
    } else {
      setTimeout(() => {
        setActiveAnnotation(true);
      }, 0);
      // setTimeout(() => {
      //   setActiveDraggable(true);
      // }, 5000);
    }
  }, [selectedAnnotationId, codeComponent]);
  if (codeComponent?.type === "code") {
    lastCode = codeComponent?.payload?.externalUrl?.split("github.com/")[1]!;
  } else {
    lastCode = manifestData?.components
      .find((c) => c.type === "code")
      ?.payload?.externalUrl?.split("github.com/")[1]!;
  }

  const [tempAnnotation, setTempAnnotation] = useState(<></>);
  useEffect(() => {
    if (!annotationLinkConfig) {
      setActiveDraggable(false);
    }
    let pdfComponent: PdfComponent = {
      type: ResearchObjectComponentType.PDF,
      payload: { url: "" },
      id: "",
      name: "",
    };
    let annotation: Annotation = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      id: "",
      text: "",
      title: "",
    };
    if (selectedAnnotationId) {
      pdfComponent = manifestData?.components.find(
        (a: ResearchObjectV1Component) =>
          a.type === ResearchObjectComponentType.PDF
      )! as PdfComponent;
      annotation = pdfComponent?.payload?.annotations?.find(
        (a) => a.id == selectedAnnotationId
      )!;
    }
    let anno = (
      <div
        className={`handle fixed bottom-[28px] left-0 transition-all duration-200 ease-out ${
          activeDraggable ? "cursor-move" : ""
        } ${activeAnnotation ? "translate-x-2" : "-translate-x-96"}`}
        onClick={() => {
          setActiveDraggable(true);
        }}
      >
        <AnnotationExpanded
          DURATION_BASE_MS={0}
          annotationTitle={annotation?.title!}
          annotationText={annotation?.text!}
          annotation={annotation!}
          hideHeader={true}
        />
      </div>
    );
    if (activeDraggable) {
      anno = (
        <Draggable
          // axis="x"
          handle=".handle"
          defaultPosition={{ x: 8, y: 0 }}
          position={undefined}
          grid={[25, 25]}
          scale={1}
          onStart={eventLogger}
          onDrag={eventLogger}
          onStop={eventLogger}
        >
          {anno}
        </Draggable>
      );
    }
    setTempAnnotation(anno);
  }, [
    selectedAnnotationId,
    manifestData,
    activeDraggable,
    activeAnnotation,
    annotationLinkConfig,
  ]);

  const ref = useRef(null);

  const DEFAULT_CODE_SERVER_READ =
    process.env.REACT_APP_CODE_SERVER || "https://desci.dev";
  const DEFAULT_CODE_SERVER_EXEC =
    process.env.REACT_APP_CODE_SERVER ||
    `https://${userProfile.vscode}.desci.dev`;
  const canExec = userProfile && userProfile.vscode;

  const [filePath, setFilePath] = useState("");
  useEffect(() => {
    if (requestedCodeFile) {
      if (requestedCodeFile?.name) {
        // setFilePath(requestedCodeFile.name);
        const el = ref.current! as HTMLIFrameElement;
        const exec = requestedCodeFile?.exec;
        const uri =
          el.src.replace(/&file=[^&]+/, "").replace(/&exec=[^&]+/, "") +
          `&file=${requestedCodeFile.name}${exec ? `&exec=${exec}` : ""}`;
        el.contentWindow!.postMessage(
          JSON.stringify({ type: "changeUri", uri }),
          "*"
        );
        setRequestedCodeFile(null);
      }
    }
  }, [requestedCodeFile]);
  useEffect(() => {
    if (
      componentStack &&
      componentStack[componentStack.length - 1] &&
      componentStack[componentStack.length - 1].type !=
        ResearchObjectComponentType.CODE
    ) {
      // setFilePath("");
    }
  }, [componentStack]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     const el = ref.current! as HTMLIFrameElement;
  //     if (el.contentWindow) {
  //       alert("send");
  //       el.contentWindow.postMessage(JSON.stringify({ type: "openFile" }), "*");
  //     } else {
  //       console.log("iframe contentwindow not available");
  //     }
  //   }, 5000);
  // }, []);

  const [codeBrowseSuffix, setCodeBrowseSuffix] = useState("");

  useEffect(() => {
    if (annotationLinkConfig && annotationLinkConfig.path) {
      setCodeBrowseSuffix(
        `#file=${annotationLinkConfig.path}${
          annotationLinkConfig.line ? `&line=${annotationLinkConfig.line}` : ""
        }`
      );
    }
  }, [annotationLinkConfig]);
  if (annotationLinkConfig && annotationLinkConfig.url) {
    const targetId = annotationLinkConfig.url
      .split("#/code/")
      .filter((a) => a.length)[0];
    let targetCodeComponent = manifestData?.components.find((c) => {
      return c.id === targetId;
    });
    lastCode =
      targetCodeComponent?.payload?.externalUrl?.split("github.com/")[1]!;
  }

  if (codeComponent?.type !== "code") {
    return <></>;
  }

  console.log("RENDER VSCODEVIEWER");
  return (
    <div
      className={`w-screen h-screen top-[55px] fixed left-0 bg-neutrals-gray-1 ${
        codeComponent?.type === "code" ? "z-1" : "z-[-20] pointer-events-none"
      }`}
    >
      {/**Forcing re-render of iframe if switching to exec */}
      {canExec ? (
        <iframe
          ref={ref}
          title={"code.desci.com"}
          src={`${DEFAULT_CODE_SERVER_EXEC}?folder=/config/workspace/${
            lastCode?.split("/").pop() || ""
          }`}
          className="w-[calc(100vw-336px)] h-[calc(100vh-55px)] select-none"
        />
      ) : (
        <iframe
          ref={ref}
          title={"desci.dev"}
          src={`${DEFAULT_CODE_SERVER_READ}/${lastCode || ""}${
            codeBrowseSuffix || ""
          }`}
          className="w-[calc(100vw-336px)] h-[calc(100vh-55px)] select-none"
        />
      )}

      {tempAnnotation}
    </div>
  );
};

export default React.memo(VSCodeViewer);
