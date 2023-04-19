import { MuPdf, createMuPdf } from "mupdf-js/dist";
import { Ref, useCallback, useEffect, useMemo, useState } from "react";
import { __log, cleanupManifestUrl } from "../utils";
import { PdfComponentPayload } from "@src/../../nodes/desci-models/dist";
import { InView } from "react-intersection-observer";

import { useRef } from "react";
import debounce from "lodash.debounce";

interface PdfTestProps {
  payload: any;
}

interface RenderedPage {
  png?: string;
  num: number;
  height?: number;
  width?: number;
  started?: boolean;
}

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 800;

interface MuPdfWorker {
  instance: MuPdf.Instance;
  doc?: MuPdf.DocumentHandle;
}

let mupdfLoad = new Promise<MuPdfWorker[]>(async (resolve, reject) => {
  // console.time("initpdf");

  const MAX_INSTANCE = 4;
  const numInstance = Math.min(MAX_INSTANCE, navigator.hardwareConcurrency);
  let mupdf: MuPdfWorker[] = new Array();
  for (let i = 0; i < numInstance; i++) {
    __log(`[mupdfLoad] creating instance ${i} of ${numInstance}`);
    const worker = await createMuPdf();
    mupdf.push({ instance: worker });
  }
  resolve(mupdf);
  // console.timeEnd("initpdf");
});

const renderJobs: Array<number> = [];
let renderComplete: { [page: number]: boolean } = {};

