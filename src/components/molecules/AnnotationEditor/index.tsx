import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  Range,
} from "slate";
import { withHistory } from "slate-history";
import PerfectScrollbar from "react-perfect-scrollbar";

import {
  Button,
  DirectoryLinkComponent,
  LinkComponent,
  Toolbar,
} from "./components";
import { CustomElement, CustomText } from "./custom-types";
import "./styles.scss";
// import slate, { serialize } from 'remark-slate'; // TODO: if this works, upload to forked repo and download via npm
import slate, { serialize } from "./remark-slate-master/src";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// @ts-ignore
import { InlineMath, BlockMath } from "react-katex";
import { decode } from "html-entities";
import { EMPTY_FUNC } from "@components/utils";
import {
  FormatBold,
  FormatCode,
  // FormatHyperlink,
  FormatItalic,
  FormatQuote,
  FormatUnderlined,
  IconCreateFolder,
  LatexLogo,
} from "@icons";
import useClickAway from "react-use/lib/useClickAway";
import DriveTable from "@components/organisms/DriveFilePicker";
import {
  isAlphaNumeric,
  isDirectoryLink,
  nextSelectionBehavior,
} from "./utils";
import toast from "react-hot-toast";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { usePdfReader } from "@src/state/nodes/hooks";

const HOTKEYS: any = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES: any = ["left", "center", "right", "justify"];

const convertSlateToMarkdown = (obj: any) =>
  obj
    .map((v: any) => serialize(v, { ignoreParagraphNewline: true }))
    .join("\n");

