import { useState } from "react";
import { useSetter } from "@src/store/accessors";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";

interface CreditModalProps {
  author?: ResearchObjectV1Author;
}

export default function CreditsModal(props: ModalProps & CreditModalProps) {
  const dispatch = useSetter();
  const [isLoading, setIsLoading] = useState(false);

  console.log(props.author);
  return (
    <Modal {...props} $maxWidth={650}>
      <div className="px-6 py-5 w-full lg:w-[650px] text-white">
        <Modal.Header
          title="Collaborator Details"
          onDismiss={props.onDismiss}
        />
        <div className="py-8 px-12">
          <span>Modal body</span>
        </div>
      </div>
      <Modal.Footer>
        <PrimaryButton onClick={() => {}}>
          {isLoading ? (
            <div className="flex flex-row gap-2 items-center w-full justify-center">
              saving <DefaultSpinner color="black" size={20} />
            </div>
          ) : (
            <span>Save</span>
          )}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
