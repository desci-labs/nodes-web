import { cn } from "@src/lib/utils";
import { HTMLProps } from "react";

function SectionHeader(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-row space-between items-center border-neutral-300 dark:border-dark-gray border-b",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export default SectionHeader;
