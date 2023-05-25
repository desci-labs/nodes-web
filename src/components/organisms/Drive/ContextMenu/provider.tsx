import useKeyPress from "@hooks/useKeyPress";
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DriveObject } from "../types";
import { buildMenu } from "./MenuList";
import DriveTableFilePicker, { DrivePickerMode } from "../../DriveFilePicker";
import { useSetter } from "@src/store/accessors";
import { moveFilesThunk } from "@src/state/drive/driveSlice";
import { useClickAway } from "react-use";
import { navigateToDrivePickerByPath } from "@src/state/drive/driveSlice";

type ShowMenuProps = { coords: { x: number; y: number }; file: DriveObject };
const setContext = createContext<{
  showMenu: (props: ShowMenuProps) => void;
  renderMenu: (file: DriveObject) => void;
  closeMenu: () => void;
  openDrivePicker: () => void;
}>({
  showMenu: () => {},
  closeMenu: () => {},
  renderMenu: () => {},
  openDrivePicker: () => {},
});
const getContext = createContext<{ coords: { x: number; y: number } | null }>({
  coords: { x: 0, y: 0 },
});

const $body = document.querySelector("body");

function calcMaxWidth() {
  if (!$body) return 250;
  return Math.min($body?.clientWidth, 250);
}
function calMaxHeight() {
  const $appHeader = document.querySelector(".app-header");
  if (!$body || !$appHeader) return 300;
  return Math.min(500, $body?.clientHeight - $appHeader?.clientHeight);
}

export default function ContextMenuProvider(props: PropsWithChildren<{}>) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [Menu, setMenu] = useState<ReactNode>();
  const [showDrivePicker, setShowDrivePicker] = useState<boolean>(false);
  const escKeyPressed = useKeyPress("Escape");
  const [lastFile, setLastFile] = useState<DriveObject | undefined>(undefined);
  const pickerRef = useRef<HTMLDivElement>(null);

  const dispatch = useSetter();

  const handleClick = useCallback((event: MouseEvent) => {
    const path = event.composedPath && event.composedPath();
    const menuIsInPath = path.find(
      (p) => (p as HTMLElement).id === "context-menu"
    );
    if (menuIsInPath) return;
    closeMenu();
  }, []);

  const showMenu = (props: ShowMenuProps) => {
    setCoords(props.coords);
    $body?.addEventListener("click", handleClick);
  };

  const renderMenu = (file: DriveObject) => {
    const menuToRender = buildMenu(file);
    setLastFile(file);
    setMenu(menuToRender);
  };

  const closeMenu = () => {
    setMenu(null);
    // setCoords(null);
  };

  const openDrivePicker = () => {
    dispatch(
      navigateToDrivePickerByPath({
        path: lastFile?.path!,
      })
    );
    setShowDrivePicker(true);
  };

  useClickAway(pickerRef, (e) => {
    setShowDrivePicker(false);
  });

  useEffect(() => {
    if (escKeyPressed) {
      closeMenu();
    }
  }, [escKeyPressed]);

  useEffect(
    () => () => $body?.removeEventListener("click", handleClick),
    [handleClick]
  );

  return (
    <setContext.Provider
      value={{ showMenu, closeMenu, renderMenu, openDrivePicker }}
    >
      <getContext.Provider value={{ coords }}>
        {!!Menu && (
          <div
            role="dialog"
            aria-modal="true"
            id="context-menu"
            style={{
              top: coords?.y,
              left: coords?.x,
              width: "320px",
              // minHeight: "200px",
              maxWidth: calcMaxWidth(),
              maxHeight: calMaxHeight(),
            }}
            className={`fixed bg-white dark:bg-[#272727] text-neutrals-gray-8 rounded-md overflow-y-hidden z-20 scroll-hidden transition-opacity shadow-xl ${
              coords ? "will-change-opacity animate-fadeIn" : ""
            }`}
          >
            {Menu}
          </div>
        )}
        {props.children}
        {showDrivePicker && (
          <div
            ref={pickerRef}
            className="w-64 absolute bg-neutrals-black rounded-xl text-white h-fit shadow-lg"
            style={{
              left: coords?.x,
              top: coords?.y! - 50,
            }}
          >
            <DriveTableFilePicker
              onRequestClose={() => {
                setShowDrivePicker(false);
              }}
              onInsert={(newDir: DriveObject) => {
                dispatch(
                  moveFilesThunk({ item: lastFile!, newDirectory: newDir })
                );
                setShowDrivePicker(false);
              }}
              mode={DrivePickerMode.MOVE}
              contextDrive={lastFile}
            />
          </div>
        )}
      </getContext.Provider>
    </setContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(setContext);
  if (!context) {
    throw Error(
      "useContextMenu Error: cannot access <ContextMenuProvider /> in this component. wrap it with ContextMenuProvider"
    );
  }
  return context;
}
export function useContextMenuPosition() {
  const context = useContext(getContext);
  if (!context) {
    throw Error(
      "useContextMenu Error: cannot access <ContextMenuProvider /> in this component. wrap it with ContextMenuProvider"
    );
  }
  return context;
}
