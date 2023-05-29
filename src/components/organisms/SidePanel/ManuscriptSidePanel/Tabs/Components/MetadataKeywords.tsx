import { useMemo } from "react";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { IconInfo } from "icons";
import styled from "styled-components";
import uniq from "lodash.uniq";
import { useNodeReader } from "@src/state/nodes/hooks";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

interface MetadataKeywordsProps {}

const MetadataKeywords = (props: MetadataKeywordsProps) => {
  const { manifest: manifestData, mode } = useNodeReader();

  const isEditing = mode === "editor";

  const componentKeywords = useMemo(() => {
    return manifestData?.components.reduce(
      (keywords: any[], component: any) => {
        return uniq([...keywords, ...(component.payload.keywords || [])]);
      },
      []
    );
  }, [manifestData]);

  return (
    <CollapsibleSection
      startExpanded={true}
      title={
        <div className="flex w-full justify-between">
          Keywords
          {!isEditing ? (
            <TooltipIcon
              icon={<IconInfo className="fill-black dark:fill-[white]" />}
              id="ro-source-tags"
              tooltip="Tags and Keywords"
            />
          ) : null}
        </div>
      }
      className="mb-4"
    >
      <ContentWrapper className="py-2">
        {componentKeywords?.length === 0 && (
          <span className="text-xs block text-center w-full">No Keywords</span>
        )}
        {componentKeywords?.map((tag: any, index: number) => (
          <div
            key={index}
            className="rounded-lg px-3 py-2 text-sm bg-zinc-300 dark:bg-muted-900"
          >
            {tag}
          </div>
        ))}
      </ContentWrapper>
    </CollapsibleSection>
  );
};

export default MetadataKeywords;
