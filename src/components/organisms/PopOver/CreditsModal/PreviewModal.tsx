import Modal, { ModalProps } from "@components/molecules/Modal";
import { CreditModalProps } from "./schema";
import { IconGithub, IconGoogleScholar, IconOrcid } from "@src/icons";
import { isMobile } from "react-device-detect";
import clsx from "clsx";

const getOrcidUrl = (orcid: string) => `https://orcid.org/${orcid}`;

export default function PreviewModal(props: ModalProps & CreditModalProps) {
  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props?.onDismiss}
      $maxWidth={600}
      $scrollOverlay={isMobile ? false : true}
    >
      <div
        className={clsx(
          "px-6 py-5 pb-16 text-white relative  font-interr",
          isMobile ? "min-w-[350px]" : "min-w-[600px]"
        )}
      >
        <Modal.Header onDismiss={props?.onDismiss} />
        <div className="flex flex-col items-center justify-between mt-8 w-full">
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
          {props.author?.orcid ||
          props.author?.googleScholar ||
          props.author?.github ? (
            <>
              <div className="h-[1px] w-[200px] bg-neutrals-gray-3 my-4"></div>
              <h1 className="font-bold mb-2">View External Profiles</h1>
              <div className="flex justify-center gap-1">
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
              </div>{" "}
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
