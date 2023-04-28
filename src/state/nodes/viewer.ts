import {
  PdfComponent,
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
import { DrivePath } from "../drive/types";

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
  recentlyAddedComponent: DrivePath;
  annotationLinkConfig?: AnnotationLinkConfig | null;
  pdfScrollOffsetTop?: number;
  annotations: ResearchObjectComponentAnnotation[];
  annotationsByPage: Record<number, ResearchObjectComponentAnnotation[]>;
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
  recentlyAddedComponent: "",
  annotationLinkConfig: null,
  pdfScrollOffsetTop: 0,
  annotations: [],
  annotationsByPage: {},
};

export const getDefaultComponentForView = (manifest: ResearchObjectV1) => {
  return manifest.components.filter(
    (c) =>
      c.type !== ResearchObjectComponentType.DATA &&
      c.type !== ResearchObjectComponentType.UNKNOWN &&
      c.type !== ResearchObjectComponentType.DATA_BUCKET
  )[0];
};

export const nodeReaderSlice = createSlice({
  initialState,
  name: "nodeViewer",
  reducers: {
    replaceAnnotations: (
      state,
      { payload }: PayloadAction<ResearchObjectComponentAnnotation[]>
    ) => {
      if (payload) {
        const annotations = [...payload];
        state.annotations = annotations;
        state.annotationsByPage = annotations.reduce((acc, annotation) => {
          const pageIndex = annotation.pageIndex;
          if (pageIndex !== undefined) {
            if (!acc[pageIndex]) {
              acc[pageIndex] = [];
            }
            acc[pageIndex].push(annotation);
          }
          return acc;
        }, {} as Record<number, ResearchObjectComponentAnnotation[]>);
      }
    },
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

      const defaultComponent = getDefaultComponentForView(payload.manifest);
      if (
        defaultComponent &&
        defaultComponent.type === ResearchObjectComponentType.PDF
      ) {
        nodeReaderSlice.caseReducers.replaceAnnotations(state, {
          payload: defaultComponent.payload.annotations || [],
          type: "replaceAnnotations",
        });
      }
    },
    setManifest: (state, { payload }: PayloadAction<ResearchObjectV1>) => {
      state.manifestStatus = ManifestDataStatus.Idle;
      state.manifest = payload;
      const defaultComponent = getDefaultComponentForView(payload);
      if (
        defaultComponent &&
        defaultComponent.type === ResearchObjectComponentType.PDF
      ) {
        nodeReaderSlice.caseReducers.replaceAnnotations(state, {
          payload: defaultComponent.payload.annotations || [],
          type: "replaceAnnotations",
        });
      }
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
    addComponent: (
      state,
      { payload }: PayloadAction<{ component: ResearchObjectV1Component }>
    ) => {
      if (state.manifest) {
        state.manifest.components.push(payload.component);
      }
    },
    updateComponent: (
      state,
      {
        payload,
      }: PayloadAction<{
        index: number;
        update: Partial<ResearchObjectV1Component>;
      }>
    ) => {
      if (!state.manifest) return;
      if ("payload" in payload.update) {
        // Prevent previous payload overwrite
        payload.update.payload = {
          ...state.manifest.components[payload.index].payload,
          ...payload.update.payload,
        };
      }
      state.manifest.components[payload.index] = {
        ...state.manifest.components[payload.index],
        ...payload.update,
      };
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
        const defaultComponent =
          state.componentStack[state.componentStack.length - 1];

        if (
          defaultComponent &&
          defaultComponent.type === ResearchObjectComponentType.PDF
        ) {
          const componentDataFresh = state.manifest.components.find(
            (component) => component.id === defaultComponent.id
          );
          if (componentDataFresh) {
            nodeReaderSlice.caseReducers.replaceAnnotations(state, {
              payload: componentDataFresh.payload.annotations || [],
              type: "replaceAnnotations",
            });
          }
        }
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
              const updatedAnnotations = (
                component.payload.annotations || []
              ).map(
                (
                  annotation: ResearchObjectComponentAnnotation,
                  idx: number
                ) => {
                  if (idx === payload.annotationIndex) {
                    return { ...payload.annotation, __client: undefined };
                  }
                  return annotation;
                }
              );
              if (payload.annotationIndex === -1) {
                updatedAnnotations.push({
                  ...payload.annotation,
                  __client: undefined,
                });
              }
              return {
                ...component,
                payload: {
                  ...component.payload,
                  annotations: updatedAnnotations,
                },
              };
            }
            return component;
          }
        );
        const defaultComponent =
          state.componentStack[state.componentStack.length - 1];

        if (
          defaultComponent &&
          defaultComponent.type === ResearchObjectComponentType.PDF
        ) {
          const componentDataFresh = state.manifest.components.find(
            (component) => component.id === defaultComponent.id
          );
          if (componentDataFresh) {
            nodeReaderSlice.caseReducers.replaceAnnotations(state, {
              payload: componentDataFresh.payload.annotations || [],
              type: "replaceAnnotations",
            });
          }
        }
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
        const newComponent = payload[payload.length - 1];

        const lastStack = state.componentStack;
        const lastStackComponent = lastStack[lastStack.length - 1];

        if (
          lastStackComponent &&
          lastStackComponent.type === ResearchObjectComponentType.PDF
        ) {
          const lastScrollTop = document.scrollingElement?.scrollTop ?? 0;
          state.lastScrollTop = {
            ...state.lastScrollTop,
            [(lastStackComponent as PdfComponent).payload.url]: lastScrollTop,
          };
        }

        if (
          newComponent &&
          newComponent.type === ResearchObjectComponentType.PDF
        ) {
          const lastScrollTop = state.lastScrollTop[newComponent.payload.url];
          state.pdfScrollOffsetTop = lastScrollTop;
          // if (lastScrollTop) {
          //   setTimeout(() => {
          //     document.scrollingElement!.scrollTop = lastScrollTop!;
          //   }, 500);
          // }
        }
      }
      state.annotationLinkConfig = null;
      state.componentStack = payload;

      // keep annotations in sync
      const newTopComponent = payload[payload.length - 1];
      if (
        newTopComponent &&
        newTopComponent.type === ResearchObjectComponentType.PDF
      ) {
        nodeReaderSlice.caseReducers.replaceAnnotations(
          state,
          newTopComponent.payload.annotations || []
        );
      }
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
          [lastComponent.payload.url]: lastScrollTop,
        };
      }
      state.componentStack.push(payload);

      // keep annotations in sync
      const newTopComponent = payload;
      if (
        newTopComponent &&
        newTopComponent.type === ResearchObjectComponentType.PDF
      ) {
        nodeReaderSlice.caseReducers.replaceAnnotations(
          state,
          newTopComponent.payload.annotations || []
        );
      }
    },
    popFromComponentStack: (state) => {
      const value = state.componentStack;
      value.pop();
      const remainingLastValue = value[value.length - 1];
      if (
        remainingLastValue &&
        remainingLastValue.type === ResearchObjectComponentType.PDF
      ) {
        let lastScrollTop = state.lastScrollTop[remainingLastValue.payload.url];
        state.pdfScrollOffsetTop = lastScrollTop;

        state.lastScrollTop = {
          ...state.lastScrollTop,
          [remainingLastValue.payload.url]: 0,
        };
      }
      state.annotationLinkConfig = null;

      // keep annotations in sync
      const newTopComponent =
        state.componentStack[state.componentStack.length - 1];
      if (
        newTopComponent &&
        newTopComponent.type === ResearchObjectComponentType.PDF
      ) {
        nodeReaderSlice.caseReducers.replaceAnnotations(
          state,
          newTopComponent.payload.annotations || []
        );
      }
      return state;
    },
    addRecentlyAddedComponent: (
      state,
      { payload }: PayloadAction<DrivePath>
    ) => {
      state.recentlyAddedComponent = payload;
    },
    removeRecentlyAddedComponent: (state) => {
      state.recentlyAddedComponent = "";
    },
    removeComponentMetadata: (
      state,
      {
        payload: { componentIndexes },
      }: PayloadAction<{ componentIndexes: number[] }>
    ) => {
      componentIndexes.forEach((componentIndex) => {
        delete state.manifest!.components[componentIndex].payload.title;
        delete state.manifest!.components[componentIndex].payload.description;
        delete state.manifest!.components[componentIndex].payload.keywords;
        delete state.manifest!.components[componentIndex].payload.licenseType;
        delete state.manifest!.components[componentIndex].payload.ontologyPurl;
        delete state.manifest!.components[componentIndex].payload
          .controlledVocabTerms;
      });
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

export const selectNodeUuid = (state: {
  nodes: { nodeReader: NodeReaderPref };
}) => state.nodes.nodeReader.currentObjectId;

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
  replaceAnnotations,
  setStartedNewAnnotationViaButton,
  addComponent,
  addRecentlyAddedComponent,
  removeRecentlyAddedComponent,
  removeComponentMetadata,
} = nodeReaderSlice.actions;
