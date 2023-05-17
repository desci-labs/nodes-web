import {
  ResearchObjectComponentDocumentSubtype,
  ResearchObjectComponentLinkSubtype,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";

export interface ClassNameProp {
  className?: string;
}

type TypeMaps = {
  [key in ResearchObjectComponentType]?: Array<{
    name: string;
    id: ResearchObjectComponentDocumentSubtype | ResearchObjectComponentLinkSubtype;
  }>;
};

export const NODES_COMPONENT_SUBTYPES: TypeMaps = {
  [ResearchObjectComponentType.PDF]: [
    {
      id: ResearchObjectComponentDocumentSubtype.RESEARCH_ARTICLE,
      name: "Research Report",
    },
    {
      id: ResearchObjectComponentDocumentSubtype.PREREGISTERED_REPORT,
      name: "Pre-registered Report",
    },
    {
      id: ResearchObjectComponentDocumentSubtype.PREREGISTERED_ANALYSIS_PLAN,
      name: "Pre-registered Analysis Plan",
    },
    {
      id: ResearchObjectComponentDocumentSubtype.SUPPLEMENTARY_INFORMATION,
      name: "Supplementary Information",
    },
    {
      id: ResearchObjectComponentDocumentSubtype.PRESENTATION_DECK,
      name: "Presentation Deck",
    },
  ],

  [ResearchObjectComponentType.CODE]: [],
  [ResearchObjectComponentType.DATA]: [],
  [ResearchObjectComponentType.LINK]: [
    {
      id: ResearchObjectComponentLinkSubtype.COMMUNITY_DISCUSSION,
      name: "Community Discussion",
    },
    {
      id: ResearchObjectComponentLinkSubtype.VIDEO_RESOURCE,
      name: "Video Resource",
    },
    {
      id: ResearchObjectComponentLinkSubtype.PRESENTATION_DECK,
      name: "Presentation Deck",
    },
    {
      id: ResearchObjectComponentLinkSubtype.EXTERNAL_API,
      name: "External API",
    },
    {
      id: ResearchObjectComponentLinkSubtype.RESTRICTED_DATA,
      name: "Restricted Data",
    },
    {
      id: ResearchObjectComponentLinkSubtype.OTHER,
      name: "Other",
    },
  ],
};
