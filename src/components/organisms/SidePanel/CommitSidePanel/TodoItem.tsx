import {
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { EMPTY_FUNC } from "@src/components/utils";
import styled from "styled-components";

interface TodoProps {
  title: string;
  subtitle: string;
  completed: boolean;
  onFixClick: () => void;
  editable?: boolean;
}
export const TodoItem = (props: TodoProps) => {
  const {
    title,
    subtitle,
    completed,
    editable,
    onFixClick = EMPTY_FUNC,
  } = props;
  return (
    <div className="flex items-center justify-between mt-2 py-2">
      <div className="flex flex-col">
        <TodoTitle>{title}</TodoTitle>
        <TodoSubtitle>{subtitle}</TodoSubtitle>
      </div>
      <TodoStatusText
        completed={completed}
        editable={props.editable}
        onClick={() => {
          if (!completed || editable) {
            onFixClick();
          }
        }}
      >
        {!completed ? "Fix" : editable ? "Edit" : "Complete"}
      </TodoStatusText>
    </div>
  );
};

const TYPE_MAP: { [Property in ResearchObjectComponentType]: string } = {
  pdf: "Document",
  code: "Code & Tests",
  video: "Video",
  terminal: "Script",
  data: "Data",
  link: "External Link",
  "data-bucket": "Data Bucket",
  unknown: "Unknown",
};

interface ComponentTodoItemProps {
  currentObjectId: string;
  manifestData: ResearchObjectV1;
  mode: string;
  completed: boolean;
  component: ResearchObjectV1Component;
  onHandleSelect: () => void;
}

export const ComponentTodoItem = (props: ComponentTodoItemProps) => {
  const { component, completed } = props;

  return (
    <TodoItem
      title="Update Component Metadata"
      subtitle={TYPE_MAP[component.type as ResearchObjectComponentType]}
      completed={completed}
      editable={true}
      onFixClick={() => {
        props.onHandleSelect();
      }}
    />
  );
};

export const HeaderTitle = styled.p.attrs({
  className: `text-base font-bold bg-neutrals-black -mx-4 px-4 py-1`,
})``;

export const TodoTitle = styled.p.attrs({
  className: `text-xs font-bold`,
})``;

export const TodoSubtitle = styled.p.attrs({
  className: `text-xs font-[500] text-neutrals-gray-5`,
})``;

export const TodoStatusText: any = styled.p.attrs((props: any) => ({
  className: `text-sm font-bold ${
    props.completed ? "text-states-success" : "text-tint-primary"
  }`,
}))`
  cursor: ${(props: any) =>
    props.editable ? "pointer" : props.completed ? "default" : "pointer"};
`;
