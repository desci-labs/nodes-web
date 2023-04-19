/* eslint-disable no-restricted-globals */
import { MuPdf, createMuPdf } from "mupdf-js/dist";

const worker = await createMuPdf();

self.onmessage = (e: MessageEvent<string>) => {
  console.log("GORT MSG", e);
  (async () => {
    const obj: any = e.data[0];
    debugger;
    if (obj.url) {
      const file = await fetch(obj.url);
      const buf = await file.arrayBuffer();
      const arrayBuf = new Uint8Array(buf);
      const doc = await worker.load(arrayBuf);
    }
  })();
};

export {};
