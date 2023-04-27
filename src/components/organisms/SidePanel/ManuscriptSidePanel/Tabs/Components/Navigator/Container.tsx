import type { CSSProperties, FC, ReactNode } from "react";
import { useCallback } from "react";
import { Card } from "./Card";
import { ResearchObjectV1Component } from "@src/../../nodes/desci-models/dist";
import { Identifier } from "dnd-core";
// import { useNodeReader } from "@src/state/nodes/hooks";

// const style = {
//   width: 400,
// };
interface ContainerProps {
  components: ResearchObjectV1Component[];
  renderComponent: (props: {
    component: ResearchObjectV1Component;
    index: number;
    ref: any;
    handlerId: Identifier | null;
    style: CSSProperties;
  }) => ReactNode;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}
export const Container: FC<ContainerProps> = ({
  components,
  moveCard,
  renderComponent,
}: ContainerProps) => {
  const renderCard = useCallback(
    (card: ResearchObjectV1Component, index: number) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          component={card}
          renderComponent={renderComponent}
          moveCard={moveCard}
        />
      );
    },
    [moveCard, renderComponent]
  );

  return (
    <>
      <div>{components.map((card, i) => renderCard(card, i))}</div>
    </>
  );
};
