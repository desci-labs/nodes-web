import {
  ResearchObjectComponentAnnotation,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Author,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateDraft } from "@src/api";
import { AnnotationLinkConfig } from "@src/components/molecules/AnnotationEditor/components";
import { cleanupManifestUrl } from "@src/components/utils";
import { RootState } from "@src/store";
import axios from "axios";

export type ReaderMode = "reader" | "editor";

export enum ResearchTabs {
  current = "current",
  history = "history",
  source = "source",
}

export interface EditNodeParams {
  uuid: string;
  title: string;
  licenseType: any;
  // researchFields: string[];
}

export enum ManifestDataStatus {
  Idle = "Idle",
  Pending = "Pending",
  Fulfilled = "Fulfilled",
  Rejected = "Rejected",
}
export interface NodeReaderPref {
  isNew: boolean;
  mode: ReaderMode;
  manifestCid: string;
  publicView: boolean;
  editingNodeParams?: EditNodeParams | null;
  currentObjectId?: string;
  shareId?: string;
  isDraggingFiles: boolean;
  isCommitPanelOpen: boolean;
  manifest?: ResearchObjectV1;
  researchPanelTab: ResearchTabs;
  isResearchPanelOpen: boolean;
  lastScrollTop: Record<string, number>;
  startedNewAnnotationViaButton: boolean;
  componentStack: ResearchObjectV1Component[];
  manifestStatus: ManifestDataStatus;
  annotationLinkConfig?: AnnotationLinkConfig | null;
}

const initialState: NodeReaderPref = {
  isNew: false,
  mode: "reader",
  manifestCid: "",
  editingNodeParams: null,
  currentObjectId: "",
  lastScrollTop: {},
  publicView: false,
  componentStack: [],
  isDraggingFiles: false,
  isCommitPanelOpen: false,
  isResearchPanelOpen: true,
  researchPanelTab: ResearchTabs.current,
  startedNewAnnotationViaButton: false,
  manifestStatus: ManifestDataStatus.Idle,
  annotationLinkConfig: null,
};

export const nodeReaderSlice = createSlice({
  initialState,
  name: "nodeViewer",
  reducers: {
    resetNodeViewer: (state) => initialState,
    toggleMode: (state) => {
      state.mode = state.mode === "reader" ? "editor" : "reader";
    },
    resetEditNode: (state) => {
      state.editingNodeParams = null;
    },
    setEditNodeId: (state, { payload }: PayloadAction<EditNodeParams>) => {
      state.editingNodeParams = payload;
    },
    setManifestData: (
      state,
      { payload }: PayloadAction<{ manifest: ResearchObjectV1; cid: string }>
    ) => {
      state.manifest = payload.manifest;
      state.manifestCid = payload.cid;
      state.manifestStatus = ManifestDataStatus.Idle;
    },
    setManifest: (state, { payload }: PayloadAction<ResearchObjectV1>) => {
      state.manifestStatus = ManifestDataStatus.Idle;
      state.manifest = payload;
    },
    addNodeAuthor: (
      state,
      { payload }: PayloadAction<ResearchObjectV1Author>
    ) => {
      if (!state.manifest) return;

      if (!state.manifest?.authors) {
        state.manifest.authors = [];
      }

      state.manifest?.authors?.push(payload);
    },
    updateNodeAuthor: (
      state,
      {
        payload,
      }: PayloadAction<{ update: ResearchObjectV1Author; index: number }>
    ) => {
      if (!state.manifest?.authors) return state;
      state.manifest.authors = state.manifest.authors.map((author, idx) => {
        if (idx === payload.index) return payload.update;
        return author;
      });
    },
    removeAuthor: (
      state,
      { payload }: PayloadAction<{ authorIndex: number }>
    ) => {
      if (!state.manifest?.authors) return state;
      const authors = state.manifest.authors.filter(
        (_, idx) => idx !== payload.authorIndex
      );
      state.manifest.authors = authors;
    },
    deleteComponent: (
      state,
      { payload }: PayloadAction<{ componentId: string }>
    ) => {
      if (state.manifest) {
        state.manifest.components = state.manifest.components.filter(
          (component) => component.id !== payload.componentId
        );
      }
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
    setAnnotationLinkConfig: (
      state,
      { payload }: PayloadAction<AnnotationLinkConfig | null>
    ) => {
      state.annotationLinkConfig = payload;
    },
    setManifestCid: (state, { payload }: PayloadAction<string>) => {
      state.manifestCid = payload;
    },
    setCurrentObjectId: (state, { payload }: PayloadAction<string>) => {
      state.currentObjectId = payload;
    },
    setCurrentShareId: (state, { payload }: PayloadAction<string>) => {
      state.shareId = payload;
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

        if (
          lastStackComponent &&
          lastComponent.type === ResearchObjectComponentType.PDF
        ) {
          const lastScrollTop = state.lastScrollTop[lastComponent.id];
          if (lastScrollTop) {
            setTimeout(() => {
              document.scrollingElement!.scrollTop = lastScrollTop!;
            });
          }
        }
      }
      state.annotationLinkConfig = null;
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
      state.annotationLinkConfig = null;
      return state;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(saveManifestDraft.pending, (state) => {
        state.manifestStatus = ManifestDataStatus.Pending;
      })
      .addCase(saveManifestDraft.fulfilled, (state, action) => {
        state.manifestStatus = ManifestDataStatus.Fulfilled;
      })
      .addCase(saveManifestDraft.rejected, (state, action) => {
        state.manifestStatus = ManifestDataStatus.Rejected;
      });
  },
});

type SaveManifestProps = {
  uuid?: string;
  onSucess?: () => void;
  onError?: (error?: any) => void;
};

export const saveManifestDraft = createAsyncThunk(
  `${nodeReaderSlice.name}/saveManifestDraft`,
  async (args: SaveManifestProps, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { manifest: manifestData, currentObjectId } = state.nodes.nodeReader;

    if (!manifestData) return;
    // console.log("Save Manifest", manifestData);
    try {
      const res = await updateDraft({
        manifest: manifestData!,
        uuid: args?.uuid ?? currentObjectId!,
      });

      const manifestUrl = cleanupManifestUrl(res.uri || res.manifestUrl);
      let response = res.manifestData;

      if (res.manifestData) {
        dispatch(setManifest(res.manifestData));
      } else {
        const { data } = await axios.get(manifestUrl);
        response = data;
        dispatch(setManifest(data));
      }
      dispatch(setManifestCid(res.uri));
      localStorage.setItem("manifest-url", manifestUrl);
      args?.onSucess?.();
      return response;
    } catch (e) {
      throw Error("Could not update manifest");
    }
  }
);

export default nodeReaderSlice.reducer;

export const {
  setIsNew,
  toggleMode,
  setManifest,
  removeAuthor,
  addNodeAuthor,
  setPublicView,
  setEditNodeId,
  resetEditNode,
  setManifestCid,
  setAnnotationLinkConfig,
  saveAnnotation,
  resetNodeViewer,
  deleteComponent,
  updateComponent,
  setManifestData,
  updateNodeAuthor,
  deleteAnnotation,
  toggleCommitPanel,
  setComponentStack,
  setCurrentShareId,
  setIsDraggingFiles,
  setCurrentObjectId,
  toggleResearchPanel,
  setResearchPanelTab,
  pushToComponentStack,
  popFromComponentStack,
  updatePendingAnnotations,
  setStartedNewAnnotationViaButton,
} = nodeReaderSlice.actions;
