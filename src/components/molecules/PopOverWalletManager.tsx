import PrimaryButton from "@components/atoms/PrimaryButton";
import PopOver from "@components/organisms/PopOver";
import WalletManager from "@components/organisms/WalletManager";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useEffect } from "react";

const PopOverWalletManager = (props: any) => {
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

  // if (!showWalletManager) return null;

  return (
    <PopOver
      {...props}
      zIndex={121}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      onClose={onClose}
      isVisible={showWalletManager}
      displayCloseIcon={false}
      style={{ marginLeft: 0, marginRight: 0, width: 720 }}
      className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900"
      footer={() => (
        <div
          className={`flex flex-row justify-end items-center h-16 w-full p-4`}
        >
          <PrimaryButton
            className={`w-[140px] flex justify-center`}
            onClick={onClose}
          >
            Done
          </PrimaryButton>
        </div>
      )}
    >
      <div className="px-6 py-5">
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
    </PopOver>
  );
};

export default PopOverWalletManager;