export const SlateEditor = (props: any) => {
  const {
    slateObject,
    onChange = EMPTY_FUNC,
    readOnly = false,
    setMode,
    rawMarkdown,
    setRawMarkdown,
  } = props;
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [showLatexButton, setShowLatexButton] = useState(false);

  const { isInline, deleteBackward, isVoid } = editor;

  editor.isInline = (element) => {
    switch (element.type) {
      case "link":
        return true;
      case "math":
        return false;
      default:
        return isInline(element);
    }
  };

  editor.isVoid = (element) => {
    return element.type === "link" && element.link.startsWith("#/")
      ? true
      : isVoid(element);
  };

  editor.deleteBackward = (...args) => {
    if (editor.selection) {
      const nextSelection = Editor.before(editor, editor.selection.focus);

      if (nextSelection) {
        const [mathInPath] = Array.from(
          Editor.nodes(editor, {
            at: nextSelection,
            match: (n) => SlateElement.isElement(n) && n.type === "math",
          })
        );

        const nextLeaf = Editor.leaf(editor, nextSelection);
        const nextLeafObj: CustomText = nextLeaf[0];

        if (!!mathInPath || nextLeafObj.inlineMath) {
          return Transforms.removeNodes(editor, {
            at: nextSelection,
            match: (n: any) =>
              n.inlineMath || (SlateElement.isElement(n) && n.type === "math"),
          });
        }
      }
    }

    deleteBackward(...args);
  };

  useEffect(() => {
    if (editor) {
      const [mathInPath] = Array.from(
        Editor.nodes(editor, {
          at: {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          },
          match: (n) => SlateElement.isElement(n) && n.type === "math",
        })
      );

      setShowLatexButton(!mathInPath);
    }
  }, []);

  const renderElement = useCallback((props) => {
    const nodeRef = Array.from(
      Editor.nodes(editor, {
        match: (n) => {
          return (
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            SlateElement.matches(props.element, n as CustomElement)
          );
        },
      })
    );

    return (
      <Element
        {...props}
        nodeRef={nodeRef}
        isSelected={!!nodeRef[0]}
        readOnly={readOnly}
      />
    );
  }, []);
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  const { isEditingAnnotation } = usePdfReader();

  return (
    <Slate editor={editor} value={slateObject} onChange={onChange}>
      <div
        className={`flex flex-col flex-1 ${
          isEditingAnnotation ? "min-h-[148px]" : "min-h-0"
        }`}
      >
        {!readOnly && (
          <Toolbar>
            <MarkButton
              format="bold"
              icon={
                <FormatBold
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              }
            />
            <MarkButton
              format="italic"
              icon={
                <FormatItalic
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              }
            />
            <MarkButton
              format="underline"
              icon={
                <FormatUnderlined
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              }
            />
            <MarkButton
              format="code"
              icon={
                <FormatCode
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              }
            />
            <BlockButton
              format="block_quote"
              icon={
                <FormatQuote
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              }
            />
            <DirectoryButton
              editor={editor}
              format="link"
              icon={
                <IconCreateFolder
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              }
            />

            <Button
              onClick={() => {
                setMode("raw");
                if (showLatexButton) {
                  setShowLatexButton(false);
                  toast.success("Switched to raw editor for LaTeX", {
                    duration: 5000,
                    position: "top-center",
                    style: {
                      marginTop: 0,
                      borderRadius: "10px",
                      background: "#111",
                      color: "#fff",
                    },
                  });
                  // add example latex to the end of the markdown to show user how to use it
                  setRawMarkdown(rawMarkdown + `\n$$\nE = mc^2\n$$`);
                }
              }}
            >
              <LatexLogo
                fill="black"
                className="cursor-pointer"
                width={40}
                height={20}
              />
            </Button>

            {/* <LinkButton format="link" icon={
                <FormatLink
                  fill="black"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              } /> */}
            {/* <MarkButton format="inlineMath" icon="inline_math" />
              <BlockButton format="math" icon="math" /> */}
            {/* <BlockButton format="heading_one" icon="h1" /> */}
            {/* <BlockButton format="heading_two" icon="h2" /> */}
            {/* <BlockButton format="numbered-list" icon="list_numbered" /> */}
            {/* <BlockButton format="bulleted-list" icon="list_bulleted" /> */}
            {/* <BlockButton format="left" icon="left" />
              <BlockButton format="center" icon="center" />
              <BlockButton format="right" icon="right" />
              <BlockButton format="justify" icon="justify" /> */}
          </Toolbar>
        )}
        <PerfectScrollbar className="flex-1 w-full overflow-hidden">
          <Editable
            // onDOMBeforeInput={handleDOMBeforeInput}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            scrollSelectionIntoView={() => {}}
            spellCheck
            //autoFocus // if true causes scroll to jump to top of page when starting to type in annotation
            readOnly={readOnly}
            onKeyDown={(e) => {
              // if (!editor.selection) {
              //   /**
              //    * With a non-editable node and nothing else in the editor
              //    * Slate will sometimes not register that the editor object
              //    * has a selection (editor.selection === null). So this
              //    * will cause the editor to, by default, place the cursor at
              //    * the end of the content
              //    */
              //   Transforms.select(editor, {
              //     anchor: Editor.end(editor, []),
              //     focus: Editor.end(editor, []),
              //   });
              // }
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, e as any)) {
                  e.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }

              if (editor.selection) {
                const leaf = Editor.leaf(editor, editor.selection);
                const leafObj: CustomText = leaf[0];

                const leftSelection = Editor.before(
                  editor,
                  editor.selection.focus
                );
                const rightSelection = Editor.after(
                  editor,
                  editor.selection.focus
                );

                const directoryLinksInPath = Array.from(
                  Editor.nodes(editor, {
                    match: (n) => isDirectoryLink(n),
                  })
                );
                const hasDirectoryLinkInPath = !!directoryLinksInPath.length;

                if (e.code === "ArrowLeft" || e.code === "Delete") {
                  nextSelectionBehavior(editor, leftSelection, e);
                } else if (e.code === "ArrowRight") {
                  nextSelectionBehavior(editor, rightSelection, e);
                } else if (e.code === "Delete" || e.code === "Backspace") {
                  if (leafObj.inlineMath) {
                    e.preventDefault();
                  }
                } else if (isAlphaNumeric(e.key)) {
                }
              }
            }}
          />
        </PerfectScrollbar>
      </div>
    </Slate>
  );
};

interface AnnotationEditorProps {
  rawMarkdown: string;
  setRawMarkdown?: (val: string) => void;
  readOnly?: boolean;
  mode?: "editor" | "raw";
  setMode?: (mode: "editor" | "raw") => void;
}

