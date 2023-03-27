import { DialogOverlay, DialogContent } from "@reach/dialog";
import styled, { css } from "styled-components";
import { animated, useTransition } from "react-spring";
import PerfectScrollbar from "react-perfect-scrollbar";

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
  $maxWidth: number;
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
    max-width: ${({ $maxWidth }) => $maxWidth}px;
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
  $maxWidth = 420,
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
