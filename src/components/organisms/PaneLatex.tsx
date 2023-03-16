import { useCallback, useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/snippets/latex";
import "ace-builds/src-noconflict/ext-language_tools";
import { SCIWEAVE_URL } from "@api/index";
import { Document, Page } from "react-pdf";
import axios from "axios";

import { pdfjs } from "react-pdf";
import { TOOLBAR_ENTRY } from "./Toolbar";
import { useGetter } from "@src/store/accessors";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function heredoc(fn: any) {
  try {
    return fn
      .toString()
      .replace(/\n\n/g, "\n\n\n")
      .match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1]
      .split("\n")
      .map((a: string) => a.trim())
      .join("\n");
  } catch (err) {
    console.warn(fn, err);
    return "";
  }
}
const txt = heredoc(function () {
  /*
\documentclass{article}


\title{Your Paper}
\author{Author}

\begin{document}
\maketitle

\begin{abstract}
Your abstract.
\end{abstract}

\section{Introduction}


\end{document}
*/
});

const Loader = () => (
  <div className="w-full h-[calc(100vh-56px)] flex flex-col items-center pt-2 gap-2 overflow-x-auto">
    <div className="shadow-lg w-96 h-96"></div>
  </div>
);

const LatexPreview = ({ content, compile, isCompile }: any) => {
  const [rawFile, setRawFile] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [loadCount, setLoadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const { activeToolbar, isToolbarVisible } = useGetter(
    (state) => state.preferences
  );

  const saveKeyCapture = useCallback(() => {
    document.onkeydown = function (e) {
      if (e.ctrlKey && e.key === "s") {
        handleCompile();
        return false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveKeyDisable = () => {
    document.onkeydown = null;
  };

  const handleCompile = useCallback(() => {
    setIsLoading(true);
    setLoadCount(loadCount + 1);

    postData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCount]);

  useEffect(() => {
    if (isToolbarVisible && activeToolbar === TOOLBAR_ENTRY.latex) {
      saveKeyCapture();
    }
    return () => {
      saveKeyDisable();
    };
  }, [isToolbarVisible, saveKeyCapture, activeToolbar]);
  useEffect(() => {
    handleCompile();
  }, [handleCompile]);

  const RecompileButton = () => (
    <div
      className={`absolute top-0 z-50 right-7 text-xs rounded-b-md px-2 py-1 hover:bg-tint-primary-dark cursor-pointer text-white ${
        isLoading ? "bg-neutrals-gray-3" : "bg-tint-primary"
      }`}
      onClick={() => {
        setRawResponse("");
        handleCompile();
      }}
    >
      Recompile
    </div>
  );

  function onDocumentLoadSuccess({ numPages: nextNumPages }: any) {
    setNumPages(nextNumPages);
  }
  const postData = useCallback(async () => {
    const content = localStorage.getItem("latex");
    const encodedString = new Buffer(content!).toString("base64");

    try {
      const formData = new FormData();
      formData.append("foo", encodedString);
      const { data } = await axios({
        method: "post",
        url: `${SCIWEAVE_URL}/v1/latex/upload`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const file = new Blob([data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      setTimeout(() => {
        setRawFile(fileURL);
      }, 1000);

      setIsLoading(false);
    } catch (error) {
      //   debugger;
      setRawResponse((" " + error) as string);
      //   throw new Error(error);
    }
  }, [content]);

  if (isLoading && !rawResponse.length && !rawFile) {
    return (
      <div className="relative">
        <RecompileButton />
        <Loader />
      </div>
    );
  }
  if (rawResponse.length !== 0 && !rawFile) {
    return (
      <div className="relative">
        <RecompileButton />
        {rawResponse}
      </div>
    );
  }
  if (rawFile) {
    return (
      <div className="relative">
        <RecompileButton />
        <Document
          key={rawFile}
          file={rawFile}
          options={{
            standardFontDataUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
            // cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
            // cMapPacked: true,
            // disableFontFace: true,
          }}
          loading={<Loader />}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error(err);
          }}
          className="w-full h-[calc(100vh-56px)] flex flex-col items-center pt-2 gap-2 overflow-x-auto"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              renderTextLayer={false}
              key={`page_${index + 1}_${rawFile}_${loadCount}`}
              pageNumber={index + 1}
              className="shadow-lg"
              scale={1}
            />
          ))}
        </Document>
      </div>
    );
  }
  return <Loader />;
};

const InputArea = ({ content, compile, isCompile, setContent }: any) => {
  const [open, setOpen] = useState(false);
  const editorRef = useRef(null);

  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    if (content === "") {
      localStorage.setItem("latex", txt);
    } else {
      localStorage.setItem("latex", content);
    }
    isCompile(true);
  }, [content]);

  useEffect(() => {
    var encodedString = "";
    if (content === "") {
      encodedString = new Buffer(txt).toString("base64");
    } else {
      encodedString = new Buffer(content).toString("base64");
    }

    (async () => {
      try {
        const formData = new FormData();
        formData.append("foo", encodedString);
        const { data } = await axios({
          method: "post",
          url: `${SCIWEAVE_URL}/v1/latex/compile`,
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });

        setAnnotations(data);
        isCompile(false);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [compile]);

  return (
    <AceEditor
      mode="latex"
      value={content}
      wrapEnabled={true}
      theme={"monokai"}
      className="editable editor"
      onChange={setContent}
      onValidate={setAnnotations as any}
      name="editor"
      height="100%"
      width="100%"
      showPrintMargin={false}
      fontSize="15px"
      ref={editorRef}
      annotations={annotations}
      enableBasicAutocompletion={true}
      enableLiveAutocompletion={true}
      enableSnippets={true}
      editorProps={{ $blockScrolling: true }}
    />
  );
};

const PaneLatex = () => {
  const [compile, isCompile] = useState(true);
  const [content, setContent] = useState(txt);
  return (
    <div className="w-full h-full bg-white text-black flex flex-row">
      <div className="h-[calc(100%)] w-[calc(50%)]">
        <InputArea
          compile={compile}
          isCompile={isCompile}
          content={content}
          setContent={setContent}
        />
      </div>
      <div className="h-[calc(100%+57px)] w-[calc(50%)]">
        <LatexPreview
          isCompile={isCompile}
          compile={compile}
          content={content}
        />
      </div>
    </div>
  );
};

export default PaneLatex;
