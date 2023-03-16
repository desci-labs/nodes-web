import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { DriveObject } from "../types";
import { useContextMenu, useContextMenuPosition } from "./provider";

const $body = document.querySelector("body");

const normalizePosition = (
  scope: HTMLElement,
  { mouseX, mouseY }: { mouseX: number; mouseY: number }
) => {
  if (!$body) return { x: mouseX, y: mouseY };
  const { /* left: scopeOffsetX, */ top: scopeOffsetY } =
    scope.getBoundingClientRect();

  const $contextMenu = document.getElementById("context-menu");
  if (!$contextMenu) return { x: mouseX, y: mouseY };

  const outOfBoundsOnX = mouseX + $contextMenu.clientWidth > $body.clientWidth;
  const outOfBoundsOnY =
    mouseY + $contextMenu?.clientHeight > $body.clientHeight;
  let normalizedX = mouseX;
  let normalizedY = mouseY;

  if (outOfBoundsOnX) {
    normalizedX = mouseX + $contextMenu.clientWidth - $body.clientWidth;
  }

  if (outOfBoundsOnY) {
    normalizedY =
      scopeOffsetY + scope.clientHeight - $contextMenu.clientHeight + 100;
  }

  return { x: normalizedX, y: normalizedY };
};

export function useDriveContext<T extends HTMLElement>(file: DriveObject) {
  const [contextMenu, setContextMenu] = useState<T>();
  const { showMenu, renderMenu, closeMenu } = useContextMenu();
  const { coords } = useContextMenuPosition();

  const handler = useCallback(
    (e: MouseEvent) => {
      if (contextMenu) {
        e.preventDefault();
        closeMenu();
        renderMenu(file);
        const { clientX: mouseX, clientY: mouseY } = e;
        const { x, y } = normalizePosition(contextMenu, {
          mouseX,
          mouseY,
        });
        showMenu({ coords: { x, y }, file });
      }
    },
    [contextMenu, closeMenu, renderMenu, file, showMenu]
  );

  const handleResize = useCallback(() => {
    if (contextMenu && coords) {
      const { x, y } = normalizePosition(contextMenu, {
        mouseX: coords?.x,
        mouseY: coords.y,
      });
      showMenu({ coords: { x, y }, file });
    }
  }, [contextMenu, coords, file, showMenu]);

  useLayoutEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (contextMenu) {
      contextMenu.addEventListener("contextmenu", handler);
    }
    return () => {
      if (contextMenu) {
        contextMenu.removeEventListener("contextmenu", handler);
      }
    };
  }, [contextMenu, handler]);

  return { init: setContextMenu };
}
