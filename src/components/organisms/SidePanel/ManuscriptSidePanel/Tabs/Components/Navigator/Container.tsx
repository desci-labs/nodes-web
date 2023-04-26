import type { CSSProperties, FC, ReactNode } from "react";
import { useCallback } from "react";
import { Card } from "./Card";
import { ResearchObjectV1Component } from "@src/../../nodes/desci-models/dist";
import { Identifier } from "dnd-core";

// const style = {
//   width: 400,
// };
interface ContainerProps {
  components: ResearchObjectV1Component[];
  // renderComponent: (component: ResearchObjectV1Component, index: number) => ReactNode
  renderComponent: (props: {
    component: ResearchObjectV1Component;
    index: number;
    ref: any;
    handlerId: Identifier | null;
    style: CSSProperties;
  }) => ReactNode;
}
export const Container: FC<ContainerProps> = ({ components, renderComponent }: ContainerProps) => {
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log("move", dragIndex, hoverIndex)
    // TODO: logic to reorder nav components
    // setCards((prevCards: Item[]) =>
    //   update(prevCards, {
    //     $splice: [
    //       [dragIndex, 1],
    //       [hoverIndex, 0, prevCards[dragIndex] as Item],
    //     ],
    //   })
    // );
  }, []);

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
