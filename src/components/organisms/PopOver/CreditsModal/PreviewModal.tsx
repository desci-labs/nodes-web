import Modal, { ModalProps } from "@components/molecules/Modal";
import { CreditModalProps } from "./schema";
import { FlexColumnCentered } from "@src/components/styled";
import DividerSimple from "@src/components/atoms/DividerSimple";

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
        <FlexColumnCentered className="mt-8">
          <span className="font-bold capitalize">{props.author?.name}</span>
          <span className="text-neutrals-gray-5 capitalize">
            {props.author?.role}
          </span>
          {props.author?.organizations?.map((org) => (
            <span className="text-neutrals-gray-5 capitalize">{org.name}</span>
          ))}
          <DividerSimple />
          <h1 className="font-bold mt-8">View External Profiles</h1>
        </FlexColumnCentered>
      </div>
    </Modal>
  );
}
