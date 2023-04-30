import Modal, { ModalProps } from "@src/components/molecules/Modal";
import ComponentStackView from "@src/components/organisms/ManuscriptReader/ComponentStackView";
import { IconX } from "@src/icons";

export default function ComponentStackModal(props: ModalProps) {
  return (
    <Modal
      {...props}
      onDismiss={props.onDismiss}
      $scrollOverlay={true}
      $minHeight={100}
      $maxHeight={100}
      $padOverlay={false}
    >
      <div className="w-full h-screen overflow-hidden">
        <div className="mb-2 p-2 w-full flex justify-end">
          <button
            className="cursor-pointer p-3 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
            onClick={props.onDismiss}
          >
            <IconX />
          </button>
        </div>
        <div className="max-h-[70vh]">
          <ComponentStackView />
        </div>
      </div>
    </Modal>
  );
}
