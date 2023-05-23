import useKeyPress from "@hooks/useKeyPress";
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DriveObject } from "../types";
import { buildMenu } from "./MenuList";
import DriveTableFilePicker from "../../DriveFilePicker";

type ShowMenuProps = { coords: { x: number; y: number }; file: DriveObject };
const setContext = createContext<{
  showMenu: (props: ShowMenuProps) => void;
  renderMenu: (file: DriveObject) => void;
  closeMenu: () => void;
}>({
  showMenu: () => {},
  closeMenu: () => {},
  renderMenu: () => {},
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
  const [showPicker, setShowPicker] = useState<boolean>(true);
  const escKeyPressed = useKeyPress("Escape");

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
    setMenu(menuToRender);
  };

  const closeMenu = () => {
    setMenu(null);
    setCoords(null);
  };

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
    <setContext.Provider value={{ showMenu, closeMenu, renderMenu }}>
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
        {showPicker && (
          <div className="w-64 left-64 relative bg-neutrals-gray-1 rounded-xl text-white">
            <DriveTableFilePicker
              onRequestClose={() => {}}
              onInsert={() => {}}
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
