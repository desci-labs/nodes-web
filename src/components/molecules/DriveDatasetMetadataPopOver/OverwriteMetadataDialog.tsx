import { DataComponent } from "@desci-labs/desci-models";
import ButtonSecondary from "@src/components/atoms/ButtonSecondary";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import PopOverBasic from "@src/components/atoms/PopOverBasic";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import { IconWarning } from "@src/icons";
import React from "react";
import PopoverFooter from "../Footer";

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
    <div>
      <PopOverBasic
        title={
          <div className="flex items-center gap-2">
            <div>
              <IconWarning />
            </div>
            <span>Overwrite Previously Modified Metadata</span>
          </div>
        }
        onClose={() => {
          setShowOverwriteDialog(false);
        }}
        isVisible={true}
        bodyClassNames="min-h-[40px]"
        footer={() =>
          <PopoverFooter>
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
          </PopoverFooter>
        }
      >
        <p className="text-neutrals-gray-5 text-base">
          Would you like to overwrite the metadata of all files in this folder,
          or only edit the metadata for files with unmodified metadata?
        </p>
      </PopOverBasic>
    </div>
  );
};

export default OverwriteMetadataDialog;
