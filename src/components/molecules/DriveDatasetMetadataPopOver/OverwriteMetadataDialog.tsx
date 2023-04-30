import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { IconWarning } from "@src/icons";
import React from "react";
import Modal from "@src/components/molecules/Modal";

interface OverwriteMetadataDialogProps {
  setShowOverwriteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOverWrite: React.Dispatch<React.SetStateAction<boolean>>;
  overWrite: boolean;
  loading: boolean;
  formRef: React.MutableRefObject<HTMLFormElement | null>;
}

const OverwriteMetadataDialog: React.FC<OverwriteMetadataDialogProps> = ({
  setShowOverwriteDialog,
  setOverWrite,
  loading,
  formRef,
  overWrite,
}) => {
  return (
    <Modal
      onDismiss={() => {
        setShowOverwriteDialog(false);
      }}
      isOpen
    >
      <OverwriteMetadataForm
        loading={loading}
        overWrite={overWrite}
        setOverWrite={setOverWrite}
        setShowOverwriteDialog={setShowOverwriteDialog}
        formRef={formRef}
      />
    </Modal>
  );
};
export const OverwriteMetadataForm: React.FC<OverwriteMetadataDialogProps> = ({
  setShowOverwriteDialog,
  setOverWrite,
  loading,
  formRef,
  overWrite,
}) => {
  return (
    <div className="max-w-[400px] animate-fadeIn">
      <div className="py-3 px-6">
        <Modal.Header
          onDismiss={() => {
            setShowOverwriteDialog(false);
          }}
        />
        <div className="flex items-center gap-2 p-2">
          <div>
            <IconWarning />
          </div>
          <span className="text-white">
            Overwrite Previously Modified Metadata
          </span>
        </div>
        <p className="text-neutrals-gray-5 text-base">
          Would you like to overwrite the metadata of all files in this folder,
          or only edit the metadata for files with unmodified metadata?
        </p>
      </div>
      <Modal.Footer>
        <div className="flex gap-3">
          <ButtonSecondary
            onClick={() => {
              setOverWrite(true);
              setTimeout(() => formRef.current!.submit());
            }}
            disabled={loading}
          >
            {loading && overWrite ? (
              <DefaultSpinner color="black" size={24} />
            ) : (
              "Edit All Files"
            )}
          </ButtonSecondary>
          <PrimaryButton
            disabled={loading}
            onClick={() => {
              setOverWrite(false);
              setTimeout(() => formRef.current!.submit());
            }}
          >
            {loading && !overWrite ? (
              <DefaultSpinner color="black" size={24} />
            ) : (
              "Edit Unmodified Files"
            )}
          </PrimaryButton>
        </div>
      </Modal.Footer>
    </div>
  );
};

export default OverwriteMetadataDialog;
