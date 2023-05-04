import { FlexRow } from "@src/components/styled";
import { HTMLProps } from "react";
import styled from "styled-components";

export const SwitchButton: any = styled.div.attrs(
  (props: HTMLProps<HTMLButtonElement> & { isSelected: boolean }) => ({
    className: `select-none border-[1px] border-muted-300 dark:border-muted-800 font-inter ${
      props.isSelected
        ? "bg-black text-white font-bold"
        : "bg-white dark:bg-medium-gray dark:hover:bg-dark-gray text-black dark:text-white"
    }
  ${props.disabled ? "dark:bg-neutrals-gray-2 dark:hover:bg-neutrals-gray-2" : ""}`,
  })
)`
  flex: 1;
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 200ms linear, color 200ms linear;
  padding: 4px 0;
  border-left: 0;
  border-top: 0;
  border-bottom: 0;
`;
export const SwitchBar = styled(FlexRow).attrs({
  className: "border-[1px] border-muted-300 dark:border-muted-900",
})`
  border-radius: 8px;
  overflow: hidden;

  & > ${SwitchButton}:last-child {
    border-right: none;
  }
`;
