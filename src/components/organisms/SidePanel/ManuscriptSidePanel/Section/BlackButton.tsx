import { EMPTY_FUNC } from "@components/utils";
import React from "react";
import styled from "styled-components";

const Button = styled.button.attrs({
  className: "select-none",
})`
  background-color: black;
  color: white;
  padding: 0.1rem 0.75rem;
  border-radius: 0.5rem;
`;

interface BlackButtonProps {
  title: string;
  onClick?: () => void;
}

const BlackButton = (props: BlackButtonProps) => {
  const { title, onClick } = props;
  return <Button onClick={onClick}>{title}</Button>;
};

export default BlackButton;
