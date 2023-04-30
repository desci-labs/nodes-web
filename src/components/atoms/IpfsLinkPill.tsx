import React, {
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import styled from "styled-components";
import { FlexRowAligned, FlexRowCentered } from "@components/styled";
import { IconCircleX } from "icons";

// TODO/FIXME: This component is named very similar to other components but it seems to duplicate functionality of PillButton.tsx, should merge or rename

const Wrapper = styled(FlexRowAligned).attrs({
  className: "select-none group relative",
})`
  flex: unset;
  height: 1.75rem;
  width: 4rem;
`;
const LeftComponent = styled(FlexRowCentered).attrs({
  className:
    "group-hover:bg-teal-200 h-full rounded-l-md group-active:bg-teal-100 bg-black",
})``;
const CopyLink = styled(FlexRowCentered).attrs({
  className:
    "group-hover:bg-gray-700 h-full bg-black text-white rounded-r-md group-active:bg-gray-500",
})``;

interface GenericLinkPillProps {
  leftIcon?: React.FC;
  rightIcon?: React.FC;
  onClick?: MouseEventHandler;
}

const GenericLinkPill = (props: GenericLinkPillProps) => {
  {
    /** PNG TODO: change <img /> to <svg /> */
  }
  const {
    leftIcon = () => <IconCircleX />,
    rightIcon = () => <IconCircleX />,
    onClick = () => {},
  } = props;
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 0);
    }
  }, [isCopied]);
  return (
    <Wrapper
      onClick={(e: MouseEvent) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();

          onClick(e);
        }
      }}
    >
      <LeftComponent>{leftIcon({})}</LeftComponent>
      <CopyLink>{rightIcon({})}</CopyLink>
    </Wrapper>
  );
};

export default GenericLinkPill;
