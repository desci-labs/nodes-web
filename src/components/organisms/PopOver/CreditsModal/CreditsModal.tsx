import { useEffect, useState } from "react";
import { useSetter } from "@src/store/accessors";
import { ResearchObjectV1Author } from "@desci-labs/desci-models";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import { Controller, useForm } from "react-hook-form";
import InsetLabelSmallInput from "@src/components/molecules/FormInputs/InsetLabelSmallInput";
import DividerSimple from "@src/components/atoms/DividerSimple";
import { AuthorFormValues, authorsFormSchema, OrcidPartsKeys } from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";

interface CreditModalProps {
  author?: ResearchObjectV1Author;
}

export default function CreditsModal(props: ModalProps & CreditModalProps) {
  const dispatch = useSetter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    watch,
    control,
    setFocus,
    handleSubmit,
    register,
    formState: { errors, isValid, dirtyFields },
  } = useForm<AuthorFormValues>({
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

  // const name = watch("name");
  console.log("onChange", watch("orcid1"), watch("orcid2"));

  const onSubmit = (data: ResearchObjectV1Author) => {
    props?.onDismiss?.();
  };

  // const orcid = watch("orcid");

  useEffect(() => {
    // console.log("ORCid1 Errors", errors.orcid1);
    if (errors.orcid1) {
      setFocus("orcid1");
    } else if (dirtyFields["orcid1"]) {
      setFocus("orcid2");
    }
  }, [dirtyFields, errors.orcid1, setFocus]);

  useEffect(() => {
    if (errors.orcid2) {
      setFocus("orcid2");
    } else if (dirtyFields["orcid2"]) {
      setFocus("orcid3");
    }
  }, [dirtyFields, errors.orcid2, setFocus]);

  useEffect(() => {
    if (errors.orcid3) {
      setFocus("orcid3");
    } else if (dirtyFields["orcid3"]) {
      setFocus("orcid4");
    }
  }, [dirtyFields, errors.orcid3, setFocus]);

  useEffect(() => {
    if (errors.orcid4) {
      setFocus("orcid4");
    } else if (dirtyFields["orcid4"]) {
      setFocus("googleScholar");
    }
  }, [dirtyFields, errors.orcid4, setFocus]);

  const OrcidInput = ({ name }: { name: OrcidPartsKeys }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InsetLabelSmallInput label="" field={field} ref={register(name).ref} />
      )}
    />
  );

  const canSubmit = !errors["name"] && dirtyFields["name"];
  console.log("Errors", canSubmit, isValid, dirtyFields, errors);

  return (
    <Modal {...props} $maxWidth={650}>
      <div className="px-6 py-5 w-full lg:w-[650px] text-white">
        <Modal.Header
          title="Collaborator Details"
          onDismiss={props.onDismiss}
        />
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
              ORCID{" "}
              <span className="text-sm text-neutrals-gray-4">(optional)</span>
            </span>
            <div className="flex gap-2 items-center justify-evenly max-w-[300px]">
              <OrcidInput name="orcid1" />
              <OrcidInput name="orcid2" />
              <OrcidInput name="orcid3" />
              <OrcidInput name="orcid4" />
            </div>
            <span className="text-red-400 text-xs">
              {errors.orcid?.message}
            </span>
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
      </div>
      <Modal.Footer>
        <PrimaryButton
          type="submit"
          form="creditsModalForm"
          disabled={!canSubmit || !isValid}
        >
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
