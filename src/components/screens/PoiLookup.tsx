import React from 'react';
import styled from 'styled-components';
import { FlexColumnCentered } from '@components/styled';

const PageContainer = styled(FlexColumnCentered)`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.onSurface};
  padding: 5rem;
`
const PoiInput = styled.input.attrs({ 
  placeholder: 'Enter POI...',
  autoFocus: true
})`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.onSurface};
  padding: 1rem 2rem;
  border-radius: 0.5rem;
`

const PoiLookup = () => {
  return (
    <PageContainer>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <label>POI Lookup Number</label>
        <PoiInput />
      </span>
    </PageContainer>
  )
}

export default PoiLookup