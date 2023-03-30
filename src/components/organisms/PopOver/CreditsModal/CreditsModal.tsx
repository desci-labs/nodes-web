import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import { FormProvider, useForm } from "react-hook-form";
import {
  AuthorFormValues,
  authorsFormSchema,
  CreditModalProps,
} from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";
import CreditsForm from "./Form";

export default function CreditsModal(props: ModalProps & CreditModalProps) {
  const methods = useForm<AuthorFormValues>({
    mode: "onChange",
    defaultValues: {
      name: props?.author?.name,
      googleScholar: props?.author?.googleScholar ?? "",
      orcid: props?.author?.orcid ?? "",
      orcid1: props?.author?.orcid?.split("-")[0] ?? "",
      orcid2: props?.author?.orcid?.split("-")[1] ?? "",
      orcid3: props?.author?.orcid?.split("-")[2] ?? "",
      orcid4: props?.author?.orcid?.split("-")[3] ?? "",
    },
    reValidateMode: "onChange",
    resolver: yupResolver(authorsFormSchema),
  });

  return (
    <Modal {...props} $maxWidth={650}>
      <div className="px-6 py-5 w-full lg:w-[650px] text-white">
        <Modal.Header
          title="Collaborator Details"
          onDismiss={props.onDismiss}
        />
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
