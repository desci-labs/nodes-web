import {
  BasePoint,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
} from "slate";
import { CustomText } from "./custom-types";

export const isDirectoryLink = (node: SlateNode) => {
  return (
    SlateElement.isElement(node) &&
    node.type === "link" &&
    node.link.startsWith("#/")
  );
};

export const nextSelectionBehavior = (
  editor: Editor,
  selection: BasePoint | undefined,
  event: React.KeyboardEvent<HTMLDivElement>
) => {
  if (selection) {
    const [mathInPath] = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: (n) => SlateElement.isElement(n) && n.type === "math",
      })
    );

    const nextLeaf = Editor.leaf(editor, selection);
    const nextLeafObj: CustomText = nextLeaf[0];

    if (!!mathInPath || nextLeafObj.inlineMath) {
      event.preventDefault();
    }
  }
};

export const isAlphaNumeric = (key: string) => {
  key = key.toLowerCase();

  if (key.length !== 1) {
    return false;
  }

  const isLetter = key >= "a" && key <= "z";
  const isNumber = key >= "0" && key <= "9";

  return isLetter || isNumber;
};
