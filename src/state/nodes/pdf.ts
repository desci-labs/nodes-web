import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "@src/components/organisms/Paper/constants";

interface LoadState {
  loadPercent: number;
  loadProgressTaken: boolean;
  loadError: boolean;
}

interface ZoomParams {
  zoomMagnitude: number;
  centerCoords?: [number, number];
}

type AnnotationSwitch = "next" | "prev" | null;
interface PdfViewerState {
  currentPdf: string;
  selectedAnnotationId: string;
  zoom: number;
  pdfCurrentPage: number;
  pdfTotalPages: number;
  viewLoading: boolean;
  hoveredAnnotationId: string | null;
  isEditingAnnotation: boolean;
  isEditingAnnotationMaximized: boolean; // user expanded the annotation window for a full height
  isAnnotating: boolean;
  loadState: LoadState;
  keepAnnotating: boolean;
  centeredZoom: ZoomParams | null;
  annotationSwitchCall: AnnotationSwitch;
  startedNewAnnotationViaButton: boolean;
}

export const initialState: PdfViewerState = {
  zoom: 1,
  currentPdf: "",
  pdfCurrentPage: 1,
  viewLoading: false,
  isAnnotating: false,
  keepAnnotating: false,
  isEditingAnnotation: false,
  selectedAnnotationId: "",
  hoveredAnnotationId: null,
  isEditingAnnotationMaximized: false,
  loadState: {
    loadProgressTaken: false,
    loadError: false,
    loadPercent: 0,
  },
  centeredZoom: null,
  annotationSwitchCall: null,
  startedNewAnnotationViaButton: false,
  pdfTotalPages: 0,
};

export const pdfViewerSlice = createSlice({
  initialState,
  name: "pdfViewer",
  reducers: {
    resetState: (state) => {
      return initialState;
    },
    resetPdfReaderField: (
      state,
      { payload }: PayloadAction<(keyof Partial<PdfViewerState>)[]>
    ) => {
      const update: Record<string, any> = {};
      Object.keys(payload).forEach(
        (field: string, idx: number, arr: string[]) => {
          update[field] = initialState[field as keyof PdfViewerState];
        }
      );

      return { ...state, ...update };
    },
    setViewLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.viewLoading = payload;
    },
    setIsAnnotating: (state, { payload }: PayloadAction<boolean>) => {
      state.isAnnotating = payload;
    },
    setKeepAnnotating: (state, { payload }: PayloadAction<boolean>) => {
      state.keepAnnotating = payload;
    },
    setHoveredAnnotationId: (state, { payload }: PayloadAction<string>) => {
      state.hoveredAnnotationId = payload;
    },
    setAnnotationSwitchCall: (
      state,
      { payload }: PayloadAction<AnnotationSwitch>
    ) => {
      state.annotationSwitchCall = payload;
    },
    setIsEditingAnnotation: (state, { payload }: PayloadAction<boolean>) => {
      state.isEditingAnnotation = payload;
    },
    setAnnotatingViaButton: (state, { payload }: PayloadAction<boolean>) => {
      state.startedNewAnnotationViaButton = payload;
    },
    setSelectedAnnotationId: (state, { payload }: PayloadAction<string>) => {
      state.selectedAnnotationId = payload;
    },
    setisEditingAnnotationMaximized: (
      state,
      { payload }: PayloadAction<boolean>
    ) => {
      state.isEditingAnnotationMaximized = payload;
    },
    setCurrentPdf: (state, { payload }: PayloadAction<string>) => {
      state.currentPdf = payload;
    },
    setCurrentPage: (state, { payload }: PayloadAction<number>) => {
      state.pdfCurrentPage = payload;
    },
    setTotalPages: (state, { payload }: PayloadAction<number>) => {
      state.pdfTotalPages = payload;
    },

    setLoadState: (state, { payload }: PayloadAction<Partial<LoadState>>) => {
      state.loadState = { ...state.loadState, ...payload };
    },
    setZoom: (state, { payload }: PayloadAction<number>) => {
      state.zoom = payload;
    },
    zoomOut: (state) => {
      state.centeredZoom = {
        zoomMagnitude: Math.max(state.zoom - ZOOM_STEP, MIN_ZOOM) - state.zoom,
      };
    },
    zoomIn: (state) => {
      state.centeredZoom = {
        zoomMagnitude: Math.min(state.zoom + ZOOM_STEP, MAX_ZOOM) - state.zoom,
      };
    },
    addToZoom: (state, { payload: amount }: PayloadAction<number>) => {
      state.zoom = Math.min(Math.max(state.zoom + amount, MIN_ZOOM), MAX_ZOOM);
    },
    setCenteredZoom: (state, { payload }: PayloadAction<ZoomParams>) => {
      state.centeredZoom = payload;
    },
    resetCenteredZoom: (state) => {
      state.centeredZoom = null;
    },
    updatePdfPreferences: (
      state,
      { payload }: PayloadAction<Partial<PdfViewerState>>
    ) => {
      const update = { ...state, ...payload };
      return update;
    },
  },
});

export default pdfViewerSlice.reducer;

export const {
  setZoom,
  zoomIn,
  zoomOut,
  addToZoom,
  setLoadState,
  setTotalPages,
  setCurrentPdf,
  setViewLoading,
  setCurrentPage,
  setCenteredZoom,
  setIsAnnotating,
  resetCenteredZoom,
  setKeepAnnotating,
  resetPdfReaderField,
  updatePdfPreferences,
  setIsEditingAnnotation,
  setHoveredAnnotationId,
  setAnnotatingViaButton,
  setAnnotationSwitchCall,
  setSelectedAnnotationId,
  setisEditingAnnotationMaximized,
} = pdfViewerSlice.actions;

/* 

const dispatch = useSetter();
const { } = usePdfReader();

*/