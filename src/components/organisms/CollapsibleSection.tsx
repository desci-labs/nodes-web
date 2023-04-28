import React, { PropsWithChildren, useState } from "react";
import { IconMiniChevronDown } from "icons";
import SlideDown from "react-slidedown";
import { CSSProperties } from "styled-components";
import SectionTitle from "@components/atoms/SectionTitle";
import Section from "@components/atoms/Section";
import SectionHeader from "@components/atoms/SectionHeader";
import tw from "tailwind-styled-components";

const ContentWrapper = tw(SlideDown)`
  duration-[250ms]
  ease-in-out
`;

interface CollapsibleSectionProps {
  title: string | React.ReactElement;
  expandable?: boolean;
  startExpanded?: boolean;
  forceExpand?: boolean;
  className?: string;
  headerClass?: string;
  containerStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  hideWrapper?: boolean;
  collapseIconComponent?: React.FC<{ expanded?: boolean }>;
}

const CollapsibleSection = (
  props: PropsWithChildren<CollapsibleSectionProps>
) => {
  const {
    title,
    children,
    className,
    headerClass,
    containerStyle,
    headerStyle,
    hideWrapper,
    expandable = true,
    startExpanded,
    forceExpand,
    collapseIconComponent = ({ expanded }: { expanded?: boolean }) => (
      <IconMiniChevronDown
        className={`
        fill-black
        dark:fill-[white]
        transition-transform ease duration-300
        ${expanded && "-scale-y-100"}
      `}
      />
    ),
  } = props;
  const [expanded, setExpanded] = useState<boolean>(startExpanded || false);
  return (
    <Section className={className} style={{ ...containerStyle }}>
      <SectionHeader
        onClick={() => {
          if (expandable && !forceExpand) {
            setExpanded(!expanded);
          }
        }}
        style={{
          cursor: expandable ? "pointer" : "default",
          padding: "0.75rem 1rem",
          ...headerStyle,
        }}
        className={headerClass}
      >
        <SectionTitle>
          <div className="flex-row flex-nowrap flex w-full gap-1 items-center">
            <div className="flex" style={{ width: "100%" }}>
              <span className="text-[14px] font-bold select-none w-full">
                {title}
              </span>
            </div>
            {expandable ? (
              <div className="flex">
                {forceExpand || expanded || !forceExpand
                  ? collapseIconComponent({ expanded })
                  : null}
              </div>
            ) : null}
          </div>
        </SectionTitle>
      </SectionHeader>

      {!hideWrapper || forceExpand ? (
        <ContentWrapper>
          {expanded || forceExpand ? (
            <div className="flex flex-col gap-3 py-1 px-4">{children}</div>
          ) : null}
        </ContentWrapper>
      ) : (
        <></>
      )}
    </Section>
  );
};

export default CollapsibleSection;
