import { MuPdf, createMuPdf } from "mupdf-js/dist";
import { useCallback, useEffect, useState } from "react";
import { cleanupManifestUrl } from "../utils";
import { PdfComponentPayload } from "@src/../../nodes/desci-models/dist";
import { render } from "@headlessui/react/dist/utils/render";
import { useRef } from "react";

interface PdfTestProps {
  id: string;
  options: any;
  payload: any;
}

interface RenderedPage {
  png?: string;
  num: number;
  height?: number;
  width?: number;
  started?: boolean;
}
const useHasChanged = (val: any) => {
  const prevVal = usePrevious(val);
  return prevVal !== val;
};

const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 800;

let mupdfLoad = new Promise<MuPdf.Instance>(async (resolve, reject) => {
  let mupdf: MuPdf.Instance;
  console.time("initpdf");

  mupdf = await createMuPdf();
  resolve(mupdf);
  console.timeEnd("initpdf");
});

const renderJobs: Array<number> = [];
let renderComplete: { [page: number]: boolean } = {};

const PdfTest = ({ id, options, payload }: PdfTestProps) => {
  const DPI = 100;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [mupdf, setMupdf] = useState<MuPdf.Instance | null>(null);
  const [doc, setDoc] = useState<MuPdf.DocumentHandle | null>(null);

  const [state, setState] = useState<RenderedPage[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [lastRenderedSequential, setLastRenderedSequential] = useState(0);
  let canceled = false;

  const lastRenderedSequentialChanged = useHasChanged(lastRenderedSequential);

  /**
   * If we leave the component or refresh the page, cancel all pending renders to avoid capturing main ui thread
   */
  useEffect(() => {
    canceled = false;
    const cancelAllJobs = () => {
      console.log("CANCEL ALL JOBS");
      canceled = true;
      renderJobs.map((j) => {
        clearTimeout(j);
        console.log("cancel", j);
      });
    };
    renderComplete = {};

    window.addEventListener("beforeunload", cancelAllJobs);
    return () => {
      console.log("!!!! unmount PDF", payload.url);
      window.removeEventListener("beforeunload", cancelAllJobs);
      cancelAllJobs();
    };
  }, []);

  const renderPage = useCallback(
    (z: number, mupdf: MuPdf.Instance, doc: MuPdf.DocumentHandle) => {
      return new Promise((resolve, reject) => {
        if (renderComplete[z]) {
          console.warn("render already completed for", z);
          return resolve("");
        }
        const job = setTimeout(() => {
          const key = `render_${z}_${payload.url}`;
          console.time(key);

          const png = mupdf.drawPageAsPNG(doc, z, DPI);
          console.timeEnd(key);
          const checkCancel = () => {
            if (canceled) {
              reject(`renderPage ${z} -- canceled due to unmount`);
              console.log("rcanceled", key);
              return true;
            }
          };
          if (checkCancel()) {
            return;
          }
          setState((prevState) => {
            if (checkCancel()) {
              return prevState;
            }
            console.time(key + "_sort");

            const ret = [...prevState];
            ret[z - 1] = { ...ret[z - 1], png, num: z };
            console.timeEnd(key + "_sort");
            console.log("sortDone", key);
            renderComplete[z] = true;
            resolve(z);
            return ret;
          });
        });
        renderJobs.push(job);
      });
    },
    [setState]
  );

  const updateSequential = useCallback(
    (condition: boolean, newVal: number) => {
      if (condition) {
        setLastRenderedSequential((prev) => (newVal < prev ? prev : newVal));
        console.log("NEW LAST SEQ", newVal, "prev", lastRenderedSequential);
      }
    },
    [setLastRenderedSequential, lastRenderedSequential]
  );

  const loadSection = useCallback(
    (start: number, end: number) => {
      const reject = () =>
        new Promise<void>((resolve, reject) =>
          reject(`loadSection ${start}-${end} -- canceled`)
        );
      if (!mupdf || !doc) {
        console.error("loadSection", start, end, "no mupdf or doc");
        return reject();
      }
      if (canceled) return reject();
      const promises = [];

      const key = `renderchunk-${start}-${end}`;
      console.time(key);
      for (let i = start; i <= end; i++) {
        if (!state[i - 1]) {
          debugger;
        }
        if (!state[i - 1].png) {
          promises.push(renderPage(i, mupdf, doc));
        }
      }

      // ensure lastRenderedSequential is only set if all the previous pages were rendered
      const allPreviousSequentialPagesRendered =
        start == lastRenderedSequential + 1;

      return Promise.allSettled(promises)
        .then(() => updateSequential(allPreviousSequentialPagesRendered, end))
        .then(() => {
          console.timeEnd(key);
          console.log("RENDERDONE", start, end, "last", lastRenderedSequential);
        });
    },
    [
      lastRenderedSequential,
      mupdf,
      doc,
      state,
      updateSequential,
      setLastRenderedSequential,
    ]
  );

  const CHUNKS = 5;

  const selectNextChunk = useCallback(() => {
    if (!numPages) {
      console.error("selectNextChunk", "no numPages");
      return;
    }
    debugger;

    let nextTarget = lastRenderedSequential;
    const pageBeingViewed = getCurrentPage(getHeightOfRow(state[0]));
    let scrollAdjust = false;
    // did the user skip down the document? if so, render from where they scrolled to
    if (pageBeingViewed > lastRenderedSequential) {
      nextTarget = pageBeingViewed - 1;
      scrollAdjust = true;
    }
    // did we run out of things to render? if so, render from the lastRenderedSequential
    const hitTheEnd = nextTarget > numPages;
    const everythingAfter = state.slice(nextTarget, nextTarget + CHUNKS);
    const alreadyRenderedEverythingAfter =
      everythingAfter.filter((a) => !renderComplete[a.num]).length == 0;
    if (hitTheEnd || alreadyRenderedEverythingAfter) {
      nextTarget = lastRenderedSequential;
    }
    const start = nextTarget + 1;
    const end = Math.min(start + CHUNKS, numPages);
    if (start >= end) return;

    setTimeout(() => {
      loadSection(start, end).then(() => {
        if (scrollAdjust) {
          console.log("SCROLL ADJUST TRIGGER", state.slice(start - CHUNKS));
          selectNextChunk();
        }
      });
    });
  }, [lastRenderedSequential, numPages, loadSection, state]);

  useEffect(() => {
    // runs every update after the first load
    if (
      mupdf &&
      doc &&
      numPages &&
      lastRenderedSequential > 0 &&
      lastRenderedSequential < numPages &&
      lastRenderedSequentialChanged
    ) {
      selectNextChunk();
    }
  }, [
    lastRenderedSequential,
    selectNextChunk,
    numPages,
    mupdf,
    doc,
    lastRenderedSequentialChanged,
  ]);

  useEffect(() => {
    // should only occur once on init load

    if (mupdf && doc && numPages && state[0] && !state[0].png) {
      console.log("ONLY ONCE PER");

      const initEnd = Math.min(2, numPages);
      loadSection(1, initEnd);
    } else {
      console.log("no-pass", mupdf, doc, numPages, state[0]);
    }
  }, [state, numPages, mupdf, doc]);

  const handleSomePdf = async (url: string) => {
    // const {createMuPdf} = await import("mupdf-js");
    const mupdf = await mupdfLoad;
    console.time("fetchpdf");
    const file = await fetch(url);
    const buf = await file.arrayBuffer();
    const arrayBuf = new Uint8Array(buf);
    const doc = mupdf.load(arrayBuf);
    console.timeEnd("fetchpdf");
    // Each of these returns a string:

    const pageCount = mupdf.countPages(doc);
    setMupdf(mupdf);
    setDoc(doc);
    setNumPages(pageCount);

    const height = mupdf.pageHeight(doc, 1, DPI);
    const width = mupdf.pageWidth(doc, 1, DPI);
    console.log("num pages", pageCount);
    const initState = new Array(pageCount).fill({ num: 0 }).map((_, i) => ({
      num: i + 1,
      height,
      width,
    }));
    console.log("INIT STATe", initState);
    setState(initState);

    // const svg = mupdf.drawPageAsSVG(doc, 1);
    // const html = mupdf.drawPageAsHTML(doc, 1);

    //...
  };

  useEffect(() => {
    let targetPdf = cleanupManifestUrl((payload as PdfComponentPayload).url);

    handleSomePdf(targetPdf);
  }, []);

  return (
    <div className="pdf flex flex-col gap-5">
      {state.map((item: RenderedPage, i: number) => {
        return (
          <div
            key={`mupdf_${item.num}_${payload.url}`}
            style={{
              width: item.width || DEFAULT_WIDTH,
              height: item.height || DEFAULT_HEIGHT,
            }}
          >
            {item.png && (i < 10 || i > 550) ? (
              <img src={item.png} />
            ) : (
              <div className={`h-full w-full ${item.png ? "bg-red-200" : ""}`}>
                loading
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const getHeightOfRow = (p: RenderedPage) => {
  const VERTICAL_PADDING = 20;
  const height = p?.height ? p.height + VERTICAL_PADDING : DEFAULT_HEIGHT;
  return height;
};

const getCurrentPage = (rowHeight: number) => {
  const height = rowHeight || DEFAULT_HEIGHT;
  const pageBeingViewed = Math.floor(
    document.scrollingElement!.scrollTop / height
  );
  return pageBeingViewed;
};

export default PdfTest;
