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
} from "@desci-labs/desci-models";

export interface UiComponentDefinition {
  icon: JSX.Element;
  title: string;
  componentType: ResearchObjectComponentType;
  componentSubType?: ResearchObjectComponentSubtypes | undefined;
  doNotRender?: boolean;
}

const IconWrapper = ({ Icon, className }: any) => (
  <div className="border-primary border-2 rounded-full p-1 h-[40px] w-[40px] flex justify-center items-center overflow-hidden">
    <Icon fill="white" width={24} height={24} className={className} />
  </div>
);

export const COMPONENT_LIBRARY: UiComponentDefinition[] = [
  {
    icon: <IconWrapper Icon={IconComponentDocument} className="p-[1px]" />,
    title: "Research Report",
    componentType: ResearchObjectComponentType.PDF,
    componentSubType: ResearchObjectComponentDocumentSubtype.RESEARCH_ARTICLE,
  },
  {
    icon: (
      <IconWrapper
        Icon={IconComponentPreregisteredReport}
        className="p-[1px] pl-1 pr-0"
      />
    ),
    title: "Pre-registered Report",
    componentType: ResearchObjectComponentType.PDF,
    componentSubType:
      ResearchObjectComponentDocumentSubtype.PREREGISTERED_REPORT,
  },
  {
    icon: <IconWrapper Icon={IconComponentPreregisteredAnalysisPlan} />,
    title: "Pre-registered Analysis Plan",
    componentType: ResearchObjectComponentType.PDF,
    componentSubType:
      ResearchObjectComponentDocumentSubtype.PREREGISTERED_ANALYSIS_PLAN,
  },
  {
    icon: (
      <IconWrapper
        Icon={IconComponentSupplementaryInformation}
        className="-mb-2 h-[28px]"
      />
    ),
    title: "Supplementary Information",
    componentType: ResearchObjectComponentType.PDF,
    componentSubType:
      ResearchObjectComponentDocumentSubtype.SUPPLEMENTARY_INFORMATION,
  },
  {
    icon: <IconWrapper Icon={IconComponentPresentation} className="p-0.5" />,
    title: "Presentation Deck",
    componentType: ResearchObjectComponentType.PDF,
    componentSubType: ResearchObjectComponentDocumentSubtype.PRESENTATION_DECK,
  },
  {
    icon: <IconWrapper Icon={IconComponentCode} />,
    title: "Code Repository",
    componentType: ResearchObjectComponentType.CODE,
  },
  {
    icon: <IconWrapper Icon={IconCodeDataEnv} className="p-[1px]" />,
    title: "Executable Container",
    componentType: ResearchObjectComponentType.CODE,
  },
  {
    icon: <IconWrapper Icon={IconComponentOpenData} className="p-[2px]" />,
    title: "Open Access Data",
    componentType: ResearchObjectComponentType.DATA,
  },
  {
    icon: <IconWrapper Icon={IconComponentUnknown} />,
    title: "Unknown",
    componentType: ResearchObjectComponentType.UNKNOWN,
    doNotRender: true,
  },
];
const EXTERNAL_COMPONENTS: UiComponentDefinition[] = [
  {
    icon: <IconWrapper Icon={IconComponentDiscussions} className="p-0.5" />,
    title: "Community Discussions",
    componentType: ResearchObjectComponentType.LINK,
    componentSubType: ResearchObjectComponentLinkSubtype.COMMUNITY_DISCUSSION,
  },
  {
    icon: <IconWrapper Icon={IconPlay} className="pl-2 -ml-1" />,
    title: "Video Resource",
    componentType: ResearchObjectComponentType.LINK,
    componentSubType: ResearchObjectComponentLinkSubtype.VIDEO_RESOURCE,
  },
  {
    icon: (
      <IconWrapper Icon={IconComponentExternalApi} className="stroke-0 p-0.5" />
    ),
    title: "External API",
    componentType: ResearchObjectComponentType.LINK,
    componentSubType: ResearchObjectComponentLinkSubtype.EXTERNAL_API,
  },
  {
    icon: <IconWrapper Icon={IconComponentRestrictedData} className="p-0.5" />,
    title: "Restricted Access Data",
    componentType: ResearchObjectComponentType.LINK,
    componentSubType: ResearchObjectComponentLinkSubtype.RESTRICTED_DATA,
  },
  {
    icon: <IconWrapper Icon={IconComponentMisc} />,
    title: "Other Link",
    componentType: ResearchObjectComponentType.LINK,
    componentSubType: ResearchObjectComponentLinkSubtype.OTHER,
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
  componentSubType,
}: UiComponentDefinition) => {
  const {
    setIsAddingSubcomponent,
    setIsAddingComponent,
    setAddComponentType,
    setAddComponentSubType,
  } = useManuscriptController();
  return (
    <button
      className=""
      onClick={() => {
        setIsAddingSubcomponent(true);
        setIsAddingComponent(false);
        setAddComponentType(componentType);
        setAddComponentSubType(componentSubType || null);
      }}
    >
      <div className="h-[120px] w-[120px] bg-neutrals-gray-2 text-xs flex rounded-xl shadow-lg border border-[#3C3C3C] cursor-pointer hover:bg-neutrals-gray-3 flex-col items-center gap-3 text-center pt-[18.5px]">
        {icon}
        <h3 className="text-[12px] px-4">{title}</h3>
      </div>
    </button>
  );
};

const ComponentLibrary = () => {
  return (
    <div className="flex flex-col max-w-2xl mx-auto pb-10">
      <Title
        text="Add Component"
        description="Choose the component you would like to add to your research node"
      />
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
            componentSubType={c.componentSubType}
          />
        ))}
      </div>
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
            componentSubType={c.componentSubType}
          />
        ))}
      </div>
    </div>
  );
};

export default ComponentLibrary;
