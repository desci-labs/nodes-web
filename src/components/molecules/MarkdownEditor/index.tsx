import React from "react";
import RichTextEditor, { ToolbarConfig } from "react-rte";
import "./style.css"
const getTextForEditor = (str: any) => {
  if (str === null) return RichTextEditor.createEmptyValue();

  // if it's an object, then it's probably the object the text editor expects
  if (typeof str === "object") return str;

  // if it's null, use the helper function from RichTextEditor to create the RichTextEditor object
  if (!str) {
    return RichTextEditor.createEmptyValue();
  }

  // else, create value from the given string
  return RichTextEditor.createValueFromString(str, "html");
};

const toolbarConfig: ToolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: [
    "INLINE_STYLE_BUTTONS",
    "BLOCK_TYPE_BUTTONS",
    "LINK_BUTTONS",
    // "BLOCK_TYPE_DROPDOWN",
    "HISTORY_BUTTONS",
  ],
  INLINE_STYLE_BUTTONS: [
    { label: "Bold", style: "BOLD", className: "custom-css-class" },
    { label: "Italic", style: "ITALIC" },
    { label: "Underline", style: "UNDERLINE" },
  ],
  BLOCK_TYPE_DROPDOWN: [
    { label: "Normal", style: "unstyled" },
    { label: "Heading Large", style: "header-one" },
    { label: "Heading Medium", style: "header-two" },
    { label: "Heading Small", style: "header-three" },
  ],
  BLOCK_TYPE_BUTTONS: [
    { label: "UL", style: "unordered-list-item" },
    { label: "OL", style: "ordered-list-item" },
  ],
};

export default function MarkdownEditor(props: any) {
  const { value, onChange } = props;
  return (
    <RichTextEditor
      toolbarConfig={toolbarConfig}
      value={getTextForEditor(value)}
      onChange={(newValue: any) => onChange(newValue)}
      data-testid={props["data-testid"]}
    />
  );
}
