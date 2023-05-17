import * as React from "react";
import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import {
  IconCodeDataEnv,
  IconComponentCode,
  IconComponentDiscussions,
  IconComponentDocument,
  IconComponentExternalApi,
  IconComponentMisc,
  IconComponentOpenData,
  IconComponentPreregisteredAnalysisPlan,
  IconComponentPreregisteredReport,
  IconComponentPresentation,
  IconComponentRestrictedData,
  IconComponentSupplementaryInformation,
  IconComponentUnknown,
  IconExternalComponents,
  IconIpfs,
  IconPlay,
} from "@icons";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
  ResearchObjectComponentDocumentSubtype,
  ResearchObjectComponentLinkSubtype,
  ResearchObjectV1Component,
  PdfComponent,
  ExternalLinkComponent,
} from "@desci-labs/desci-models";
import { useDrive } from "@src/state/drive/hooks";
import { renameFileInCurrentDrive } from "@src/state/drive/driveSlice";
import { DRIVE_FULL_EXTERNAL_LINKS_PATH } from "@src/state/drive/utils";

export interface UiComponentDefinition {
  icon: (
    props?: React.SVGProps<SVGSVGElement> & { wrapperClassName?: string }
  ) => JSX.Element;
  title: string;
  componentType: ResearchObjectComponentType;
  componentSubtype?: ResearchObjectComponentSubtypes | undefined;
  doNotRender?: boolean;
}

export type IconWrapperProps = {
  Icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  className?: string;
  wrapperClassName?: string;
};

export const IconWrapper = ({
  Icon,
  className,
  wrapperClassName,
  ...rest
}: IconWrapperProps) => (
  <div
    className={`border-primary border-2 rounded-full p-1 h-[40px] w-[40px] flex justify-center items-center overflow-hidden ${
      wrapperClassName ?? ""
    }`}
  >
    <Icon fill="white" width={24} height={24} className={className} {...rest} />
  </div>
);

export const COMPONENT_LIBRARY: UiComponentDefinition[] = [
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentDocument}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "Research Report",
    componentType: ResearchObjectComponentType.PDF,
    componentSubtype: ResearchObjectComponentDocumentSubtype.RESEARCH_ARTICLE,
  },
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentPreregisteredReport}
        className="p-[1px] pl-1 pr-0"
        {...props}
      />
    ),
    title: "Pre-registered Report",
    componentType: ResearchObjectComponentType.PDF,
    componentSubtype:
      ResearchObjectComponentDocumentSubtype.PREREGISTERED_REPORT,
  },
  {
    icon: (props) => (
      <IconWrapper Icon={IconComponentPreregisteredAnalysisPlan} {...props} />
    ),
    title: "Pre-registered Analysis Plan",
    componentType: ResearchObjectComponentType.PDF,
    componentSubtype:
      ResearchObjectComponentDocumentSubtype.PREREGISTERED_ANALYSIS_PLAN,
  },
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentSupplementaryInformation}
        className="-mb-2 h-[28px]"
        {...props}
      />
    ),
    title: "Supplementary Information",
    componentType: ResearchObjectComponentType.PDF,
    componentSubtype:
      ResearchObjectComponentDocumentSubtype.SUPPLEMENTARY_INFORMATION,
  },
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentPresentation}
        className="p-0.5"
        {...props}
      />
    ),
    title: "Presentation Deck",
    componentType: ResearchObjectComponentType.PDF,
    componentSubtype: ResearchObjectComponentDocumentSubtype.PRESENTATION_DECK,
  },
  {
    icon: (props) => <IconWrapper Icon={IconComponentCode} {...props} />,
    title: "Code Repository",
    componentType: ResearchObjectComponentType.CODE,
  },
  {
    icon: (props) => (
      <IconWrapper Icon={IconCodeDataEnv} className="p-[1px]" {...props} />
    ),
    title: "Executable Container",
    componentType: ResearchObjectComponentType.CODE,
  },
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentOpenData}
        className="p-[2px]"
        {...props}
      />
    ),
    title: "Open Access Data",
    componentType: ResearchObjectComponentType.DATA,
  },
  {
    icon: (props) => <IconWrapper Icon={IconComponentUnknown} {...props} />,
    title: "Unknown",
    componentType: ResearchObjectComponentType.UNKNOWN,
    doNotRender: true,
  },
];
export const EXTERNAL_COMPONENTS: UiComponentDefinition[] = [
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentDiscussions}
        className="p-0.5"
        {...props}
      />
    ),
    title: "Community Discussions",
    componentType: ResearchObjectComponentType.LINK,
    componentSubtype: ResearchObjectComponentLinkSubtype.COMMUNITY_DISCUSSION,
  },
  {
    icon: (props) => (
      <IconWrapper Icon={IconPlay} className="pl-2 -ml-1" {...props} />
    ),
    title: "Video Resource",
    componentType: ResearchObjectComponentType.LINK,
    componentSubtype: ResearchObjectComponentLinkSubtype.VIDEO_RESOURCE,
  },
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentExternalApi}
        className="stroke-0 p-0.5"
        {...props}
      />
    ),
    title: "External API",
    componentType: ResearchObjectComponentType.LINK,
    componentSubtype: ResearchObjectComponentLinkSubtype.EXTERNAL_API,
  },
  {
    icon: (props) => (
      <IconWrapper
        Icon={IconComponentRestrictedData}
        className="p-0.5"
        {...props}
      />
    ),
    title: "Restricted Access Data",
    componentType: ResearchObjectComponentType.LINK,
    componentSubtype: ResearchObjectComponentLinkSubtype.RESTRICTED_DATA,
  },
  {
    icon: (props) => <IconWrapper Icon={IconComponentMisc} {...props} />,
    title: "Other Link",
    componentType: ResearchObjectComponentType.LINK,
    componentSubtype: ResearchObjectComponentLinkSubtype.OTHER,
  },
];

