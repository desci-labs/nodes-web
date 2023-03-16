import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";
import React from "react";
import styled, { StyledComponent } from "styled-components";

// FIXME/TODO: Merge with ComponentCard.tsx? seems to be duplicating it a lot

const CardWrapper: StyledComponent<
  "div",
  any,
  { isSelected?: boolean },
  never
> = styled.div.attrs(({ isSelected }: any) => ({
  className: `shadow-md ${
    isSelected ? "border-black dark:border-white" : "border-muted-200 dark:border-muted-500"
  } dark:bg-muted-700`,
}))
`
  width: 100%;
  border: ${(props: { isSelected?: boolean }) =>
    props.isSelected ? "solid 2px black" : "solid 1px #cccccc"};
  margin: ${(props: { isSelected?: boolean }) =>
    props.isSelected
      ? "0"
      : "1px"}; /** prevent layout shift when border size changes **/
  border-radius: 0.5rem;
  overflow: hidden;
`;
const HeaderWrapper = styled(FlexRowSpaceBetween).attrs({
  className: "bg-zinc-200 dark:bg-muted-900 border-muted-300 dark:border-teal",
})`
  align-items: flex-start;
  padding: 0.75rem;
  border-bottom: solid 1px #cccccc;
  background-color: #efefef;
`;

export interface SectionCardProps {
  isSelected?: boolean;
  headerLeft?: React.FC;
  headerRight?: React.FC;
  controllerLeft?: React.FC;
  controllerRight?: React.FC;
  icon?: React.CElement<any, any>;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ComponentWrapper = styled(FlexRowSpaceBetween)`
  padding: 0.5rem 0.75rem;
`;

const SectionCard = (props: SectionCardProps) => {
  const {
    headerLeft = () => <span />,
    headerRight = () => <span />,
    controllerLeft = () => <span />,
    controllerRight = () => <span />,
    isSelected = false,
    onClick,
  } = props;
  return (
    <CardWrapper isSelected={isSelected} onClick={onClick}>
      <FlexColumn>
        <HeaderWrapper>
          {headerLeft({})}
          {headerRight({})}
        </HeaderWrapper>
        <FlexRowSpaceBetween>
          <ComponentWrapper>
            {controllerLeft({})}
            {controllerRight({})}
          </ComponentWrapper>
        </FlexRowSpaceBetween>
      </FlexColumn>
    </CardWrapper>
  );
};

export default SectionCard;
