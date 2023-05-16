import { HTMLProps } from "react";
import styled from "styled-components";

export const CheckBox = styled.input.attrs((props) => ({
  type: "checkbox",
  className: `focus:ring-tint-primary h-4 w-4 text-tint-primary border-2 border-tint-primary bg-transparent rounded`,
  name: props.name,
  id: props.name,
}))``;

export const CheckBoxText = styled<any>("label").attrs((props: HTMLProps<HTMLLabelElement>) => ({
  htmlFor: props.htmlFor,
  className: `cursor-pointer select-none text-xs ${props.className ?? ''}`,
}))`
  margin-left: 0.5rem;
`;
