import React from "react";
import styled, { StyledComponent } from "styled-components";

// TODO/FIXME: Rename to something more specific than Section

const Wrapper: StyledComponent<"div", any, any> = styled.div.attrs(
  ({ selected, className }: any) => ({
    className: `bg-white dark:bg-dark-gray shadow-md relative ${
      selected
        ? "border-black dark:border-[white] border-[2px] top-[0px] mb-[-1px]"
        : "dark:hover:border-zinc-500 dark:border-muted-900 border-[1px] ml-[1px] mt-[1px]" // special stuff to make selection not move box at all even with thicker border
    } ${className}`,
  })
)`
  border-style: solid;
  border-radius: 10px;
  width: ${(props: any) => (props.selected ? "calc(100% - 0px)" : "calc(100% - 2px)")};
  overflow: hidden;
`;

export interface SectionProps {
  children?: React.ReactNode | React.ReactNodeArray;
  header?: React.FC;
  footer?: React.FC;
  className?: string;
  containerStyle?: any;
  onClick?: React.MouseEventHandler;
  selected?: boolean;
}

const Section = (props: SectionProps) => {
  const {
    children,
    header,
    footer,
    selected,
    className = "",
    containerStyle = {},
    onClick,
  } = props;
  return (
    <Wrapper
      className={className}
      selected={selected}
      style={{ ...containerStyle }}
      onClick={onClick}
    >
      {header ? (
        <div className="border-neutral-300 dark:border-teal border-b">
          {header({})}
        </div>
      ) : null}
      {children}
      {footer ? (
        <div className="border-tint-primary dark:border-teal border-t">
          {footer({})}
        </div>
      ) : null}
    </Wrapper>
  );
};

export default Section;
