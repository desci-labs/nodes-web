import React, { MutableRefObject, useEffect, useState } from "react";
import { BehaviorSubject, Subject } from "rxjs";
import {
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
  ResearchObjectV1History,
  ResearchObjectV1Validation,
} from "@desci-labs/desci-models";
import { EditorHistory } from "@components/organisms/ManuscriptComponentsSection";
import { PageMetadata } from "@components/organisms/Paper/usePageMetadata";
import { HistoryEntryProps } from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/HistoryEntry";
import { UploadQueueItem } from "@components/organisms/UploadPanel";
import { DriveJumpingParams, DriveObject } from "@components/organisms/Drive";
import { Wallet } from "@src/state/api/types";


/* ########################### Customizable options ################################ */

interface Dialog {
  title: string;
  message: string;
  actions: ({ close }: any) => JSX.Element;
}

interface CodeFileTabs {
  sha?: string;
  url?: string;
  name?: string;
  path?: string;
  exec?: string;
}

/**
 * All variables need to be defined for setters to be generated. Please don't use
 * `?:` in State, use `| undefined` instead.
 */
interface State {
  pendingCommits: { [uuid: string]: ResearchObjectV1History[] };
  scrollRef: MutableRefObject<any> | undefined;
  selectedHistoryId: string | undefined;
  validations: ResearchObjectV1Validation[]; // TODO Remove;
  editorHistory: EditorHistory[];
  codeViewState: {
    isTerminalVisible: boolean;
  };
  requestedCodeFile: CodeFileTabs | null | undefined;
  codeFileTabs: any[];
  codeFileTabIndex: number;
  changesToCommit: any[];
  dialogs: Dialog[];
  showSavingIndicator: boolean;
  scrollToPage$: Subject<number | null>;
  showWalletManager: boolean;
  selectingWallet: boolean;
  wallets: Wallet[];
  publishMap: { [uuid: string]: IndexedNode };
  showShareMenu: boolean;
  pageMetadata: PageMetadata[];
  lastScrollTop: { [componentId: string]: number };
  isAddingComponent: boolean;
  isAddingSubcomponent: boolean;
  useMenuCids: string[];
  droppedFileList: FileList | null;
  droppedTransferItemList: FileSystemEntry[] | null;
  addComponentType: ResearchObjectComponentType | null;
  addComponentSubType: ResearchObjectComponentSubtypes | null;
  showCitationModal: boolean;
  selectedHistory: HistoryEntryProps | null;
  showPublicationDetails: boolean;
  showUploadPanel: boolean;
  uploadQueue: UploadQueueItem[];
  batchUploadProgress: Record<string, number>;
  driveJumpDir: DriveJumpingParams | null;
  showProfileUpdater: boolean;
  componentToCite: DriveObject | null;
  privCidMap: Record<string, boolean>;
  forceRefreshDrive: boolean;
  showAddNewNode: boolean;
}

export const LS_PENDING_COMMITS_KEY = "DESCI_PENDING_COMMITS";
export const LS_VSCODE_ENABLED = "desci:vscode:enable";

/**
 * Must initialize variables for setter to be made - even if just undefined.
 * This is because the interface `State` does not exist at runtime.
 *
 * TODO: consider using class-based approach to allow type setting and
 * variable initialization to happen in one place.
 */
export const initialState: State = {
  requestedCodeFile: null,
  pendingCommits: JSON.parse(
    localStorage.getItem(LS_PENDING_COMMITS_KEY) || "{}"
  ),
  publishMap: {},
  validations: [],
  scrollToPage$: new Subject<number | null>(),
  scrollRef: undefined,
  droppedFileList: null,
  droppedTransferItemList: null,
  selectedHistory: null,
  selectedHistoryId: "0",
  lastScrollTop: {},
  editorHistory: [],
  dialogs: [],
  showSavingIndicator: false,
  showWalletManager: false,
  selectingWallet: false,
  wallets: [],
  codeViewState: {
    isTerminalVisible: false,
  },
  isAddingSubcomponent: false,
  isAddingComponent: false,
  // !!!HARDCODED
  codeFileTabs: [],
  codeFileTabIndex: 0,
  changesToCommit: [],
  showShareMenu: false,
  pageMetadata: [],
  useMenuCids: [],
  addComponentType: null,
  addComponentSubType: null,
  componentToCite: null,
  showCitationModal: false,
  showPublicationDetails: false,
  showUploadPanel: false,
  uploadQueue: [],
  batchUploadProgress: {},
  driveJumpDir: null,
  showProfileUpdater: false,
  privCidMap: {},
  forceRefreshDrive: false,
  showAddNewNode: false,
};

