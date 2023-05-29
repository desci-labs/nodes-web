import { useCallback, useState } from "react";
import styled from "styled-components";
import {SlideDown} from 'react-slidedown'
import 'react-slidedown/lib/slidedown.css'


const DropDownContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.onSurface};
`;
const DropDownHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
`;
const DropDownContent = styled(SlideDown)`
  transition-duration: 0.25s;
  transition-timing-function: ease-in-out;

  & > * {
    padding: 1rem;
  }
  & > *:not(:last-child) {
    padding-bottom: 0;
  }
`

const DropDown = (props: any) => {
  const { title, items = [] } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleClick = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  return (
    <DropDownContainer>
      <DropDownHeader onClick={handleClick}>
        <p>{title}</p>
        {
          isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )
        }
      </DropDownHeader>
      <DropDownContent>
        {
          isOpen ? items.map((item: any, i: number) => {
            return (
              <p key={i}>{item.name}</p>
            )
          }) : null
        }
      </DropDownContent>
    </DropDownContainer>
  )
}

export default DropDown