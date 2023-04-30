import { FC, PropsWithChildren, ReactElement } from "react";
import CollapsibleSection from "@components/organisms/CollapsibleSection";

interface AccordionProps {
  header: ReactElement;
  trigger?: FC<{ expanded?: boolean }>;
  expand?: boolean;
}

export function AccordionContent(props: PropsWithChildren<{}>) {
  return (
    <div className="flex items-center justify-start gap-4 py-2 w-full">
      {props.children}
    </div>
  );
}

export function Accordion(props: PropsWithChildren<AccordionProps>) {
  return (
    <CollapsibleSection
      title={props.header}
      startExpanded={props.expand}
      className="bg-transparent dark:bg-transparent border-none my-4 mx-0"
      headerClass="px-0"
    >
      {props.children}
    </CollapsibleSection>
  );
}
