import { FC, useEffect, useRef } from "react";
import styled, { CSSProperties } from "styled-components";

import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { FlexColumnAligned } from "@components/styled";
import {
  APPROXIMATED_HEADER_HEIGHT,
  lockScroll,
  restoreScroll,
} from "@components/utils";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useNodeReader } from "@src/state/nodes/hooks";

const ANIM_TIME = "0.2s";

const PopOverContainer: any = styled(FlexColumnAligned)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  cursor: default;
  &::after {
    content: " ";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
    ${(props: any) => (props.containerStyle ? props.containerStyle : "")};
    transition: opacity ${ANIM_TIME} ease-in-out;
    opacity: ${(props: any) => (props.isVisible ? 1 : 0)};
  }
  /* ${(props: any) => (props.containerStyle ? props.containerStyle : "")}
  ${(props: any) =>
    props.isVisible ? `background-color: transparent;` : ""} */
  height: calc(100vh - ${APPROXIMATED_HEADER_HEIGHT}px + 4px);
  & > div {
    transition: all ${ANIM_TIME} ease-in-out;
    transform: ${(props: any) =>
      props.isVisible ? "translateY(0)" : "translateY(100vh)"};
  }
  transition: all 0s linear;
  transform: ${(props: any) =>
    props.isVisible ? "translateX(0)" : "translateX(100vw)"};
  transition-delay: ${(props: any) => (props.isVisible ? 0 : ANIM_TIME)};
  width: 100%;
  z-index: ${(props: any) => (props.isVisible ? props.zIndex || 100 : -1)};
`;
// const PopOverContentScroller = styled(FlexColumnAligned)`
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   overflow-x: hidden;
//   overflow-y: scroll;
//   align-items: center;
//   flex-direction: column;
// `;
const PopOverContent = styled.div`
  position: relative;
  margin: 1rem;
`;
// const CloseIconContainer = styled.span`
//   position: absolute;
//   top: -10px;
//   right: -10px;
//   background-color: #222;
//   border-radius: 30px;
//   height: 30px;
//   width: 30px;
//   display: flex;
//   color: gray;
//   &:hover {
//     color: #ccc;
//     background-color: #272727;
//   }
//   align-items: center;
//   cursor: pointer;
// `;

export interface PopOverProps {
  isVisible: boolean;
  footer?: FC;
  onClose?: () => void;
  containerStyle?: CSSProperties;
  containerClassName?: string;
  style?: CSSProperties;
  className?: string;
  id?: String;
  zIndex?: number;
  displayCloseIcon?: boolean;
  onClick?: (e: any) => void;
}

const PopOver = (props: React.PropsWithChildren<PopOverProps>) => {
  const {
    id,
    zIndex,
    isVisible = false,
    onClose,
    containerStyle = {},
    containerClassName = "",
    style = {},
    className = "",
    onClick,
    // footer,
    // displayCloseIcon = true,
  } = props;

  const popoverRef = useRef(null);
  // const scrollRef = useRef<any>(null);

  const { isResearchPanelOpen, isCommitPanelOpen } = useNodeReader();

  useEffect(() => {
    if (!isVisible) {
      restoreScroll();
    } else {
      lockScroll();
    }
    return () => {
      restoreScroll();
    };
  }, [isVisible]);

  return (
    <PopOverContainer
      id={id}
      isVisible={isVisible}
      zIndex={zIndex}
      containerStyle={containerStyle}
      className={containerClassName}
      onClick={(e: any) => {
        e.stopPropagation();
        onClose?.();
        onClick?.(e);
      }}
    >
      <PopOverContent
        ref={popoverRef}
        style={{
          minWidth: 300,
          maxWidth: `calc(100vw)`,
          margin: "3rem 0.75rem",
          // overflow: "scroll",
          marginLeft:
            (isCommitPanelOpen ? 350 : 0) -
            (isCommitPanelOpen && isResearchPanelOpen ? +0 : 0),
          ...style,
        }}
        className={className}
        onClick={(e: any) => {
          e.stopPropagation();
        }}
      >
        <div className="relative">
          {/* {displayCloseIcon && (
              <CloseIconContainer onClick={onClose}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mx-auto"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  // stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </CloseIconContainer>
            )} */}
        </div>
        <PerfectScrollbar className="max-h-[calc(100vh)] h-fit overflow-y-scroll">
          {props.children}
        </PerfectScrollbar>
        {props.footer ? (
          <div
            className={`w-full dark:bg-[#272727] border-t border-tint-primary rounded-b-lg`}
          >
            <props.footer />
          </div>
        ) : null}
      </PopOverContent>
    </PopOverContainer>
  );
};

export default PopOver;