const PdfTest = ({ payload }: PdfTestProps) => {
  const DPI = 72;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [mupdf, setMupdf] = useState<MuPdf.Instance | null>(null);
  const [doc, setDoc] = useState<MuPdf.DocumentHandle | null>(null);
  const [state, setState] = useState<RenderedPage[]>([]);

  const getAllInstances = async (): Promise<MuPdfWorker[]> => {
    return mupdfLoad;
  };

  const getInstance = async (): Promise<MuPdfWorker> => {
    const mupdf = await mupdfLoad;
    const pool = mupdf!;
    const index = Math.floor(Math.random() * pool.length);

    return pool[index];
  };

  let canceled = false;
  const [mounted, setMounted] = useState(false);
  // const pdfWorker: Worker = useMemo(
  //   () => new Worker(new URL("../../webworkers/pdf.ts", import.meta.url)),
  //   []
  // );

  // useEffect(() => {
  //   if (window.Worker && mupdf && doc) {
  //     pdfWorker.postMessage([{num: 1, fn: () =>  mupdf.drawPageAsPNG(doc, 1, DPI);}]);
  //   }
  // }, [mupdf, doc]);

  /**
   * Load strategy:
   *
   * based on the current page, ensure that current page is loaded and then load pages above and below the current page constantly until all are loaded
   * throttle using setInterval / debounce / onscroll
   */
  const tick = useCallback(() => {
    if (!mupdf || !doc) {
      console.error("[tick] mupdf not loaded", mupdf, doc);
      return;
    }
    const pageHeight = getHeightOfRow(state[0]);
    const curPage = Math.min(
      Math.max(0, getCurrentPage(pageHeight) + 1),
      numPages!
    );
    const curPageIsLoaded = renderComplete[curPage];
    const nextUnrenderedPage = getNextUnrenderedPage(curPage);
    const prevUnrenderedPage = getPreviousUnrenderedPage(curPage);
    const promises = [];
    if (!curPageIsLoaded) {
      promises.push(renderPage(curPage));
    }

    // __log("[tick]", prevUnrenderedPage, curPage, nextUnrenderedPage);
    if (nextUnrenderedPage != null) {
      promises.push(renderPage(nextUnrenderedPage));
    }
    if (prevUnrenderedPage != null) {
      promises.push(renderPage(prevUnrenderedPage));
    }
    Promise.allSettled(promises).then((res) => {
      if (isFullyLoaded()) {
        __log("all pages loaded");
        unregisterLoader();
        return;
      }
    });
  }, [state, mupdf, doc]);

  const debouncedTick = useMemo(() => debounce(tick, 30), [state, mupdf, doc]);
  let autotick = useRef<NodeJS.Timeout | undefined>();
  /**
   * If we leave the component or refresh the page, cancel all pending renders to avoid capturing main ui thread
   */
  useEffect(() => {
    __log("RENDER JOBS", renderJobs, "complete", renderComplete);
    let targetPdf = cleanupManifestUrl((payload as PdfComponentPayload).url);

    handleSomePdf(targetPdf);

    canceled = false;
    const cancelAllJobs = () => {
      __log("CANCEL ALL JOBS");
      canceled = true;
      renderJobs.map((j) => {
        clearTimeout(j);
        __log("cancel", j);
      });
    };
    renderComplete = {};

    window.addEventListener("beforeunload", cancelAllJobs);
    return () => {
      debouncedTick.cancel();
      unregisterLoader();
      __log("!!!! unmount PDF", payload.url);
      window.removeEventListener("beforeunload", cancelAllJobs);
      cancelAllJobs();
    };
  }, []);

  useEffect(() => {
    // should only occur once on init load

    if (mupdf && doc && numPages && mounted) {
      // console.log("ONLY ONCE PER");
      debouncedTick();
      if (autotick && !autotick.current) {
        autotick.current = setInterval(tick, 50);

        window.addEventListener("scroll", debouncedTick);
      }
    } else {
      // console.log("no-pass", mupdf, doc, numPages, state[0]);
    }
  }, [numPages, mupdf, doc, mounted]);

  const handleSomePdf = async (url: string) => {
    // const {createMuPdf} = await import("mupdf-js");
    // const mupdfPool = await mupdfLoad;
    const pool = await getAllInstances();
    if (!pool) {
      console.error("no mupdf instance");
      return;
    }
    // console.time("fetchpdf");
    const file = await fetch(url);
    const buf = await file.arrayBuffer();
    const arrayBuf = new Uint8Array(buf);

    pool.forEach((m) => {
      m.doc = m.instance.load(arrayBuf);
    });
    const mupdf = await getInstance();
    const doc = mupdf.doc!;
    // console.timeEnd("fetchpdf");
    // Each of these returns a string:

    const pageCount = mupdf.instance.countPages(doc);
    setMupdf(mupdf.instance);
    setDoc(doc);
    setNumPages(pageCount);

    const height = mupdf.instance.pageHeight(doc, 1, DPI);
    const width = mupdf.instance.pageWidth(doc, 1, DPI);
    __log("num pages", pageCount);
    const initState = new Array(pageCount).fill({ num: 0 }).map((_, i) => ({
      num: i + 1,
      height,
      width,
    }));
    __log("INIT STATe", initState);
    setState(initState);
    setMounted(true);
  };

  const unregisterLoader = () => {
    __log("UNREGISTERED");
    if (autotick && autotick.current) {
      clearInterval(autotick.current);
      autotick.current = undefined;
    }
    window.removeEventListener("scroll", debouncedTick);
  };

  /**
   * send a job to wasm to render pdf
   * ensure that this hasn't been asked already (track renders)
   * ensure job is cancelable in event of component unmount or refresh
   */
  const renderPage = useCallback(
    (z: number) => {
      return new Promise((resolve, reject) => {
        if (renderComplete[z]) {
          console.warn("render already completed for", z);
          return resolve("");
        }
        const job = setTimeout(async () => {
          const key = `render_${z}_${payload.url}`;
          if (!mupdf || !doc) {
            console.error("mupdf not loaded", mupdf, doc);
            reject("mupdf not loaded");
            return;
          }
          // console.time(key);
          const instance = await getInstance();
          const png = instance.instance.drawPageAsPNG(instance.doc!, z, DPI);
          // console.timeEnd(key);
          const checkCancel = () => {
            if (canceled) {
              reject(`renderPage ${z} -- canceled due to unmount`);
              __log("rcanceled", key);
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
            // console.time(key + "_sort");

            const ret = [...prevState];
            ret[z - 1] = { ...ret[z - 1], png, num: z };
            // console.timeEnd(key + "_sort");
            // __log("sortDone", key);
            renderComplete[z] = true;
            resolve(z);
            return ret;
          });
        });
        renderJobs.push(job);
      });
    },
    [setState, mupdf, doc]
  );

  const isFullyLoaded = () => {
    return Object.keys(renderComplete).length === numPages;
  };

  const getPreviousUnrenderedPage = (curPage: number) => {
    for (let i = Math.max(0, curPage - 1); i > 0; i--) {
      if (!renderComplete[i]) {
        return i;
      }
    }
    return null;
  };
  const getNextUnrenderedPage = (curPage: number) => {
    for (let i = Math.min(curPage + 1, numPages!); i <= numPages!; i++) {
      if (!renderComplete[i]) {
        return i;
      }
    }
    return null;
  };

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
            <InView>
              {(inView: boolean) =>
                item.png && inView ? (
                  <div className={`h-full w-full bg-white`}>
                    <img src={item.png} />
                  </div>
                ) : (
                  <div className={`h-full w-full bg-white`}></div>
                )
              }
            </InView>
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