export interface IndexedNodeVersion {
  cid?: string;
  id?: string;
  time?: string;
}
export interface IndexedNode {
  id?: string;
  id10?: string;
  owner?: string;
  recentCid?: string;
  versions: IndexedNodeVersion[];
}

/**
 * All fields in initialState have auto-generated setter functions,
 * so please don't include setter functions here.
 */
const customUpdateFunctions = {
  pushToChangesToCommit: (component: any) => {
    const value = [...getControllerField("changesToCommit")];
    value.push(component);
    setControllerField("changesToCommit", value);
  },
  pushToCodeFileTabs: (component: any) => {
    const value = [...getControllerField("codeFileTabs")];
    value.push(component);
    setControllerField("codeFileTabs", value);
  },
  removeAtIndexCodeFileTabs: (index: number) => {
    const value = [...getControllerField("codeFileTabs")];
    value.splice(index, 1);
    setControllerField("codeFileTabs", value);
  },
};

/* ######################################################################################### */

const getControllerField = <K extends keyof State>(key: K): State[K] =>
  manuscriptController$.getValue()[key];

const setControllerField = <K extends keyof State>(key: K, val: State[K]) =>
  manuscriptController$.next({
    ...manuscriptController$.getValue(),
    [key]: val,
  });

const resetControllerField = <K extends keyof State>(key: K) =>
  manuscriptController$.next({
    ...manuscriptController$.getValue(),
    [key]: initialState[key],
  });

const createSetter =
  <K extends keyof State>(key: K) =>
  (val: State[K]) =>
    setControllerField(key, val);

const createResetter =
  <K extends keyof State>(key: K) =>
  () =>
    resetControllerField(key);

type Setters<T> = {
  [K in keyof T & string as `set${Capitalize<K>}`]: (val: T[K]) => void;
};

type Resetters<T> = {
  [K in keyof T & string as `reset${Capitalize<K>}`]: () => void;
};

/**
 * Create an object that has all the keys of initialState and dynamically creates setters for them
 */
const setterFunctions: Partial<Setters<State>> = {};
for (let key in initialState) {
  const updateFuncKey = ("set" +
    key.charAt(0).toUpperCase() +
    key.slice(1)) as keyof Setters<State>;
  setterFunctions[updateFuncKey] = createSetter(key as keyof State);
}

/**
 * Create an object that has all the keys of initialState and dynamically creates resetters for them
 */
const resetterFunctions: Partial<Resetters<State>> = {};
for (let key in initialState) {
  const resetFuncKey = ("reset" +
    key.charAt(0).toUpperCase() +
    key.slice(1)) as keyof Resetters<State>;
  resetterFunctions[resetFuncKey] = createResetter(key as keyof State);
}

export type StateWithUpdateFunctions = State &
  Setters<State> &
  Resetters<State> &
  typeof customUpdateFunctions; // TODO: dynamically create type

const initialStateWithUpdateFunctions: StateWithUpdateFunctions = {
  ...initialState,
  ...(setterFunctions as Setters<State>),
  ...(resetterFunctions as Resetters<State>),
  ...(customUpdateFunctions as typeof customUpdateFunctions),
};

/**
 * The store is a BehaviorSubject that listens and broadcasts simultaneously while persisting the state for
 * when new subscribers are created
 */
export const manuscriptController$ =
  new BehaviorSubject<StateWithUpdateFunctions>(
    initialStateWithUpdateFunctions
  );

/**
 * React hook version of the controller
 * @param fieldsToWatch
 * @returns
 */
export const useManuscriptController = (
  fieldsToWatch: (keyof State)[] = []
) => {
  const [state, setState] = useState<StateWithUpdateFunctions>(
    manuscriptController$.getValue()
  );

  useEffect(() => {
    if (fieldsToWatch.length) {
      const subscription = manuscriptController$.subscribe(
        (newState: StateWithUpdateFunctions) => {
          for (let field of fieldsToWatch) {
            if (newState[field] !== state[field]) {
              // console.log("M", field, JSON.stringify(newState[field]), JSON.stringify(state[field]));
              setState(newState);
              break;
            }
          }
        }
      );
      return () => subscription.unsubscribe();
    }
  }, [fieldsToWatch, state]);

  return state;
};

interface ManuscriptControllerHOCProps {
  fieldsToWatch?: (keyof State)[];
  children: (fields: StateWithUpdateFunctions) => React.ReactElement;
}

/**
 * HOC version of the controller
 * @param props
 * @returns
 */
export const ManuscriptControllerHOC = (
  props: ManuscriptControllerHOCProps
) => {
  const { fieldsToWatch = [], children } = props;

  const state = useManuscriptController(fieldsToWatch);

  return children(state);
};

export const resetManuscriptController = () => {
  manuscriptController$.next(initialStateWithUpdateFunctions);
};
