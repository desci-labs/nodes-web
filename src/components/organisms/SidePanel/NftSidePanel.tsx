import { useState } from "react";
import styled from "styled-components";

import SidePanel from "@components/organisms/SidePanel";

const NUM_ATTRIBUTES_PER_ROW = 5

const NftSidePanelContainer = styled(SidePanel)`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.onSurface};
  padding: 2rem 2.5rem;

  & > *:not(:last-child) {
    margin-bottom: 1rem;
  }
`
const NftName = styled.p`
  font-size: 1.25rem;
  font-weight: 800;
`
const NftOrigin = styled.p`
  font-size: 1.1rem;
  font-weight: 200;
  font-style: italic;
`
const Section = styled.div`
  margin: 0.75rem 0;
  font-size: 1.1rem;

  & > *:nth-child(1) {
    /* Title */
    color: #757575;
    margin-bottom: 0.2rem;
  }
`
const AttributesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
`
const AttributeBox = styled.div`
  background-color: #686868;
  cursor: pointer;
`
const CollectionButton = styled.button.attrs({ children: 'View Entire Collection' })`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.onPrimary};
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 200;
  border-radius: 0.15rem;
  margin-top: 2rem;
`

const NftSidePanel = () => {
  const ATTRIBUTES = Array.from({ length: 10 })
  const [attributesContainerWidth, setAttributesContainerWidth] = useState<number>(0)

  const totalGapPerRow = attributesContainerWidth * (3/8)
  const totalAttributeWidthPerRow = attributesContainerWidth * (5/8)
  const attributeSize = totalAttributeWidthPerRow / NUM_ATTRIBUTES_PER_ROW
  const gapSize = totalGapPerRow / NUM_ATTRIBUTES_PER_ROW - 1

  return (
    <NftSidePanelContainer isOpen style={{ gap: gapSize }} width={380}>
      <div className="flex flex-col items-center">
        <div className="flex flex-col">
          <NftName>ColabFold - Making protein folding accessible to all</NftName>
          <NftOrigin>Genesis Collection #01</NftOrigin>
          <Section>
            <h2>Attributes</h2>
            <AttributesContainer ref={ref => ref?.clientWidth && setAttributesContainerWidth(ref.clientWidth)}>
              {
                ATTRIBUTES.map((attribute: any, i: number) => (
                  <AttributeBox style={{ height: attributeSize, width: attributeSize }} />
                ))
              }
            </AttributesContainer>
          </Section>
          <Section>
            <h2>Curator's Description</h2>
            <p>ColabFold is an open source toolbox to predict protein folding based on alpha fold 2.</p>
          </Section>
          <Section>
            <h2>Scientific Curators</h2>
            <p>Genesis ARC</p>
          </Section>
          <Section>
            <h2>Scientific Authors</h2>
            <p>Milot Mirdita, Konstantin Schütze, Yoshitaka Moriwaki, Lim Heo, Sergey Ovchinnikov, and Martin Steinegger</p>
          </Section>
        </div>
        <CollectionButton />
      </div>
    </NftSidePanelContainer>
  );
};

export default NftSidePanel;
