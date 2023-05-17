import { FlexColumn, FlexRow, FlexRowAligned } from "@components/styled";
import styled from "styled-components";
import Modal, { ModalProps } from "@src/components/molecules/Modal";
import { DriveObject } from "@components/organisms/Drive";
import DividerSimple from "@src/components/atoms/DividerSimple";
import { NODES_COMPONENT_SUBTYPES } from "@src/nodesTypes";
import {
  ResearchObjectComponentDocumentSubtype,
  ResearchObjectComponentLinkSubtype,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import { useNodeReader } from "@src/state/nodes/hooks";
import { PropsWithChildren } from "react";
import { CODE_LICENSE_TYPES, PDF_LICENSE_TYPES } from "@src/helper/license";

const CardContainer = styled.div`
  background: #272727;
  border-radius: 4px 4px 0px 0px;
  padding: 5px 10px;
  flex: none;
  order: 0;
  flex-grow: 0;
  width: 100%;
`;

const Title = (props: { title: string }) => (
  <p className="font-inter font-bold text-xs text-neutrals-gray-3 dark:text-white">
    {props.title}
  </p>
);
const Heading = (props: { title: string }) => (
  <p className="font-inter font-bold text-xl text-neutrals-gray-3 dark:text-white">
    {props.title}
  </p>
);
const ContentWrapper = (props: PropsWithChildren<{}>) => (
  <div className="text-md text-neutrals-gray-3 dark:text-white">
    {props.children}
  </div>
);

function Pill(props: { keyword: string }) {
  return (
    <div className="py-[2px] px-2 bg-gray-300 dark:bg-black rounded-md text-neutrals-gray-4 dark:text-white">
      <p className="text-sm">{props.keyword}</p>
    </div>
  );
}

const getComponentTypeName = (componentType: ResearchObjectComponentType) => {
  switch (componentType) {
    case ResearchObjectComponentType.DATA:
      return "Dataset";
    case ResearchObjectComponentType.CODE:
      return "Code";
    default:
      return "";
  }
};

const ALL_LICENSES = PDF_LICENSE_TYPES.concat(CODE_LICENSE_TYPES);

const ViewMetadataModal = (
  props: ModalProps & { file: DriveObject | null }
) => {
  const { manifest } = useNodeReader();
  const metadata = props.file?.metadata;
  const type = props.file?.componentType as ResearchObjectComponentType;
  const fileSubtype = props.file?.componentSubtype as
    | ResearchObjectComponentDocumentSubtype
    | ResearchObjectComponentLinkSubtype;
  const types = NODES_COMPONENT_SUBTYPES[type];
  const subtype = types && types.find((subtype) => fileSubtype === subtype.id);

  const componentTypeName = subtype?.name || getComponentTypeName(type);

  const licenseType = metadata?.licenseType || manifest?.defaultLicense || "";
  console.log(licenseType, metadata);
  console.log(props.file);

  const licenseDescription = ALL_LICENSES.find(
    (license: any) =>
      license.name === licenseType ||
      license.spdx == licenseType ||
      license.shortName === licenseType
  )?.description;

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      $scrollOverlay={true}
      $maxWidth={720}
    >
      <div className="p-6 font-inter lg:min-w-[720px] w-full">
        <Modal.Header title="Metadata" onDismiss={props.onDismiss} />
        <FlexColumn className="mt-6 gap-6 w-full">
          <CardContainer>
            <Title title="Component Type" />
            <ContentWrapper>{componentTypeName || "Unknown"}</ContentWrapper>
          </CardContainer>
          {metadata?.title && (
            <>
              <CardContainer>
                <Title title={`${componentTypeName} Title`} />
                <ContentWrapper>
                  <p>{metadata?.title || ""}</p>
                </ContentWrapper>
              </CardContainer>
              <DividerSimple />
            </>
          )}

          {metadata?.description && (
            <>
              <CardContainer>
                <Title title="Description" />
                <ContentWrapper>{metadata?.description || ""}</ContentWrapper>
              </CardContainer>
            </>
          )}
          {(metadata?.keywords?.length || 0) > 0 ||
            metadata?.ontologyPurl ||
            ((metadata?.controlledVocabTerms?.length || 0) > 0 && (
              <>
                <DividerSimple />
                <Heading title="Keywords & Controlled Vocabulary Terms" />
                {(metadata?.keywords?.length || 0) > 0 && (
                  <CardContainer>
                    <Title title="Keywords" />
                    <ContentWrapper>
                      <FlexRowAligned className="gap-2 w-full flex-wrap my-2">
                        {metadata?.keywords?.map((keyword: string, idx) => {
                          return <Pill key={idx} keyword={keyword}></Pill>;
                        })}
                      </FlexRowAligned>
                    </ContentWrapper>
                  </CardContainer>
                )}
                {metadata?.ontologyPurl && (
                  <CardContainer>
                    <Title title="Ontology PURL" />
                    <ContentWrapper>
                      <a
                        href={metadata?.ontologyPurl}
                        rel="noreferrer"
                        target="_blank"
                        className="flex gap-1 mt-1 items-center group hover:text-tint-primary-hover text-tint-primary underline truncate line-clamp-1"
                      >
                        {metadata?.ontologyPurl}
                      </a>
                    </ContentWrapper>
                  </CardContainer>
                )}
                {(metadata?.controlledVocabTerms?.length || 0) > 0 && (
                  <CardContainer>
                    <Title title="Controlled Vocabulary Terms" />
                    <ContentWrapper>
                      <FlexRowAligned className="gap-2 w-full flex-wrap my-2">
                        {metadata?.controlledVocabTerms?.map(
                          (keyword: string, idx) => {
                            return <Pill key={idx} keyword={keyword}></Pill>;
                          }
                        )}
                      </FlexRowAligned>
                    </ContentWrapper>
                  </CardContainer>
                )}
              </>
            ))}
          <DividerSimple />
          <Heading title="Licensing" />
          <CardContainer>
            <ContentWrapper>
              <FlexRow className="my-1 items-start gap-2">
                <div className="mt-[8px] bg-states-success min-w-[8px] min-h-[8px] w-[8px] h-[8px] m-0 p-0 rounded-full border-none"></div>
                <FlexColumn className="items-start gap-1">
                  <p className="text-sm uppercase">
                    {licenseType || "Unknown License"}
                  </p>
                  <p className="text-xs">{licenseDescription}</p>
                </FlexColumn>
              </FlexRow>
            </ContentWrapper>
          </CardContainer>
        </FlexColumn>
      </div>
    </Modal>
  );
};

export default ViewMetadataModal;
