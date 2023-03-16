import React, {
  Ref,
  PropsWithChildren,
  LegacyRef,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import ReactDOM from "react-dom";
import { cx, css } from "@emotion/css";
import { isAbsoluteUrl } from "@components/utils";
import CodePillButton from "@components/atoms/CodePillButton";
import { useFocused, useSelected, useSlate } from "slate-react";
import { Editor, Element as SlateElement, Path, Transforms } from "slate";
import { CustomElement } from "./custom-types";
import { useClickAway } from "react-use";
import ReactModal from "react-modal";
import { FormatHyperlink, IconPen } from "@icons";
import ReactTooltip from "react-tooltip";
import { DriveObject } from "@components/organisms/Drive";

interface BaseProps {
  className: string;
  [key: string]: unknown;
}
type OrNull<T> = T | null;

export const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean;
        reversed: boolean;
      } & BaseProps
    >,
    ref: Ref<HTMLSpanElement>
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        active ? "bg-neutrals-gray-8" : "",
        "hover:bg-neutrals-gray-8",
        className,
        css`
          cursor: pointer;
          color: ${reversed ? "white" : "black"};
        `
      )}
    />
  )
);

export const EditorValue = React.forwardRef(
  (
    {
      className,
      value,
      ...props
    }: PropsWithChildren<
      {
        value: any;
      } & BaseProps
    >,
    ref: LegacyRef<HTMLDivElement>
  ) => {
    const textLines = value.document.nodes
      .map((node: any) => node.text)
      .toArray()
      .join("\n");
    return (
      <div
        ref={ref}
        {...props}
        className={cx(
          className,
          css`
            margin: 30px -20px 0;
          `
        )}
      >
        <div
          className={css`
            font-size: 14px;
            padding: 5px 20px;
            color: #404040;
            border-top: 2px solid #eeeeee;
            background: #f8f8f8;
          `}
        >
          Slate's value as text
        </div>
        <div
          className={css`
            color: #404040;
            font: 12px monospace;
            white-space: pre-wrap;
            padding: 10px 20px;
            div {
              margin: 0 0 0.5em;
            }
          `}
        >
          {textLines}
        </div>
      </div>
    );
  }
);

export const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLSpanElement>
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        "material-icons",
        className,
        css`
          font-size: 18px;
          vertical-align: text-bottom;
        `
      )}
    />
  )
);

export const Instruction = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          white-space: pre-wrap;
          margin: 0 -20px 10px;
          padding: 10px 20px;
          font-size: 14px;
          background: #f8f8e8;
        `
      )}
    />
  )
);

export const Menu = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          & > * {
            display: inline-block;
          }

          & > * + * {
            margin-left: 15px;
          }
        `
      )}
    />
  )
);

export const Portal = ({ children }: any) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

