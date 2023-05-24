import Modal, { ModalProps } from "@components/molecules/Modal";
import { CreditModalProps } from "./schema";
import { FlexColumnCentered, FlexRowCentered } from "@src/components/styled";
import { IconGithub, IconGoogleScholar, IconOrcid } from "@src/icons";

const getOrcidUrl = (orcid: string) => `https://orcid.org/${orcid}`;

export default function PreviewModal(props: ModalProps & CreditModalProps) {
  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props?.onDismiss}
      $maxWidth={600}
      $scrollOverlay={true}
    >
      <div className="px-6 py-5 text-white relative min-w-[600px] font-interr">
        <Modal.Header onDismiss={props?.onDismiss} />
        <FlexColumnCentered className="mt-8 w-full">
          <span className="font-bold capitalize text-lg">
            {props.author?.name}
          </span>
          <span className="text-neutrals-gray-6 capitalize">
            {props.author?.role}
          </span>
          {props.author?.organizations?.map((org) => (
            <span className="text-neutrals-gray-6 text-xs capitalize">
              {org.name}
            </span>
          ))}
          <div className="h-[1px] w-[200px] bg-neutrals-gray-3 my-4"></div>
          <h1 className="font-bold mb-2">View External Profiles</h1>
          <FlexRowCentered className="gap-1">
            {props.author?.orcid ? (
              <a
                href={getOrcidUrl(props.author?.orcid)}
                rel="noreferrer"
                target="_blank"
                className="flex gap-1 items-center text-xs group hover:text-tint-primary-hover text-tint-primary underline"
              >
                <IconOrcid width={25} />
              </a>
            ) : null}
            {props.author?.googleScholar ? (
              <a
                href={props.author?.googleScholar}
                rel="noreferrer"
                target="_blank"
                className="flex gap-1 items-center text-xs group hover:text-tint-primary-hover text-tint-primary underline"
              >
                <IconGoogleScholar width={23} />
              </a>
            ) : null}
            {props.author?.github ? (
              <a
                href={props.author?.github}
                rel="noreferrer"
                target="_blank"
                className="flex gap-1 items-center text-xs group hover:text-tint-primary-hover text-tint-primary underline"
              >
                <IconGithub width={23} fill="white" />
              </a>
            ) : null}
          </FlexRowCentered>
        </FlexColumnCentered>
      </div>
    </Modal>
  );
}
