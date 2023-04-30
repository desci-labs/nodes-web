import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div.attrs({
  className: 'text-sm'
})`
  color: white;
  border-radius: 0.5rem;

`
interface ControlProps {
  children: React.ReactNode;
}

const Control = (props: ControlProps) => {
  const { children } = props
  return (
    <span className='flex flex-row justify-between items-center'>
      <Wrapper>
        { children }
      </Wrapper>     
    </span>
  )
}
export default Control