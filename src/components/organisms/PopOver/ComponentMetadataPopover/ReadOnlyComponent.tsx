import ButtonCopyLink from "@components/atoms/ButtonCopyLink";
import TooltipIcon from "@components/atoms/TooltipIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { IconInfo } from "@icons";
import styled from "styled-components";
import { useNodeReader } from "@src/state/nodes/hooks";

const Title = (props: any) => {
  const {
    title,
    titleClassName = "text-sm font-medium",
    tooltipText,
    tooltipId,
  } = props;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-end dark:text-white">
        <p className={titleClassName}>{title}</p>
      </div>
      <TooltipIcon
        icon={<IconInfo className="fill-black dark:fill-[white] w-4" />}
        id={tooltipId}
        tooltip={tooltipText}
        placement={"left"}
        tooltipProps={{ "data-background-color": "black" }}
      />
    </div>
  );
};

const StyledEntryContainer = styled.div`
  box-shadow: inset 0px -1px 0px #555659;
`;

const EntryContainer = (props: any) => {
  return (
    <StyledEntryContainer
      className={`bg-neutrals-gray-1 text-sm rounded-t py-1 px-3 text-white ${props.className}`}
    >
      {props.children}
    </StyledEntryContainer>
  );
};

const ReadOnlyComponent = (props: any) => {
  const { currentObjectId } = useNodeReader();
  return (
    <div className="flex mt-6 gap-3">
      <div className="flex items-center gap-3">
        <CollapsibleSection
          title={
            <Title
              title="Standardized Access Protocol"
              tooltipText="dPID Resolution Scheme"
              tooltipId="sap-metadata-ro"
            />
          }
          expandable={false}
          className={"flex-[4]"}
          headerStyle={{ padding: "0.25rem 0.75rem" }}
        />
        <CollapsibleSection
          title={
            <Title
              title="IPFS CAS"
              tooltipText="Using IPFS"
              tooltipId="ipfs-metadata-ro"
            />
          }
          expandable={false}
          className={"flex-[2]"}
          headerStyle={{ padding: "0.25rem 0.75rem" }}
        />
      </div>
      <div className="flex items-center gap-4">
        <CollapsibleSection
          title={
            <div className="flex items-center justify-between">
              <Title
                title="Component Metadata PID"
                tooltipText="Permanent Identifier"
                tooltipId="pid-metadata-ro"
              />
              <ButtonCopyLink text={`${currentObjectId}`} />
            </div>
          }
          expandable={false}
          className={"flex-[2]"}
          headerStyle={{ padding: "0.25rem 0.75rem" }}
        />
        <CollapsibleSection
          title={
            <div className="flex items-center justify-between">
              <Title
                title="License"
                tooltipText="Author-supplied license"
                tooltipId="lic-metadata-ro"
              />
              <div className="bg-black rounded-lg py-1 px-2">
                <p className="text-sm font-normal text-white">
                  {props.file?.metadata?.licenseType}
                </p>
              </div>
            </div>
          }
          expandable={false}
          className={"flex-[1]"}
          headerStyle={{ padding: "0.25rem 0.75rem" }}
        />
      </div>
      <CollapsibleSection
        startExpanded={true}
        title={
          <Title
            title="Component Metadata"
            titleClassName="text-sm font-bold"
            tooltipText="Author-supplied metadata"
            tooltipId="component-metadata-ro"
          />
        }
      >
        <div className="flex flex-col gap-2">
          <EntryContainer>
            <p className="text-xs font-bold">Keywords</p>
            <div className="my-1">
              <div className="flex items-center gap-2 w-full flex-wrap">
                {props.file?.metadata?.keywords?.map((keyword: string) => {
                  return (
                    <div className="py-[2px] px-2 bg-tint-primary rounded-md text-black">
                      <p className="text-sm">{keyword}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </EntryContainer>
          <EntryContainer>
            <p className="text-xs font-bold">Description</p>
            {props.file?.metadata?.description}
          </EntryContainer>
          <EntryContainer>
            <p className="text-xs font-bold">License Type</p>
            {props.file?.metadata?.licenseType}
          </EntryContainer>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ReadOnlyComponent;
