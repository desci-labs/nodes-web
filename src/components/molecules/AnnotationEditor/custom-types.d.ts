import {
  Text,
  createEditor,
  Node,
  Element,
  Editor,
  Descendant,
  BaseEditor,
} from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type BlockQuoteElement = {
  type: "block_quote";
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  align?: string;
  children: Descendant[];
};

export type NumberedListElement = {
  type: "numbered-list";
  align?: string;
  children: Descendant[];
};

export type CheckListItemElement = {
  type: "check-list-item";
  checked: boolean;
  children: Descendant[];
};

export type EditableVoidElement = {
  type: "editable-void";
  children: EmptyText[];
};

export type HeadingOneElement = {
  type: "heading_one";
  align?: string;
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: "heading_two";
  align?: string;
  children: Descendant[];
};

export type ImageElement = {
  type: "image";
  url: string;
  children: EmptyText[];
};

export type LinkElement = {
  type: "link";
  link: string;
  fileName?: string;
  children: Descendant[];
};

export type ButtonElement = { type: "button"; children: Descendant[] };

export type ListItemElement = { type: "list-item"; children: Descendant[] };

export type MentionElement = {
  type: "mention";
  character: string;
  children: CustomText[];
};

export type ParagraphElement = {
  type: "paragraph";
  align?: string;
  children: Descendant[];
};

export type TableElement = { type: "table"; children: TableRow[] };

export type TableCellElement = { type: "table-cell"; children: CustomText[] };

export type TableRowElement = { type: "table-row"; children: TableCell[] };

export type TitleElement = { type: "title"; children: Descendant[] };

export type VideoElement = {
  type: "video";
  url: string;
  children: EmptyText[];
};

export type MathElement = { type: "math"; children: Descendant[] };

type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | CheckListItemElement
  | EditableVoidElement
  | HeadingOneElement
  | HeadingTwoElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | ListItemElement
  | MentionElement
  | ParagraphElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | TitleElement
  | VideoElement
  | MathElement;

export type CustomText = {
  inlineMath?: boolean;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  text: string;
};

export type EmptyText = {
  text: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
  }
}
