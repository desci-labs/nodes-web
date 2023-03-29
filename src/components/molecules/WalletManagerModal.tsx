import WalletManager from "@components/organisms/WalletManager";
import { useEffect } from "react";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";

const WalletManagerModal = (props: ModalProps) => {
  useEffect(() => {
    const torus = (window as any).torus;
    if (torus) {
      try {
        if (
          props.isOpen &&
          torus.provider &&
          !!torus.provider.selectedAddress
        ) {
          torus.showTorusButton();
        } else {
          torus.hideTorusButton();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [props.isOpen]);

  const close = () => {
    props?.onDismiss?.();
  };

  return (
    <Modal onDismiss={close} isOpen={props.isOpen}>
      <div className="px-6 py-5 min-w-full lg:min-w-[700px]">
        <Modal.Header
          onDismiss={close}
          hideCloseIcon
          title="Digital Signature Management"
        />
        <div className="py-2 text-white dark:text-white">
          <div className="py-1 text-sm">
            <WalletManager />
          </div>
        </div>
      </div>
      <Modal.Footer collapse padded={false} />
    </Modal>
  );
};

export default WalletManagerModal;
