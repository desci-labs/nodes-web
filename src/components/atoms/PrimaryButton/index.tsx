import React from "react";
import styled from "styled-components";

const PrimaryButton: any = styled.div.attrs({
  className: "rounded-md text-black px-4 py-1 text-center",
})`
  background-color: ${(props: any) => (!props.disabled ? "#6fd6dd" : "#CCCCCC")};
  &:hover {
    background-color: ${(props: any) => (!props.disabled ? "#5ca8ad" : "#CCCCCC")};
  }
  color: ${(props: any) => (!props.disabled ? "black" : "grey")};
  cursor: ${(props: any) => (!props.disabled ? "pointer" : "default")};
`;

export default PrimaryButton;
