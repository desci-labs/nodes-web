import { combineReducers } from "@reduxjs/toolkit";
import { historyReducer } from "./history";
import pdfViewerReducer from "./pdf";
import nodeReaderReducer from "./viewer";

export const nodesReducer = combineReducers({
  pdfViewer: pdfViewerReducer,
  nodeReader: nodeReaderReducer,
  nodeHistory: historyReducer,
});
