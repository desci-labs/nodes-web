import Modal, { ModalProps } from "@src/components/molecules/Modal";
import ComponentStackView from "@src/components/organisms/ManuscriptReader/ComponentStackView";
import { IconX } from "@src/icons";
import PerfectScrollbar from "react-perfect-scrollbar";

export default function ComponentStackModal(props: ModalProps) {
  return (
    <Modal
      {...props}
      onDismiss={props.onDismiss}
      $scrollOverlay={false}
      $minHeight={100}
      $maxHeight={100}
      $padOverlay={false}
    >
      <div className="w-full h-screen">
        <div className="mb-2 p-2 w-full flex justify-end">
          <button
            className="cursor-pointer p-3 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
            onClick={props.onDismiss}
          >
            <IconX />
          </button>
        </div>
        <div className="max-h-[90vh] overflow-hidden">
          <PerfectScrollbar className="overflow-auto text-white pb-0 w-full max-h-[90vh] overflow-x-hidden">
            <ComponentStackView />
          </PerfectScrollbar>
        </div>
      </div>
    </Modal>
  );
}
