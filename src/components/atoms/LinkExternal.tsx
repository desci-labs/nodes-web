import { IconViewLink } from "@icons";
import { PropsWithChildren } from "react";

interface LinkExternalProps {
  url: string;
  className?: string;
}
const LinkExternal = (props: PropsWithChildren<LinkExternalProps>) => {
  return (
    <a
      href={props.url}
      rel="noreferrer"
      target="_blank"
      onClick={(e) => {
        window.open(props.url);
        e.preventDefault();
      }}
      className={`flex gap-1 items-center text-xs group hover:text-tint-primary-hover text-tint-primary underline ${props.className}`}
    >
      {props.children}
      <IconViewLink
        stroke={"inherit"}
        width={12}
        strokeWidth={0.5}
        className="stroke-current"
      />
    </a>
  );
};

export default LinkExternal;
