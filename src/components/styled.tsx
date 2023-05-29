import { cn } from "@src/lib/utils";
import { HTMLProps } from "react";
import styled from "styled-components";

export const Flex = styled.div`
  display: flex;
  flex: 1;
`;

export const FlexRow = styled(Flex)`
  flex-direction: row;
`;

export const FlexRowAligned = styled(FlexRow)`
  align-items: center;
`;

export const FlexRowJustified = styled(FlexRow)`
  justify-content: center;
`;

export const FlexRowCentered = (props: HTMLProps<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-center", props.className)}>
    {props.children}
  </div>
);

export const FlexRowSpaceBetween = (props: HTMLProps<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-between", props.className)}>
    {props.children}
  </div>
);

export const FlexColumn = styled(Flex)`
  flex-direction: column;
`;

export const FlexColumnAligned = styled(FlexColumn)`
  align-items: center;
`;

export const FlexColumnJustified = styled(FlexColumn)`
  justify-content: center;
`;

export const FlexColumnCentered = styled(FlexColumn)`
  align-items: center;
  justify-content: center;
`;
