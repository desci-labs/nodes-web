import { DialogOverlay, DialogContent } from "@reach/dialog";
import styled, { css } from "styled-components";
import { animated, useTransition } from "react-spring";
import PerfectScrollbar from "react-perfect-scrollbar";
import { PropsWithChildren } from "react";
import { IconX } from "@src/icons";

const AnimatedDialogOverlay = animated(DialogOverlay);
const StyledDialogOverlay = styled(AnimatedDialogOverlay)<{
  $scrollOverlay?: boolean;
}>`
  &[data-reach-dialog-overlay] {
    backdrop-filter: blur(3px);
    background-color: transparent;
    overflow: hidden;
    z-index: 1044;
    position: fixed;
    top: 0;
    left: 0;
   
    min-height: 100vh;
    min-width: 100vw;
    height: 100vh;
    width: 100vw;

    display: flex;
    align-items: center;
    overflow-y: ${({ $scrollOverlay }) => $scrollOverlay && "scroll"};
    justify-content: center;

    background-color: rgba(0,0,0,0.8);`;

type StyledDialogProps = {
  $minHeight?: number | false;
  $maxHeight?: number;
  $scrollOverlay?: boolean;
  $maxWidth?: number;
};

const AnimatedDialogContent = animated(DialogContent);
const StyledDialogContent = styled(AnimatedDialogContent)<StyledDialogProps>`
  overflow-y: auto;

  &[data-reach-dialog-content] {
    margin: auto;
    background-color: #191b1c;
    padding: 0px;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: ${({ $maxWidth }) =>
      $maxWidth ? `${$maxWidth}px` : "max-content"};
    ${({ $maxHeight }) =>
      $maxHeight &&
      css`
        max-height: ${$maxHeight}vh;
      `}
    ${({ $minHeight }) =>
      $minHeight &&
      css`
        min-height: ${$minHeight}vh;
      `}
    display: ${({ $scrollOverlay }) =>
      $scrollOverlay ? "inline-table" : "flex"};
    border-radius: 5px;
  }
`;

export interface ModalProps {
  isOpen?: boolean;
  onDismiss?: () => void;
  initialFocusRef?: React.RefObject<any>;
  children?: React.ReactNode;
  $scrollOverlay?: boolean;
  $minHeight?: number | false;
  $maxHeight?: number;
  $maxWidth?: number;
}

export default function Modal({
  children,
  $maxWidth,
  $maxHeight = 90,
  $minHeight,
  initialFocusRef,
  isOpen,
  onDismiss,
  $scrollOverlay,
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <>
      {fadeTransition(
        ({ opacity }, item) =>
          item && (
            <StyledDialogOverlay
              isOpen={isOpen}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              style={{
                opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }),
              }}
              $scrollOverlay={$scrollOverlay}
            >
              <StyledDialogContent
                aria-label="dialog"
                $maxWidth={$maxWidth}
                $maxHeight={$maxHeight}
                $minHeight={$minHeight}
                $scrollOverlay={$scrollOverlay}
              >
                <PerfectScrollbar className="max-h-[100vh] h-fit overflow-hidden overflow-y-scroll">
                  {children}
                </PerfectScrollbar>
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  );
}

const ModalHeader = ({
  hideCloseIcon = false,
  onDismiss,
  title,
  subTitle,
}: PropsWithChildren<{
  title?: string;
  subTitle?: string;
  hideCloseIcon?: boolean;
  onDismiss?: () => void;
}>) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div>
        {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
        {subTitle && <p className="text-neutrals-gray-5 text-sm">{subTitle}</p>}
      </div>
      {!hideCloseIcon && (
        <button
          className="cursor-pointer p-5 -m-5 absolute right-5 top-5 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
          onClick={onDismiss}
        >
          <IconX />
        </button>
      )}
    </div>
  );
};
const ModalFooter = ({
  border = true,
  padded = true,
  children,
}: PropsWithChildren<{ border?: boolean; padded?: boolean }>) => {
  return (
    <div
      className={`flex flex-row justify-end gap-4 items-center h-16 w-full dark:bg-[#272727] ${
        border ? "border-t border-t-[#81C3C8]" : ""
      } rounded-b-lg ${padded ? "p-4" : ""}`}
    >
      {children}
    </div>
  );
};

Modal.Footer = ModalFooter;
Modal.Header = ModalHeader;