export const Toolbar = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLDivElement>
  ) => (
    <Menu
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          width: 100%;
          position: relative;
          padding: 1px 18px;
          margin: 0 -12px;
          border-bottom: 2px solid #eee;
          margin-bottom: 20px;
        `
      )}
    />
  )
);

export const LinkComponent = (props: any) => {
  const { href, children, attributes } = props;

  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const linkRef = useRef<any>();

  useClickAway(linkRef, (e) => {
    setIsSelected(false);
  });

  const editor = useSlate();

  const renderLink = useCallback(() => {
    // if a fully qualified url, open in a new tab
    if (isAbsoluteUrl(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer">
          <span {...attributes}>{children}</span>
        </a>
      );
      // if a code link, render the code pill button
    } else if (href && href.startsWith("#/")) {
      return <CodePillButton {...{ children }} href={href} />;
      // else route in the same tab
      // TODO: maybe we don't want them routing people on the desci site, maybe remove this?
    } else {
      return (
        <a href={href}>
          <span {...attributes}>{children}</span>
        </a>
      );
    }
  }, [href, children, attributes]);

  return (
    <>
      <span
        ref={linkRef}
        className="relative"
        onClick={(e) => {
          setIsSelected(true);
        }}
      >
        {isSelected ? (
          <span
            contentEditable={false}
            className="absolute bottom-[100%] w-[250px] left-0 border bg-white p-1 rounded-sm flex flex-row items-center"
          >
            <span className="m-1">Url:</span>
            <input
              value={href}
              onChange={(e) => {
                const [linkInPath] = Array.from(
                  Editor.nodes(editor, {
                    match: (n) =>
                      SlateElement.isElement(n) && n.type === "link",
                  })
                );

                if (linkInPath) {
                  Transforms.setNodes(
                    editor,
                    { link: e.target.value },
                    {
                      // match: n => SlateElement.isElement(n) && n.type === 'link',
                      match: (n, path) => {
                        return !!Path.equals(path, linkInPath[1]);
                      },
                      mode: "lowest",
                    }
                  );
                }
              }}
            />
            {/* <p className='text-xs max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis'>{href}</p> */}
            <button onClick={() => setShowModal(true)}>Directory</button>
          </span>
        ) : null}
        {renderLink()}
      </span>
      <ReactModal
        isOpen={showModal}
        shouldCloseOnEsc={true}
        onRequestClose={() => {
          setShowModal(false);
        }}
        style={{
          content: {},
          overlay: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        //  contentLabel="Minimal Modal Example"
      >
        {/* <button onClick={this.handleCloseModal}>Close Modal</button> */}
      </ReactModal>
    </>
  );
};

interface DirectoryLinkComponentProps {
  nodeRef: any;
  href: string;
  fileName?: string;
  children: any;
  readOnly: boolean;
  attributes: any;
  element: CustomElement;
}

export const DirectoryLinkComponent = (props: DirectoryLinkComponentProps) => {
  const { href, fileName, children, readOnly, attributes } = props;
  const [showCopiedText, setShowCopiedText] = useState<boolean>(false);

  const selected = useSelected();
  const focused = useFocused();

  const linkRef = useRef<any>();

  useClickAway(linkRef, (e) => {
    ReactTooltip.hide();
  });

  useEffect(() => {
    if (showCopiedText) {
      const timeoutId = setTimeout(() => {
        setShowCopiedText(false);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [showCopiedText]);

  return (
    <>
      <ReactTooltip
        id="directoryLinkEditToolTip"
        effect="solid"
        globalEventOff="click"
        backgroundColor="#000000"
        clickable={true}
        afterHide={() => {
          setShowCopiedText(false);
        }}
        className="bg-black text-white rounded font-inter font-bold cursor-default p-0"
        overridePosition={({ left, top }) => {
          top += 3;
          return { top, left };
        }}
        disable={readOnly}
      >
        <span contentEditable={false} style={{ userSelect: "none" }}>
          <div className="relative text-xs whitespace-nowrap">
            {showCopiedText ? (
              <div className="px-4 py-2">Link copied successfully!</div>
            ) : (
              <div className="flex flex-row justify-center items-center p-2 gap-3 h-8">
                <div
                  className="flex flex-row items-center m-1 gap-1 cursor-pointer"
                  onClick={() => {
                    setShowCopiedText(true);
                    navigator.clipboard.writeText(href);
                  }}
                >
                  <FormatHyperlink
                    fill="white"
                    width={12}
                    height={12}
                    strokeWidth={2}
                  />
                  <div>Copy Link</div>
                </div>
                {/* <div className='font-thin'>|</div>
                  <div
                    className='flex flex-row items-center m-1 gap-1 cursor-pointer'
                  >
                    <IconPen
                      fill="white"
                      width={12}
                      height={12}
                      strokeWidth={2}
                    />
                    <div>
                      Edit Syntax
                    </div>
                  </div> */}
              </div>
            )}
          </div>
        </span>
      </ReactTooltip>
      <span
        {...attributes}
        contentEditable={false}
        ref={linkRef}
        className="relative"
        // style={{ userSelect: "none" }}
      >
        {/* only overlay the tooltip trigger when in editor (a.k.a !readOnly) */}
        {!readOnly ? (
          <span
            className="absolute h-full w-full top-0 left-0"
            data-tip
            data-for="directoryLinkEditToolTip"
            data-event="click focus"
          />
        ) : null}
        {children}
        <CodePillButton href={href}>{fileName}</CodePillButton>
      </span>
    </>
  );
};
