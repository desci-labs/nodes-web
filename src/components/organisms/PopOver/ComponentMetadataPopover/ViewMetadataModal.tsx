import { FlexColumn } from "@components/styled";
import styled from "styled-components";
import Modal, { ModalProps } from "@src/components/molecules/Modal";
import { DriveObject } from "@components/organisms/Drive";
import DividerSimple from "@src/components/atoms/DividerSimple";

const CardContainer = styled.div`
  background: #272727;
  border-radius: 4px 4px 0px 0px;
  padding: 5px 8px;
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

const ViewMetadataModal = (
  props: ModalProps & { file: DriveObject | null }
) => {
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
            <Title title="Component type" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
          <CardContainer>
            <Title title="Research Report Title" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
          <DividerSimple />
          <CardContainer>
            <Title title="Description" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
          <DividerSimple />
          <Heading title="Keywords & Controlled Vocabulary Terms" />
          <CardContainer>
            <Title title="Keywords" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
          <CardContainer>
            <Title title="Ontology PURL" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
          <CardContainer>
            <Title title="Controlled Vocabulary Terms" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
          <DividerSimple />
          <Heading title="Licensing" />
          <CardContainer>
            <Title title="Controlled Vocabulary Terms" />
            <p className="text-lg text-neutrals-gray-3 dark:text-white">
              {props.file?.componentType || "Unknown"}
            </p>
          </CardContainer>
        </FlexColumn>
      </div>
    </Modal>
  );
};

export default ViewMetadataModal;