export const Title: React.FC<{ text: string; description: string }> = ({
  text,
  description,
}) => {
  return (
    <div className="text-center mb-5">
      <h1 className="text-[28px] font-bold">{text}</h1>
      <h3 className="text-neutrals-gray-5 text-base">{description}</h3>
    </div>
  );
};

export const SectionHeading = ({ icon, title, subtitle }: any) => {
  return (
    <div className="flex flex-col my-6 gap-6">
      <div className="flex flex-row gap-4">
        {icon}
        <div className="flex-col">
          <h2 className="font-bold text-[21px]">{title}</h2>
          <h3 className="text-neutrals-gray-5 text-[14px] ml-0.5">
            {subtitle}
          </h3>
        </div>
      </div>
      <SpacerHorizontal />
    </div>
  );
};

const ComponentButton = ({
  title,
  icon,
  componentType,
  componentSubtype,
}: UiComponentDefinition) => {
  const {
    setIsAddingSubcomponent,
    setIsAddingComponent,
    setAddComponentType,
    setAddComponentSubtype,
  } = useManuscriptController();

  return (
    <button
      className=""
      onClick={() => {
        setIsAddingSubcomponent(true);
        setIsAddingComponent(false);
        setAddComponentType(componentType);
        setAddComponentSubtype(componentSubtype || null);
      }}
    >
      <div className="h-[120px] w-[120px] bg-neutrals-gray-2 text-xs flex rounded-xl shadow-lg border border-[#3C3C3C] cursor-pointer hover:bg-neutrals-gray-3 flex-col items-center gap-3 text-center pt-[18.5px]">
        {icon ? icon({}) : <></>}
        <h3 className="text-[12px] px-4">{title}</h3>
      </div>
    </button>
  );
};

const ComponentLibrary = () => {
  const { currentDrive } = useDrive();
  const { addFilesWithoutContext } = useManuscriptController();
  const hideComponents =
    currentDrive?.path === DRIVE_FULL_EXTERNAL_LINKS_PATH &&
    !addFilesWithoutContext;
  return (
    <div className="flex flex-col max-w-2xl mx-auto pb-10">
      <Title
        text="Add Component"
        description="Choose the component you would like to add to your research node"
      />
      {!hideComponents && (
        <>
          <SectionHeading
            icon={<IconIpfs width={40} height={46} />}
            title="Component Library"
            subtitle="The data and metadata from the following components are preserved on the prototype Open State Repository"
          />
          <div
            className="grid gap-8 mb-8 mt-2 justify-center content-start"
            style={{
              gridTemplateColumns: "repeat(auto-fill, 120px)",
            }}
          >
            {COMPONENT_LIBRARY.filter((c) => !c.doNotRender).map((c) => (
              <ComponentButton
                key={c.title}
                icon={c.icon}
                title={c.title}
                componentType={c.componentType}
                componentSubtype={c.componentSubtype}
              />
            ))}
          </div>
        </>
      )}
      <SectionHeading
        icon={<IconExternalComponents width={100} height={46} />}
        title="External Components"
        subtitle="Only the metadata from the following components are preserved on the prototype Open State repository. These components may be subject to link rot, as snapshots aren't taken."
      />
      <div
        className="grid gap-8 mb-8 mt-2 justify-center content-start"
        style={{
          gridTemplateColumns: "repeat(auto-fill, 120px)",
        }}
      >
        {EXTERNAL_COMPONENTS.map((c) => (
          <ComponentButton
            key={c.title}
            icon={c.icon}
            title={c.title}
            componentType={c.componentType}
            componentSubtype={c.componentSubtype}
          />
        ))}
      </div>
    </div>
  );
};

export const findTarget = (
  componentType: ResearchObjectComponentType,
  componentSubtype?: ResearchObjectComponentSubtypes
): UiComponentDefinition | undefined => {
  const foundEntry = COMPONENT_LIBRARY.concat(EXTERNAL_COMPONENTS).find(
    (target) => {
      const matchesType = target.componentType === componentType;
      switch (target.componentType) {
        case ResearchObjectComponentType.PDF:
          return matchesType && componentSubtype === target.componentSubtype;
        case ResearchObjectComponentType.LINK:
          return matchesType && componentSubtype === target.componentSubtype;
        default:
          return matchesType;
      }
    }
  );

  return (
    foundEntry ||
    COMPONENT_LIBRARY.find((c) => c.title.toLowerCase() === "unknown")
  );
};

export default ComponentLibrary;