const AnnotationEditor = (props: AnnotationEditorProps) => {
  const {
    rawMarkdown,
    setRawMarkdown,
    readOnly = false,
    mode = "editor",
    setMode = EMPTY_FUNC,
  } = props;

  // const [rawMarkdown, setRawMarkdown] = useState<any>(sampleMarkdown)
  const [slateObject, setSlateObject] = useState<CustomElement[] | null>(null);

  // console.log("slateObject", slateObject);
  // console.log("rawMarkdown", rawMarkdown);

  useEffect(() => {
    unified()
      .use(remarkParse as any)
      .use(remarkMath)
      .use(rehypeKatex)
      .use(slate)
      .process(decode(rawMarkdown, { level: "html5" }), (err, file) => {
        setSlateObject(file?.result as CustomElement[]);
      });
  }, [rawMarkdown]);

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        {readOnly || mode === "editor" ? (
          slateObject !== null ? (
            <ErrorBoundary>
              <SlateEditor
                slateObject={slateObject}
                onChange={(obj: any) => {
                  if (setRawMarkdown) {
                    setRawMarkdown(convertSlateToMarkdown(obj));
                  }
                }}
                readOnly={readOnly}
                setMode={setMode}
                rawMarkdown={rawMarkdown}
                setRawMarkdown={setRawMarkdown}
                className="h-[100px]"
              />
            </ErrorBoundary>
          ) : null
        ) : (
          <textarea
            onChange={(e: any) => {
              if (setRawMarkdown) {
                setRawMarkdown(e.target.value);
              }
            }}
            className="bg-gray-100 outline-black border-0 !w-[calc(100%+12px)] font-mono -mx-3 text-xs"
            style={{ width: "100%", height: 100 }}
            value={rawMarkdown}
          />
        )}
        {!readOnly ? (
          <div className="flex flex-row justify-end mt-2">
            <PrimaryButton
              className="mr-1 text-xs font-normal text-neutrals-black border-neutrals-black border-2 !bg-white !px-2 !py-1.5 hover:!bg-black hover:!text-white"
              onClick={() => setMode(mode === "raw" ? "editor" : "raw")}
            >
              {mode === "raw" ? "Back to Editor" : "Edit Source"}
            </PrimaryButton>
          </div>
        ) : null}
      </div>
    </>
  );
};

const isLinkActive = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const linksInPath = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        SlateElement.isElement(n) &&
        n.type === "link" &&
        !n.link.startsWith("#/"),
    })
  );

  return !!linksInPath[0];
};

const toggleLink = (editor: Editor) => {
  const isActive = isLinkActive(editor);

  Transforms.unwrapNodes(editor, {
    match: (n) => {
      return (
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link"
      );
    },
    split: true,
  });

  if (!isActive) {
    const isCollapsed = Range.isCollapsed(editor.selection!);
    if (isCollapsed) {
      Editor.insertNode(editor, { text: "" });
    }
    const linkElem: any = { type: "link", link: "", children: [] };
    Transforms.wrapNodes(editor, linkElem, {
      // at: editor.selection!,
      // match: (n: any) => false,
      split: true,
      // mode: 'lowest'
    });
  }
};

