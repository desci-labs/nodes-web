import styled, { StyledComponent } from "styled-components";

import { APPROXIMATED_HEADER_HEIGHT } from "@components/utils";
export interface SidePanelComponentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: string;
  isOpen?: boolean;
  width: number;
  annotationVisible?: boolean;
}

// Important for iPad
const isMobile =
  "ontouchstart" in document.documentElement &&
  navigator.userAgent.match(/Mobi/);

const SidePanel: StyledComponent<
  "div",
  any,
  SidePanelComponentProps,
  never
> = styled.div`
  position: fixed;
  height: calc(100vh - ${APPROXIMATED_HEADER_HEIGHT}px);
  /** Important for iPad compat **/
  ${isMobile ? "min-height: -webkit-fill-available;" : ""}
  top: ${APPROXIMATED_HEADER_HEIGHT}px;
  left: ${(props: SidePanelComponentProps) =>
    props.orientation === "left" ? 0 : undefined};
  right: ${(props: SidePanelComponentProps) =>
    props.orientation === "right" ? 0 : undefined};
  width: ${(props) => `${props.width}px`};
  transition: margin 0.15s ease;
  margin: ${(props: SidePanelComponentProps) => {
    const margin: number | string = props.isOpen ? 0 : `${-props.width}px`;
    return props.orientation === "left" ? `0 0 0 ${margin}` : `0 ${margin} 0 0`;
  }};
  overflow: visible;
  z-index: 10;
`;

const SidePanelComponent = (props: SidePanelComponentProps) => {
  return <SidePanel {...props} />;
};

export default SidePanelComponent;
