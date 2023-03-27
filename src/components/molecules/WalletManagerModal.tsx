import PrimaryButton from "@components/atoms/PrimaryButton";
import WalletManager from "@components/organisms/WalletManager";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useEffect } from "react";
import Modal from "@src/components/molecules/Modal/Modal";

const WalletManagerModal = (props: any) => {
  const { showWalletManager, setShowWalletManager } = useManuscriptController([
    "showWalletManager",
  ]);
  const onClose = () => {
    setShowWalletManager(false);
  };

  useEffect(() => {
    const torus = (window as any).torus;
    if (torus) {
      try {
        if (
          showWalletManager &&
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
  }, [showWalletManager]);

  return (
    <Modal onDismiss={onClose} isOpen={showWalletManager}>
      <div className="px-6 py-5 min-w-full lg:min-w-[700px]">
        <div className="flex flex-row justify-between items-center">
          <div className="text-lg font-bold text-white">
            Digital Signature Management
          </div>
        </div>
        <div className="py-2 text-white dark:text-white">
          <div className="py-1 text-sm">
            {showWalletManager ? (
              <WalletManager />
            ) : (
              <div className="invisible w-[450px] h-[200px]">
                {" "}
                {/* <WalletManager /> */}
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton
          className={`w-[140px] flex justify-center`}
          onClick={onClose}
        >
          Done
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
};

export default WalletManagerModal;
