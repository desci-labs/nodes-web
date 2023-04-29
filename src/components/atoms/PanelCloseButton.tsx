import { FlexRowCentered } from "@components/styled";
import { IconRemove } from "@icons";
import { MouseEventHandler } from "react";
import styled, { StyledComponent } from "styled-components";

export const Wrapper: StyledComponent<
  "div",
  any,
  { visible: boolean },
  any
> = styled(FlexRowCentered).attrs({
  className:
    "group-hover:bg-zinc-600 group-hover:border-zinc-800 group-hover:stroke-white dark:group-hover:bg-zinc-600 bg-white dark:bg-muted-500 stroke-[#212121] dark:stroke-white border:white dark:border-muted-900",
})`
  position: absolute;
  ${(props: any) =>
    props.panelOrientation === "left" ? "right" : "left"}: 33.333333%;
  top: ${(props: { visible: boolean }) => (props.visible ? 20 : 35)}px;
  width: ${(props: { visible: boolean }) => (props.visible ? 30 : 0)}px;
  height: ${(props: { visible: boolean }) => (props.visible ? 30 : 0)}px;
  border-radius: 50%;
  border-width: 1px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  cursor: ${(props: { visible: boolean }) =>
    props.visible ? "pointer" : "default"};
  transition: background-color 0.3s ease, height 0.4s ease, width 0.4s ease,
    top 0.4s ease,
    ${(props: any) => (props.panelOrientation === "left" ? "right" : "left")}
      0.4s ease;
  user-select: none; /* prevents lag bug that occurs when clicking and dragging from the close button */
  transition: filter 0.3s ease;
`;

interface PanelCloseButtonProps {
  panelOrientation: 'left' | 'right';
  visible: boolean;
  onClick: MouseEventHandler;
  className?: string;
}

const defaultProps = {
  panelOrientation: 'right'
}

const PanelCloseButton = (props: PanelCloseButtonProps & typeof defaultProps) => {
  const { panelOrientation, visible, onClick, className } = props;
  return (
    <div
      className={`p-7 z-50 absolute group ${
        panelOrientation === "left" ? "-right-8" : "-left-8"
      } ${
        visible ? "cursor-pointer" : "hidden"
      } focus:bg-transparent rounded-full ${className}`}
      onClick={onClick}
    >
      <Wrapper visible={visible} panelOrientation={panelOrientation}>
        <IconRemove />
      </Wrapper>
    </div>
  );
};

PanelCloseButton.defaultProps = defaultProps

export default PanelCloseButton;
