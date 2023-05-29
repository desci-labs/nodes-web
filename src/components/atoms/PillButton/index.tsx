import { FlexRowAligned } from "@components/styled";
import { cn } from "@src/lib/utils";
import React, { HTMLProps, MouseEvent, MouseEventHandler, useEffect } from "react"
import ReactTooltip from "react-tooltip";
import styled, { StyledComponent } from "styled-components";

const Wrapper: StyledComponent<'div', any, any> = styled(FlexRowAligned).attrs(({ className }: any) => {
  return {
    className: ` ${className} select-none group relative pill-button cursor-pointer`,
  };
})
`
  flex: unset;
  height: 1.75rem;
  width: 4rem;
`;

export const LeftComponent = (props: HTMLProps<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-center rounded-l-md bg-black dark:text-white font-serif group-hover:bg-gray-700 group-active:bg-gray-900 h-[100%]",
      props.className,
      props.disabled && "cursor-not-allowed"
    )}
  >
    {props.children}
  </div>
);

export const RightComponent = (props: HTMLProps<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-center rounded-l-md bg-black dark:text-white font-serif group-hover:bg-gray-700 group-active:bg-gray-900 h-[100%]",
      props.className,
      props.disabled && "cursor-not-allowed"
    )}
  >
    {props.children}
  </div>
);

interface PillButtonProps {
  leftIcon: React.FC;
  rightIcon: React.FC;
  onClick?: MouseEventHandler;
  className?: string;
  tooltip?: any;
  tooltipOptions?: any;
  disabled?: boolean;
  text?: string;
}

const PillButton = (props: PillButtonProps) => {
  const { leftIcon, rightIcon, onClick, className, tooltip, tooltipOptions } =
    props;
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  return (
    <>
      <Wrapper
        data-tip={tooltip}
        {...tooltipOptions}
        className={className}
        onClick={(e: MouseEvent) => {
          if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick(e);
          }
        }}
      >
        <LeftComponent disabled={props.disabled}>{leftIcon({})}</LeftComponent>
        <RightComponent disabled={props.disabled}>
          {rightIcon({})}
        </RightComponent>
      </Wrapper>
    </>
  );
};

export default PillButton