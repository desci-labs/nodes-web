import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import Modal, { ModalProps } from "@src/components/molecules/Modal";
import { FormProvider, useForm } from "react-hook-form";
import {
  AuthorFormValues,
  authorsFormSchema,
  CreditModalProps,
} from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";
import CreditsForm from "./Form";
import { ResearchObjectV1AuthorRole } from "@desci-labs/desci-models";

export default function CreditsModal(props: ModalProps & CreditModalProps) {
  const methods = useForm<AuthorFormValues>({
    mode: "onChange",
    defaultValues: {
      name: props?.author?.name,
      googleScholar: props?.author?.googleScholar ?? "",
      role: props?.author?.role,
      orcid: props?.author?.orcid ?? "",
      github: props?.author?.github ?? "",
      organizations: props?.author?.organizations ?? [],
    },
    reValidateMode: "onChange",
    resolver: yupResolver(authorsFormSchema),
  });

  return (
    <Modal {...props} $maxWidth={650} $scrollOverlay={true}>
      <div className="px-6 py-5 w-full lg:w-[550px] max-w-[550px] text-white">
        <Modal.Header title="Credit Contributor" onDismiss={props.onDismiss} />
        <FormProvider {...methods}>
          <CreditsForm {...props} />
        </FormProvider>
      </div>
      <Modal.Footer>
        <PrimaryButton
          type="submit"
          form="creditsModalForm"
          disabled={
            !methods.formState.isValid ||
            !methods.formState.isDirty ||
            methods.formState.isSubmitting
          }
        >
          {methods.formState.isSubmitting ? (
            <div className="flex flex-row gap-2 items-center w-full justify-center">
              Saving <DefaultSpinner color="black" size={20} />
            </div>
          ) : (
            <span>Save</span>
          )}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
