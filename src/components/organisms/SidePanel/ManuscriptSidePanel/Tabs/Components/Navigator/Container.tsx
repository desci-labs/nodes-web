import type { FC } from "react";
import { useCallback } from "react";
import { ResearchObjectV1Component } from "@src/../../nodes/desci-models/dist";
import DraggableComponentCard from "@src/components/molecules/DraggableComponentCard";
interface ContainerProps {
  components: ResearchObjectV1Component[];
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}
export const Container: FC<ContainerProps> = ({
  components,
  moveCard,
}: ContainerProps) => {
  const renderCard = useCallback(
    (card: ResearchObjectV1Component, index: number) => {
      return (
        <DraggableComponentCard
          key={card.id}
          index={index}
          id={card.id}
          component={card}
          moveCard={moveCard}
        />
      );
    },
    [moveCard]
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {components.map((card, i) => renderCard(card, i))}
      </div>
    </>
  );
};
