import { combineReducers } from "@reduxjs/toolkit";
import pdfViewerReducer from "./pdf";
import nodeReaderReducer from "./viewer";

export const nodesReducer = combineReducers({
  pdfViewer: pdfViewerReducer,
  nodeReader: nodeReaderReducer,
});
