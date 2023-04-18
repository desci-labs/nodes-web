import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import ComponentStackView from "../ComponentStackView";

export default function ComponentStackModal(props: ModalProps) {
  return (
    <Modal {...props} onDismiss={props.onDismiss} $scrollOverlay={true}>
      <div className="w-full h-full min-h-[70vh] overflow-x-auto">
        <ComponentStackView />
      </div>
    </Modal>
  );
}