const toggleBlock = (editor: Editor, format: CustomElement["type"]) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : ("type" as any)
  );
  const isList = LIST_TYPES.includes(format);
  const isBlock = format === "block_quote";
  const isMath = format === "math";

  /**
   * Remove all elements that match the match function
   */
  Transforms.unwrapNodes(editor, {
    match: (n) => {
      return (
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (LIST_TYPES.includes(n.type) ||
          n.type === "block_quote" ||
          n.type === "math") &&
        !TEXT_ALIGN_TYPES.includes(format)
      );
    },
    split: true,
  });

  let newProperties: Partial<SlateElement> = {};
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else if (!isBlock && !isMath) {
    /**
     * If isActive, revert to default (paragraph). Otherwise, check isList else the format is the type
     */
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  // only sets the nodes for the selection (default)
  Transforms.setNodes<SlateElement>(editor, newProperties);

  // If we are activating a list block, wrap the selected nodes in the respective list type
  if (!isActive && (isList || isBlock || isMath)) {
    const block: any = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: CustomElement["type"]) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: Editor,
  format: CustomElement["type"],
  blockType: keyof CustomElement = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        return (
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n[blockType] === format
        );
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: Editor, format: CustomElement["type"]) => {
  const marks: any = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = (params: {
  attributes: any;
  children: any;
  element: CustomElement;
  nodeRef: any;
  isSelected: boolean;
  readOnly: boolean;
}) => {
  const {
    attributes,
    children,
    element,
    nodeRef,
    isSelected,
    readOnly,
    ...rest
  } = params;
  const style = { textAlign: element["align" as keyof CustomElement] };

  switch (element.type) {
    case "block_quote":
      return (
        <blockquote {...attributes} style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading_one":
      return (
        <h1 {...attributes} className="text-xl" style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading_two":
      return (
        <h2 {...attributes} className="text-lg" style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li {...attributes} style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol {...attributes} style={style} {...attributes}>
          {children}
        </ol>
      );
    // @ts-ignore
    case "math":
      if (children[0]?.props?.text?.text) {
        return (
          // <span {...attributes} contentEditable={false}>
          <div
            {...attributes}
            contentEditable={false}
            style={{ userSelect: "none" }}
          >
            <BlockMath style={style}>{children[0].props.text.text}</BlockMath>
          </div>
        );
        // return (
        //   <>
        //   {
        //     children.map((child: any, i: number) => {
        //       if(child?.props?.text?.text) {
        //         return (
        //           <h3 key={`blockmath-${i}`} style={style} {...attributes}>
        //             {
        //               child.props.text.text
        //             }
        //           </h3>
        //         )
        //       } else {
        //         return child
        //       }
        //     })
        //   }
        //   </>
        // )
      } else {
        return (
          <p style={style} {...attributes}>
            {children}
          </p>
        );
      }
    case "link":
      if (element.link.startsWith("#/")) {
        return (
          <DirectoryLinkComponent
            attributes={attributes}
            href={element.link}
            fileName={element.fileName}
            nodeRef={nodeRef}
            element={element}
            readOnly={readOnly}
            {...{ children }}
          />
        );
      } else {
        return (
          <LinkComponent
            attributes={attributes}
            href={element.link}
            isSelected={isSelected}
            nodeRef={nodeRef}
            element={element}
            {...{ children }}
          />
        );
      }
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong {...attributes}>{children}</strong>;
  }

  if (leaf.code) {
    children = <code {...attributes}>{children}</code>;
  }

  if (leaf.italic) {
    children = <em {...attributes}>{children}</em>;
  }

  if (leaf.underline) {
    children = <u {...attributes}>{children}</u>;
  }

  if (leaf.inlineMath) {
    children = (
      <span
        {...attributes}
        contentEditable={false}
        style={{ userSelect: "none" }}
      >
        <InlineMath math={leaf.text} />
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

const LinkButton = ({ format, icon }: { format: any; icon: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        toggleLink(editor);
      }}
    >
      {icon}
    </Button>
  );
};

const DirectoryButton = ({
  format,
  icon,
  editor,
}: {
  format: any;
  icon: any;
  editor: Editor;
}) => {
  // const editor = useSlate();
  const directoryRef = useRef(null);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);

  useClickAway(directoryRef, (e) => {
    setShowDirectory(false);
  });

  return (
    <span ref={directoryRef} className="relative hover:bg-neutrals-gray-8">
      <Button onClick={() => setShowDirectory(!showDirectory)}>{icon}</Button>
      {showDirectory ? (
        <div
          className="absolute top-[120%] left-[-50%] w-96 bg-white z-50 rounded-lg"
          style={{ boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.8)" }}
        >
          <DriveTable
            onRequestClose={() => setShowDirectory(false)}
            onInsert={(file) => {
              const linkElem: any = {
                type: "link",
                link: `#/${file.componentType}/${file.cid}`,
                fileName: file.name,
                children: [{ text: "" }],
              };
              Transforms.insertNodes(editor, linkElem);
              Transforms.move(editor);
              // const directoryLinksInPath = Array.from(
              //   Editor.nodes(editor, {
              //     match: (n) =>
              //       SlateElement.isElement(n) &&
              //       n.type === "link" &&
              //       n.link.startsWith("#/"),
              //   })
              // );
              // const pathOfNext = [...directoryLinksInPath[0][1]];
              // pathOfNext[pathOfNext.length - 1] += 1;
              // Transforms.insertNodes(
              //   editor,
              //   { text: "" },
              //   {
              //     at: pathOfNext,
              //   }
              // );
              setShowDirectory(false);
            }}
          />
        </div>
      ) : null}
    </span>
  );
};

const BlockButton = ({ format, icon }: { format: any; icon: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : ("type" as any)
      )}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};

const MarkButton = ({ format, icon }: { format: any; icon: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};

const sampleMarkdown = `# Testing KaTeX

This is the number $x = 13$ and this

$$
E = mc^2
$$

is an equation

[Reproduce Figure 2](#/code/bafybeibzxn2il4q7att4bf3lvrcc2peovcdokv3jsbzne5v6ad5tr6mi6i?n=13_Figure4_Treatment.ipynb&p=/)

[To Google!](https://google.com)`;
// console.log(sampleMarkdown)

export default AnnotationEditor;

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    // if (this.state.hasError) {
    //   // You can render any custom fallback UI
    //   return <h1>Something went wrong.</h1>;
    // }

    return this.props.children;
  }
}
