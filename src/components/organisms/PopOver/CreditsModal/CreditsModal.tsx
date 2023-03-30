import { useCallback, useEffect, useState } from "react";
import { useSetter } from "@src/store/accessors";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import DividerSimple from "@src/components/atoms/DividerSimple";
import { AuthorFormValues, authorsFormSchema, OrcidPartsKeys } from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  addNodeAuthor,
  saveManifestDraft,
  updateNodeAuthor,
} from "@src/state/nodes/viewer";

interface CreditModalProps {
  author?: ResearchObjectV1Author;
  id?: number;
}

export default function CreditsModal(props: ModalProps & CreditModalProps) {
  // const dispatch = useSetter();
  // const [isLoading, setIsLoading] = useState(false);

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

  console.log("ISubmitting", methods.formState.isSubmitting);
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

function CreditsForm(props: ModalProps & CreditModalProps) {
  const {
    watch,
    handleSubmit,
    control,
    setValue,
    setFocus,
    register,
    formState: { errors, dirtyFields },
  } = useFormContext<AuthorFormValues>();
  const dispatch = useSetter();

  const onSubmit = async (data: ResearchObjectV1Author) => {
    const { name, googleScholar, orcid } = data;
    if (props.author && props.id !== undefined) {
      dispatch(
        updateNodeAuthor({
          index: props.id,
          update: { name, googleScholar, orcid },
        })
      );
    } else {
      dispatch(addNodeAuthor({ name, googleScholar, orcid }));
    }

    await dispatch(
      saveManifestDraft({
        onSucess: () => {
          props?.onDismiss?.();
        },
        onError: () => {},
      })
    );
  };

  // const orcid = watch("orcid");
  const orcid1 = watch("orcid1");
  const orcid2 = watch("orcid2");
  const orcid3 = watch("orcid3");
  const orcid4 = watch("orcid4");

  const updateOrcid = useCallback(() => {
    const value = `${orcid1}-${orcid2}-${orcid3}-${orcid4}`;
    let invalid = value.split("-").filter(Boolean).length === 0;
    if (invalid) {
      setValue("orcid", "");
    } else {
      setValue("orcid", value);
    }
  }, [orcid1, orcid2, orcid3, orcid4, setValue]);

  useEffect(() => {
    // console.log("ORCid1 Errors", errors.orcid1);
    if (errors.orcid1) {
      setFocus("orcid1");
    } else if (dirtyFields["orcid1"]) {
      updateOrcid();
      setFocus("orcid2");
    }
  }, [dirtyFields, errors.orcid1, setFocus, updateOrcid]);

  useEffect(() => {
    if (errors.orcid2) {
      setFocus("orcid2");
    } else if (dirtyFields["orcid2"]) {
      updateOrcid();
      setFocus("orcid3");
    }
  }, [dirtyFields, errors.orcid2, setFocus, updateOrcid]);

  useEffect(() => {
    if (errors.orcid3) {
      setFocus("orcid3");
    } else if (dirtyFields["orcid3"]) {
      updateOrcid();
      setFocus("orcid4");
    }
  }, [dirtyFields, errors.orcid3, setFocus, updateOrcid]);

  useEffect(() => {
    if (errors.orcid4) {
      setFocus("orcid4");
    } else if (dirtyFields["orcid4"]) {
      updateOrcid();
      setFocus("googleScholar");
    }
  }, [dirtyFields, errors.orcid4, setFocus, updateOrcid]);

  const OrcidInput = ({ name }: { name: OrcidPartsKeys }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InsetLabelSmallInput label="" field={field} ref={register(name).ref} />
      )}
    />
  );

  return (
    <form
      name="creditsModalForm"
      id="creditsModalForm"
      className="w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }: any) => (
          <InsetLabelSmallInput
            label="Full Name"
            field={field}
            optional={false}
            className="my-6 w-full"
          />
        )}
      />
      <DividerSimple />

      <span className="text-xl font-bold mt-6 inline-block capitalize">
        Scientific Identity
      </span>
      <div className="mt-5">
        <span className="text-lg capitalize mb-1 inline-block">
          ORCID <span className="text-sm text-neutrals-gray-4">(optional)</span>
        </span>
        <div className="flex gap-2 items-center justify-evenly max-w-[300px]">
          <OrcidInput name="orcid1" />
          <span className="font-bold">-</span>
          <OrcidInput name="orcid2" />
          <span>-</span>
          <OrcidInput name="orcid3" />
          <span>-</span>
          <OrcidInput name="orcid4" />
        </div>
        <span className="text-red-400 text-xs">{errors.orcid?.message}</span>
      </div>
      <div className="mt-8">
        <Controller
          name="googleScholar"
          control={control}
          render={({ field }) => (
            <InsetLabelSmallInput
              label="Google Scholar Profile"
              field={field}
              ref={register("googleScholar").ref}
            />
          )}
        />
        <span className="text-red-400 text-xs">
          {errors.googleScholar?.message}
        </span>
      </div>
    </form>
  );
}
