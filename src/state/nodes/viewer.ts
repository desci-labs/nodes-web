import {
  ResearchObjectComponentAnnotation,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ReaderMode = "reader" | "editor";

export enum ResearchTabs {
  current = "current",
  history = "history",
  source = "source",
}

interface NodeReaderPref {
  isNew: boolean;
  mode: ReaderMode;
  manifestCid: string;
  publicView: boolean;
  currentObjectId?: string;
  isDraggingFiles: boolean;
  isCommitPanelOpen: boolean;
  manifest?: ResearchObjectV1;
  researchPanelTab: ResearchTabs;
  isResearchPanelOpen: boolean;
  lastScrollTop: Record<string, number>;
  componentStack: ResearchObjectV1Component[];
  startedNewAnnotationViaButton: boolean;
}

const initialState: NodeReaderPref = {
  isNew: false,
  mode: "reader",
  currentObjectId: "",
  manifestCid: "",
  lastScrollTop: {},
  publicView: false,
  componentStack: [],
  isDraggingFiles: false,
  isCommitPanelOpen: false,
  isResearchPanelOpen: true,
  researchPanelTab: ResearchTabs.current,
  startedNewAnnotationViaButton: false,
};

export const nodeReaderSlice = createSlice({
  initialState,
  name: "nodeViewerSlice",
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "reader" ? "editor" : "reader";
    },
    setManifestData: (
      state,
      { payload }: PayloadAction<{ manifest: ResearchObjectV1; cid: string }>
    ) => {
      state.manifest = payload.manifest;
      state.manifestCid = payload.cid;
    },
    setManifest: (state, { payload }: PayloadAction<ResearchObjectV1>) => {
      state.manifest = payload;
    },
    updateComponent: (
      state,
      {
        payload,
      }: PayloadAction<{ index: number; update: ResearchObjectV1Component }>
    ) => {
      if (state.manifest) {
        state.manifest.components = state.manifest.components.map(
          (component, idx) => {
            if (idx === payload.index) {
              return payload.update;
            }
            return component;
          }
        );
      }
    },
    updatePendingAnnotations: (
      state,
      {
        payload,
      }: PayloadAction<{
        componentIndex: number;
        annotations: ResearchObjectComponentAnnotation[];
      }>
    ) => {
      if (state.manifest) {
        state.manifest.components = state.manifest.components.map(
          (component, idx) => {
            if (idx === payload.componentIndex) {
              return {
                ...component,
                payload: {
                  ...component.payload,
                  annotations: payload.annotations,
                },
              };
            }
            return component;
          }
        );
      }
    },
    saveAnnotation: (
      state,
      {
        payload,
      }: PayloadAction<{
        componentIndex: number;
        annotationIndex: number;
        annotation: ResearchObjectComponentAnnotation;
      }>
    ) => {
      if (state.manifest) {
        state.manifest.components = state.manifest.components.map(
          (component, idx) => {
            if (idx === payload.componentIndex) {
              return {
                ...component,
                payload: {
                  ...component.payload,
                  annotations: component.payload.annotations.map(
                    (
                      annotation: ResearchObjectComponentAnnotation,
                      idx: number
                    ) => {
                      if (idx === payload.annotationIndex) {
                        return { ...payload.annotation, __client: undefined };
                      }
                      return annotation;
                    }
                  ),
                },
              };
            }
            return component;
          }
        );
      }
    },
    deleteAnnotation: (
      state,
      {
        payload,
      }: PayloadAction<{
        componentIndex: number;
        annotationId: string;
      }>
    ) => {
      if (state.manifest) {
        const components = state.manifest.components.map((component, idx) => {
          if (idx === payload.componentIndex) {
            component.payload = {
              ...component.payload,
              annotations: component.payload.annotations.filter(
                (ann: ResearchObjectComponentAnnotation) =>
                  ann.id !== payload.annotationId
              ),
            };
          }
          return component;
        });
        state.manifest.components = components;
      }
    },

    setManifestCid: (state, { payload }: PayloadAction<string>) => {
      state.manifestCid = payload;
    },
    setCurrentObjectId: (state, { payload }: PayloadAction<string>) => {
      state.currentObjectId = payload;
    },
    setIsDraggingFiles: (state, { payload }: PayloadAction<boolean>) => {
      state.isDraggingFiles = payload;
    },
    setIsNew: (state, { payload }: PayloadAction<boolean>) => {
      state.isNew = payload;
    },
    setPublicView: (state, { payload }: PayloadAction<boolean>) => {
      state.publicView = payload;
    },
    toggleResearchPanel: (state, { payload }: PayloadAction<boolean>) => {
      state.isResearchPanelOpen = payload;
    },
    setStartedNewAnnotationViaButton: (
      state,
      { payload }: PayloadAction<boolean>
    ) => {
      state.startedNewAnnotationViaButton = payload;
    },
    toggleCommitPanel: (state, { payload }: PayloadAction<boolean>) => {
      state.isCommitPanelOpen = payload;
    },
    setResearchPanelTab: (state, { payload }: PayloadAction<ResearchTabs>) => {
      state.researchPanelTab = payload;
    },
    setComponentStack: (
      state,
      { payload }: PayloadAction<ResearchObjectV1Component[]>
    ) => {
      if (payload.length) {
        const lastComponent = payload[payload.length - 1];

        const lastStack = state.componentStack;
        const lastStackComponent = lastStack[lastStack.length - 1];
        if (
          lastStackComponent &&
          lastStackComponent.type === ResearchObjectComponentType.PDF
        ) {
          const lastScrollTop = document.scrollingElement?.scrollTop ?? 0;
          state.lastScrollTop = {
            ...state.lastScrollTop,
            [lastComponent.id]: lastScrollTop,
          };
        }

        if (lastComponent.type === ResearchObjectComponentType.PDF) {
          const lastScrollTop = state.lastScrollTop[lastComponent.id];
          if (lastScrollTop) {
            setTimeout(() => {
              document.scrollingElement!.scrollTop = lastScrollTop!;
            });
          }
        }
      }
      state.componentStack = payload;
    },
    pushToComponentStack: (
      state,
      { payload }: PayloadAction<ResearchObjectV1Component>
    ) => {
      const value = state.componentStack;
      const lastComponent = value[value.length - 1];
      if (lastComponent.type === ResearchObjectComponentType.PDF) {
        const lastScrollTop = document.scrollingElement?.scrollTop ?? 0;
        state.lastScrollTop = {
          ...state.lastScrollTop,
          [lastComponent.id]: lastScrollTop,
        };
      }
      state.componentStack.push(payload);
    },
    popFromComponentStack: (state) => {
      const value = state.componentStack;
      value.pop();
      const remainingLastValue = value[value.length - 1];
      if (remainingLastValue) {
        let lastScrollTop = state.lastScrollTop[remainingLastValue.id];
        setTimeout(() => {
          document.scrollingElement!.scrollTop = lastScrollTop!;
        });
        state.lastScrollTop = {
          ...state.lastScrollTop,
          [remainingLastValue.id]: 0,
        };
      }
      return state;
    },
  },
});

export default nodeReaderSlice.reducer;

export const {
  setIsNew,
  toggleMode,
  setManifest,
  setPublicView,
  setManifestCid,
  saveAnnotation,
  updateComponent,
  setManifestData,
  deleteAnnotation,
  toggleCommitPanel,
  setComponentStack,
  setIsDraggingFiles,
  setCurrentObjectId,
  toggleResearchPanel,
  setResearchPanelTab,
  pushToComponentStack,
  popFromComponentStack,
  updatePendingAnnotations,
  setStartedNewAnnotationViaButton,
} = nodeReaderSlice.actions;
