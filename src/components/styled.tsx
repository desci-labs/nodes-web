import styled from "styled-components";

export const Flex = styled.div`
  display: flex;
  flex: 1;
`

export const FlexRow = styled(Flex)`
  flex-direction: row;
`

export const FlexRowAligned = styled(FlexRow)`
  align-items: center;
`

export const FlexRowJustified = styled(FlexRow)`
  justify-content: center;
`

export const FlexRowCentered = styled(FlexRow)`
  align-items: center;
  justify-content: center;
`

export const FlexRowSpaceBetween = styled(FlexRowAligned)`
  justify-content: space-between;
`

export const FlexColumn = styled(Flex)`
  flex-direction: column;
`

export const FlexColumnAligned = styled(FlexColumn)`
  align-items: center;
`

export const FlexColumnJustified = styled(FlexColumn)`
  justify-content: center;
`

export const FlexColumnCentered = styled(FlexColumn)`
  align-items: center;
  justify-content: center;
`