import React from "react";
import { FlexRowSpaceBetween } from "@components/styled";
import styled from "styled-components";

const Wrapper = styled(FlexRowSpaceBetween).attrs(({ className }: any) => ({
  className: className,
}))`
  padding: 0.75rem 1rem;
`;
const Title = styled.p.attrs({
  className: "select-none",
})`
  font-size: 1.1rem;
  font-weight: bold;
`;

export interface SectionHeaderProps {
  title: string | React.FC;
  action: React.FC;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  containerStyle?: any;
  className?: string;
}

const SectionHeader = (props: SectionHeaderProps) => {
  const { title, action, onClick, containerStyle = {}, className } = props;
  return (
    <Wrapper
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? "pointer" : "default", ...containerStyle }}
    >
      {typeof title === "string" ? <Title>{title}</Title> : title({})}
      {action({})}
    </Wrapper>
  );
};

export default SectionHeader;
